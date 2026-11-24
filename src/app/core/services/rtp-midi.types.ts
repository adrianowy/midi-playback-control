/**
 * RTP-MIDI (AppleMIDI - RFC 6295) Protocol Types and Interfaces
 */

/**
 * Configuration for RTP-MIDI connection
 */
export interface RtpMidiConfig {
  ipAddress: string;
  controlPort: number; // Usually 5004
  dataPort: number; // Usually 5005 (controlPort + 1)
}

/**
 * AppleMIDI command signatures (network byte order)
 */
export enum AppleMidiCommand {
  INVITATION = 0xffff494e, // 'IN'
  ACCEPTANCE = 0xffff4f4b, // 'OK'
  REJECTION = 0xffff4e4f, // 'NO'
  END_SESSION = 0xffffby, // 'BY'
  SYNCHRONIZATION = 0xffffck, // 'CK'
  RECEIVER_FEEDBACK = 0xffffrs, // 'RS'
}

/**
 * MIDI Commands
 */
export enum MidiCommand {
  NOTE_OFF = 0x80,
  NOTE_ON = 0x90,
  CONTROL_CHANGE = 0xb0,
  PROGRAM_CHANGE = 0xc0,
  CHANNEL_PRESSURE = 0xd0,
  PITCH_BEND = 0xe0,
}

/**
 * MIDI Control Change Numbers (CC)
 */
export enum MidiControlChange {
  PLAY = 0x01,
  PAUSE = 0x02,
  STOP = 0x03,
  NEXT = 0x04,
  PREVIOUS = 0x05,
}

/**
 * MIDI Note Numbers for Playback
 */
export enum PlaybackNote {
  PLAY = 0x3c, // Middle C (60)
  PAUSE = 0x3d, // C#4 (61)
  STOP = 0x3e, // D4 (62)
  NEXT = 0x3f, // D#4 (63)
  PREVIOUS = 0x40, // E4 (64)
  LOOP_SECTION = 0x41, // F4 (65)
  REPEAT = 0x42, // F#4 (66)
  LOOP_INFINITY = 0x43, // G4 (67)
}

/**
 * RTP-MIDI Session state
 */
export enum SessionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  HANDSHAKE_CONTROL = 'handshake_control',
  HANDSHAKE_DATA = 'handshake_data',
  ERROR = 'error',
}

/**
 * RTP-MIDI packet structure
 */
export interface RtpPacket {
  version: number;
  padding: boolean;
  extension: boolean;
  csrcCount: number;
  marker: boolean;
  payloadType: number;
  sequenceNumber: number;
  timestamp: number;
  ssrc: number;
  payload: Uint8Array;
}

/**
 * AppleMIDI invitation packet structure
 */
export interface AppleMidiInvitation {
  command: number; // 0xFFFF494E (IN)
  version: number;
  initiatorToken: number;
  ssrc: number;
  sessionName?: string;
}
