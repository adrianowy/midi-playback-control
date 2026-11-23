/**
 * Storage Keys for localStorage persistence
 */

export const STORAGE_KEYS = {
  // Connection configuration
  LAST_IP_ADDRESS: 'midi_playback_last_ip',
  LAST_CONTROL_PORT: 'midi_playback_last_control_port',
  LAST_DATA_PORT: 'midi_playback_last_data_port',
  LAST_SESSION_NAME: 'midi_playback_last_session_name',

  // User preferences
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  AUTO_CONNECT: 'app_auto_connect',

  // Telemetry (Phase 2)
  LAST_CONNECTED_DEVICE: 'midi_playback_last_device',
} as const;
