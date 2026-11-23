/**
 * OSC (Open Sound Control) message types
 */

export type OscTypeTag = 'i' | 'f' | 's' | 'b';

export interface OscMessage {
  address: string;
  typeTag: string;
  args: (number | string | Uint8Array)[];
}

export interface OscPlaybackStatus {
  trackId: number;
  trackName: string;
  timePosition: number;
  timeDuration: number;
  isPlaying: boolean;
  currentSection: string;
}

export interface OscListenerConfig {
  localPort: number;
  enableLogging?: boolean;
}
