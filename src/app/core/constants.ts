/**
 * Network constants for AppleMIDI (RFC 6295) protocol
 */
export const NETWORK = {
  // AppleMIDI signature and commands
  APPLEMIDI_SIGNATURE: 0xffff,
  APPLEMIDI_INVITATION: 0x494e, // 'IN'
  APPLEMIDI_ACCEPTANCE: 0x4f4b, // 'OK'
  APPLEMIDI_REJECTION: 0x4e4f, // 'NO'
  APPLEMIDI_END_SESSION: 0x4259, // 'BY'
  APPLEMIDI_CLOCK_SYNC: 0x434b, // 'CK'

  // Protocol version
  APPLEMIDI_PROTOCOL_VERSION: 2,

  // RTP constants
  RTP_HEADER_SIZE: 12,
  RTP_MIDI_COMMAND_HEADER: 2,
  RTP_PAYLOAD_TYPE_MIDI: 0x61,

  // Timeouts and intervals
  HANDSHAKE_TIMEOUT_MS: 5000,
  KEEP_ALIVE_INTERVAL_MS: 10000,

  // UDP ports
  CONTROL_PORT_DEFAULT: 5004,
  DATA_PORT_DEFAULT: 5005,
};

/**
 * MIDI constants (note numbers, controller numbers, status bytes)
 */
export const MIDI = {
  // Status bytes
  STATUS_NOTE_OFF: 0x80,
  STATUS_NOTE_ON: 0x90,
  STATUS_CONTROL_CHANGE: 0xb0,
  STATUS_PROGRAM_CHANGE: 0xc0,
  STATUS_CHANNEL_PRESSURE: 0xd0,
  STATUS_PITCH_BEND: 0xe0,

  // Velocities
  VELOCITY_DEFAULT: 0x7f,
  VELOCITY_MAX: 0x7f,
  VELOCITY_MIN: 0x01,
  VELOCITY_OFF: 0x00,

  // Common note numbers
  NOTE_C4: 0x3c, // Middle C (60)
  NOTE_C5: 0x48, // 72
  NOTE_C6: 0x54, // 84

  // Controller numbers
  CC_VOLUME: 0x07,
  CC_SUSTAIN: 0x40,
  CC_MOD_WHEEL: 0x01,
  CC_PAN: 0x0a,
};
