/**
 * OSC (Open Sound Control) message types and interfaces
 * RFC 5OSC - https://opensoundcontrol.org/spec-1_0
 */

export type OscTypeTag = 'i' | 'f' | 's' | 'b' | 'T' | 'F' | 'N';
export type OscArgumentValue = string | number | Uint8Array | boolean | null;

export interface OscMessage {
  address: string;
  typeTag: string;
  args: OscArgumentValue[];
  timestamp: number;
}

export interface OscArgument {
  type: OscTypeTag;
  value: OscArgumentValue;
}

export enum PlaybackState {
  STOPPED = 0,
  PLAYING = 1,
  PAUSED = 2,
}

export interface OscPlaybackStatus {
  trackId?: number;
  trackName?: string;
  timePosition?: number;
  timeDuration?: number;
  isPlaying?: boolean;
  currentSection?: string;
  bpm?: number;
  signature?: string;
  loopActive?: boolean;
  repeatCount?: number;
  padStates?: boolean[];
  state?: PlaybackState;
}

export interface OscListenerConfig {
  localPort: number;
  remoteIp?: string;
  remotePort?: number;
  enableLogging?: boolean;
  timeout?: number;
}

export enum OscErrorType {
  SOCKET_ERROR = 'SOCKET_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
}

export class OscError extends Error {
  constructor(
    public type: OscErrorType,
    message: string,
    public address?: string
  ) {
    super(message);
    this.name = 'OscError';
  }
}
