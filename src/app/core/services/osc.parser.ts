/**
 * OSC Message Parser
 *
 * Parses binary OSC messages received over UDP according to RFC 5OSC.
 * OSC messages consist of:
 * 1. Address pattern (OSC string)
 * 2. Type tag string starting with ',' (OSC string)
 * 3. Arguments (zero or more)
 *
 * All OSC strings must be null-terminated and padded to 4-byte boundary.
 */

import {
  OscMessage,
  OscTypeTag,
  OscArgumentValue,
  OscPlaybackStatus,
  PlaybackState,
  OscError,
  OscErrorType,
} from '../models/osc.types';
import { OSC } from '../constants/osc.constants';

export class OscParser {
  /**
   * Parse a binary OSC message from UDP packet data
   * @param data Raw binary data from UDP socket
   * @param timestamp Milliseconds since epoch when message arrived
   * @returns Parsed OscMessage
   * @throws OscError if message is malformed
   */
  static parseMessage(data: Uint8Array, timestamp: number): OscMessage {
    let offset = 0;

    const address = this.readString(data, offset);
    if (!address.startsWith('/')) {
      throw new OscError(
        OscErrorType.INVALID_ADDRESS,
        `Invalid OSC address: ${address}`,
        address
      );
    }

    offset = this.alignOffset(offset + address.length + 1);

    const typeTagString = this.readString(data, offset);
    if (!typeTagString.startsWith(OSC.TYPE_TAG_PREFIX)) {
      throw new OscError(
        OscErrorType.PARSE_ERROR,
        'Missing type tag string',
        address
      );
    }

    offset = this.alignOffset(offset + typeTagString.length + 1);

    const args: OscArgumentValue[] = [];
    const types = typeTagString.slice(1);

    for (const typeChar of types) {
      const type = typeChar as OscTypeTag;

      if (
        ![
          OSC.TYPES.INT32,
          OSC.TYPES.FLOAT32,
          OSC.TYPES.STRING,
          OSC.TYPES.BLOB,
          'T',
          'F',
          'N',
        ].includes(type)
      ) {
        throw new OscError(
          OscErrorType.UNSUPPORTED_TYPE,
          `Unsupported OSC type: ${typeChar}`,
          address
        );
      }

      const result = this.parseArgument(data, offset, type, address);
      args.push(result.value);
      offset = result.nextOffset;
    }

    return {
      address,
      typeTag: typeTagString,
      args,
      timestamp,
    };
  }

  /**
   * Parse individual OSC argument by type
   */
  private static parseArgument(
    data: Uint8Array,
    offset: number,
    type: OscTypeTag,
    address: string
  ): { value: OscArgumentValue; nextOffset: number } {
    switch (type) {
      case OSC.TYPES.INT32:
        return {
          value: this.readInt32(data, offset),
          nextOffset: offset + 4,
        };

      case OSC.TYPES.FLOAT32:
        return {
          value: this.readFloat32(data, offset),
          nextOffset: offset + 4,
        };

      case OSC.TYPES.STRING:
        const str = this.readString(data, offset);
        return {
          value: str,
          nextOffset: this.alignOffset(offset + str.length + 1),
        };

      case OSC.TYPES.BLOB: {
        const size = this.readInt32(data, offset);
        const blob = data.slice(offset + 4, offset + 4 + size);
        return {
          value: blob,
          nextOffset: this.alignOffset(offset + 4 + size),
        };
      }

      case 'T':
        return {
          value: true,
          nextOffset: offset,
        };

      case 'F':
        return {
          value: false,
          nextOffset: offset,
        };

      case 'N':
        return {
          value: null,
          nextOffset: offset,
        };

      default:
        throw new OscError(
          OscErrorType.UNSUPPORTED_TYPE,
          `Unsupported OSC type: ${type}`,
          address
        );
    }
  }

  /**
   * Read null-terminated OSC string from buffer
   */
  private static readString(data: Uint8Array, offset: number): string {
    let end = offset;
    while (end < data.length && data[end] !== OSC.NULL_TERMINATOR) {
      end++;
    }

    if (end >= data.length) {
      throw new OscError(OscErrorType.PARSE_ERROR, 'Unterminated OSC string');
    }

    const str = new TextDecoder().decode(data.slice(offset, end));
    return str;
  }

  /**
   * Read 32-bit big-endian signed integer
   */
  private static readInt32(data: Uint8Array, offset: number): number {
    if (offset + 4 > data.length) {
      throw new OscError(OscErrorType.PARSE_ERROR, 'Buffer overflow');
    }

    return (
      ((data[offset] << 24) |
        (data[offset + 1] << 16) |
        (data[offset + 2] << 8) |
        data[offset + 3]) >>>
      0
    );
  }

  /**
   * Read 32-bit big-endian float (IEEE 754)
   */
  private static readFloat32(data: Uint8Array, offset: number): number {
    if (offset + 4 > data.length) {
      throw new OscError(OscErrorType.PARSE_ERROR, 'Buffer overflow');
    }

    const view = new DataView(data.buffer, data.byteOffset + offset, 4);
    return view.getFloat32(0, false);
  }

  /**
   * Align offset to next 4-byte boundary (OSC requirement)
   */
  private static alignOffset(offset: number): number {
    return Math.ceil(offset / OSC.ALIGNMENT) * OSC.ALIGNMENT;
  }

  /**
   * Extract playback telemetry from OSC message
   * Accumulates values from message into OscPlaybackStatus object
   */
  static extractPlaybackStatus(message: OscMessage): Partial<OscPlaybackStatus> {
    const status: Partial<OscPlaybackStatus> = {};

    switch (message.address) {
      case OSC.ADDRESSES.TRACK_INFO:
        status.trackName = this.getStringValue(message, 0);
        break;

      case OSC.ADDRESSES.TIME_POSITION:
        status.timePosition = this.getNumericValue(message, 0);
        break;

      case OSC.ADDRESSES.PLAYBACK_STATUS:
        status.isPlaying = this.getBoolValue(message, 0);
        status.timeDuration = this.getNumericValue(message, 1);
        status.timePosition = this.getNumericValue(message, 2);
        break;

      case OSC.ADDRESSES.SECTION_CHANGE:
        status.currentSection = this.getStringValue(message, 0);
        break;

      case OSC.ADDRESSES.TEMPO:
        status.bpm = this.getNumericValue(message, 0);
        break;
    }

    return status;
  }

  /**
   * Helper to safely get string value from message
   */
  private static getStringValue(
    message: OscMessage,
    index: number
  ): string | undefined {
    const arg = message.args[index];
    return typeof arg === 'string' ? arg : undefined;
  }

  /**
   * Helper to safely get numeric value from message
   */
  private static getNumericValue(
    message: OscMessage,
    index: number
  ): number | undefined {
    const arg = message.args[index];
    return typeof arg === 'number' ? arg : undefined;
  }

  /**
   * Helper to safely get boolean value from message
   */
  private static getBoolValue(
    message: OscMessage,
    index: number
  ): boolean | undefined {
    const arg = message.args[index];
    return typeof arg === 'boolean' ? arg : undefined;
  }
}
