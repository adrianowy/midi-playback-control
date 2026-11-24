/**
 * OSC Parser Unit Tests
 */

import { OscParser } from './osc.parser';
import { OscError, OscErrorType } from '../models/osc.types';
import { OSC } from '../constants/osc.constants';

describe('OscParser', () => {
  describe('parseMessage', () => {
    it('should parse simple OSC message with string argument', () => {
      // Build message: /test ,s hello
      const data = new Uint8Array(32);
      let offset = 0;

      // Address: /test
      const address = '/test';
      new TextEncoder().encodeInto(address, data.subarray(offset));
      offset += address.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // Type tag: ,s
      const typeTag = ',s';
      new TextEncoder().encodeInto(typeTag, data.subarray(offset));
      offset += typeTag.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // String argument: hello
      const arg = 'hello';
      new TextEncoder().encodeInto(arg, data.subarray(offset));
      offset += arg.length + 1;

      const message = OscParser.parseMessage(data, Date.now());

      expect(message.address).toBe('/test');
      expect(message.typeTag).toBe(',s');
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('hello');
    });

    it('should parse message with integer argument', () => {
      // Build message: /int ,i 42
      const data = new Uint8Array(32);
      let offset = 0;

      // Address
      const address = '/int';
      new TextEncoder().encodeInto(address, data.subarray(offset));
      offset += address.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // Type tag
      const typeTag = ',i';
      new TextEncoder().encodeInto(typeTag, data.subarray(offset));
      offset += typeTag.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // Integer value (big-endian)
      const value = 42;
      data[offset] = (value >> 24) & 0xff;
      data[offset + 1] = (value >> 16) & 0xff;
      data[offset + 2] = (value >> 8) & 0xff;
      data[offset + 3] = value & 0xff;

      const message = OscParser.parseMessage(data, Date.now());

      expect(message.address).toBe('/int');
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(42);
    });

    it('should parse message with float argument', () => {
      // Build message: /float ,f 3.14
      const data = new Uint8Array(32);
      let offset = 0;

      // Address
      const address = '/float';
      new TextEncoder().encodeInto(address, data.subarray(offset));
      offset += address.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // Type tag
      const typeTag = ',f';
      new TextEncoder().encodeInto(typeTag, data.subarray(offset));
      offset += typeTag.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      // Float value
      const view = new DataView(data.buffer);
      view.setFloat32(offset, 3.14, false);

      const message = OscParser.parseMessage(data, Date.now());

      expect(message.address).toBe('/float');
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBeCloseTo(3.14, 2);
    });

    it('should throw error for invalid address', () => {
      const data = new Uint8Array(32);
      const invalidAddress = 'notanaddress';
      new TextEncoder().encodeInto(invalidAddress, data);

      expect(() => OscParser.parseMessage(data, Date.now())).toThrowError(
        /Invalid OSC address/
      );
    });

    it('should throw error for missing type tag', () => {
      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      expect(() => OscParser.parseMessage(data, Date.now())).toThrowError(
        /Missing type tag string/
      );
    });

    it('should throw error for unsupported type', () => {
      // Build message with unsupported type 'x'
      const data = new Uint8Array(32);
      let offset = 0;

      const address = '/test';
      new TextEncoder().encodeInto(address, data.subarray(offset));
      offset += address.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      const typeTag = ',x'; // Invalid type
      new TextEncoder().encodeInto(typeTag, data.subarray(offset));

      expect(() => OscParser.parseMessage(data, Date.now())).toThrowError(
        /Unsupported OSC type/
      );
    });

    it('should include timestamp in parsed message', () => {
      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      const timestamp = 1234567890;
      const message = OscParser.parseMessage(data, timestamp);

      expect(message.timestamp).toBe(timestamp);
    });
  });

  describe('extractPlaybackStatus', () => {
    it('should extract track name from TRACK_INFO message', () => {
      const message = {
        address: OSC.ADDRESSES.TRACK_INFO,
        typeTag: ',s',
        args: ['Amazing Grace'],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(status.trackName).toBe('Amazing Grace');
    });

    it('should extract time position from TIME_POSITION message', () => {
      const message = {
        address: OSC.ADDRESSES.TIME_POSITION,
        typeTag: ',f',
        args: [45.5],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(status.timePosition).toBe(45.5);
    });

    it('should extract playback status from PLAYBACK_STATUS message', () => {
      const message = {
        address: OSC.ADDRESSES.PLAYBACK_STATUS,
        typeTag: ',Tff',
        args: [true, 300.0, 45.5],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(status.isPlaying).toBe(true);
      expect(status.timeDuration).toBe(300.0);
      expect(status.timePosition).toBe(45.5);
    });

    it('should extract section from SECTION_CHANGE message', () => {
      const message = {
        address: OSC.ADDRESSES.SECTION_CHANGE,
        typeTag: ',s',
        args: ['Verso 1'],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(status.currentSection).toBe('Verso 1');
    });

    it('should extract tempo from TEMPO message', () => {
      const message = {
        address: OSC.ADDRESSES.TEMPO,
        typeTag: ',f',
        args: [120.0],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(status.bpm).toBe(120.0);
    });

    it('should return empty object for unknown address', () => {
      const message = {
        address: '/unknown/path',
        typeTag: ',s',
        args: ['value'],
        timestamp: Date.now(),
      };

      const status = OscParser.extractPlaybackStatus(message);

      expect(Object.keys(status).length).toBe(0);
    });
  });
});
