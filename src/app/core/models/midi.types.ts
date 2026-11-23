/**
 * MIDI message types and interfaces
 */

export enum MidiMessageType {
  NOTE_ON = 0x90,
  NOTE_OFF = 0x80,
  CONTROL_CHANGE = 0xb0,
  PROGRAM_CHANGE = 0xc0,
  PITCH_BEND = 0xe0,
}

export interface MidiMessage {
  status: number;
  data1: number;
  data2: number;
  timestamp?: number;
}

export interface MidiNoteOnMessage extends MidiMessage {
  status: MidiMessageType.NOTE_ON;
  noteNumber: number;
  velocity: number;
}

export interface MidiNoteOffMessage extends MidiMessage {
  status: MidiMessageType.NOTE_OFF;
  noteNumber: number;
  velocity: number;
}

export interface MidiControlChangeMessage extends MidiMessage {
  status: MidiMessageType.CONTROL_CHANGE;
  controller: number;
  value: number;
}

export interface PlaybackControlCommand {
  id: string;
  label: string;
  midiMessage: MidiMessage;
  icon?: string;
  color?: string;
}
