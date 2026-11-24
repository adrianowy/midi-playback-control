import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "name": "midi-playback-control",
  "plugins": {
    "@capacitor/splashscreen": {
      "launchShowDuration": 0
    }
  },
  "server": {
    "hostname": "localhost",
    "iosScheme": "capacitor",
    "androidScheme": "https"
  },
  "appId": "com.adrianowy.midiplaybackcontrol",
  "appName": "MIDI Playback Control",
  "webDir": "dist/midi-playback-control",
  "bundledWebRuntime": false
};

export default config;
