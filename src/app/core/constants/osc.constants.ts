/**
 * OSC (Open Sound Control) Constants
 */

export const OSC = {
  // Local listener port
  LOCAL_LISTEN_PORT: 9000,

  // OSC Address Patterns (Phase 2 - Telemetry from iPad Playback)
  ADDRESSES: {
    // Track information
    TRACK_INFO: '/playback/track/info',
    TRACK_NAME: '/playback/track/name',
    TRACK_ARTIST: '/playback/track/artist',
    TRACK_ALBUM: '/playback/track/album',

    // Time information
    TIME_POSITION: '/playback/time/position',
    TIME_TOTAL: '/playback/time/total',
    PLAYBACK_STATUS: '/playback/status',

    // Section and structure
    SECTION_CHANGE: '/playback/section/change',
    SECTION_INDEX: '/playback/section/index',

    // Musical parameters
    TEMPO: '/playback/tempo',
    TEMPO_BPM: '/playback/bpm',
    TIME_SIGNATURE: '/playback/signature',

    // Loop and repeat state
    LOOP_ACTIVE: '/playback/loop/active',
    REPEAT_COUNT: '/playback/repeat/count',

    // Pad states
    PAD_STATE_PREFIX: '/playback/pad/',
  },

  // OSC Type Tags
  TYPES: {
    INT32: 'i',
    FLOAT32: 'f',
    STRING: 's',
    BLOB: 'b',
    TRUE: 'T',
    FALSE: 'F',
    NULL: 'N',
  },

  // Message parsing
  TYPE_TAG_PREFIX: ',',
  NULL_TERMINATOR: 0x00,
  ALIGNMENT: 4,

  // Buffer management
  MAX_MESSAGE_SIZE: 65536,
  MAX_BUFFER_SIZE: 100,

  // Timing
  KEEP_ALIVE_INTERVAL: 5000,
  MESSAGE_TIMEOUT: 30000,
} as const;
