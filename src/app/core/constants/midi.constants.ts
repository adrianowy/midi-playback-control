/**
 * MIDI Protocol Constants
 */

export const MIDI = {
  // Ports
  CONTROL_PORT: 5004,
  DATA_PORT: 5005,

  // Note numbers for playback control
  NOTE_PLAY: 94,
  NOTE_STOP: 95,
  NOTE_NEXT: 96,
  NOTE_PREVIOUS: 97,
  NOTE_SECTION_A: 60,
  NOTE_SECTION_B: 61,
  NOTE_SECTION_C: 62,
  NOTE_LOOP_ON: 70,
  NOTE_LOOP_OFF: 71,

  // MIDI Status bytes
  STATUS_NOTE_ON: 0x90,
  STATUS_NOTE_OFF: 0x80,
  STATUS_CONTROL_CHANGE: 0xb0,
  STATUS_PROGRAM_CHANGE: 0xc0,
  STATUS_PITCH_BEND: 0xe0,

  // Velocity constraints
  VELOCITY_DEFAULT: 0x7f, // 127
  VELOCITY_MAX: 0x7f, // 127
  VELOCITY_OFF: 0x00, // ⚠️ NEVER use for Note On on iPad Playback

  // Channel (always channel 1 for simplicity)
  CHANNEL: 0,
} as const;
