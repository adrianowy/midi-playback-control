/**
 * OSC (Open Sound Control) Constants
 */

export const OSC = {
  // Local listener port
  LOCAL_LISTEN_PORT: 9000,

  // OSC Address Patterns (future use - Phase 2)
  ADDRESSES: {
    PLAYBACK_STATUS: '/playback/status',
    TRACK_INFO: '/track/info',
    TIME_POSITION: '/time/position',
    SECTION_CHANGE: '/section/change',
    TEMPO: '/tempo',
  },

  // OSC Type Tags
  TYPES: {
    INT32: 'i',
    FLOAT32: 'f',
    STRING: 's',
    BLOB: 'b',
  },

  // Message parsing
  TYPE_TAG_PREFIX: ',',
  NULL_TERMINATOR: 0x00,
  ALIGNMENT: 4,
} as const;
