# Naming Conventions — MIDI Playback Control

**All Code Language:** English

---

## File & Folder Names

| Category | Pattern | Example |
|----------|---------|---------|
| **Service files** | `{feature}-{type}.service.ts` | `rtp-midi.service.ts`, `config.service.ts` |
| **Component files** | `{component-name}.component.ts` | `control-panel.component.ts` |
| **Component folder** | Folder contains `.ts`, `.html`, `.scss`, `.spec.ts` | `src/app/features/stage-control/components/control-panel/` |
| **Models/Types** | `{entity}.types.ts` or `{entity}.model.ts` | `midi.types.ts`, `connection.types.ts` |
| **Modules** | `{feature}.module.ts` | `stage-control.module.ts` |
| **Constants** | `{FEATURE}.constants.ts` | `MIDI.constants.ts`, `NETWORK.constants.ts` |
| **Enums** | Inside `.types.ts` or dedicated `.enum.ts` | `ConnectionStatus`, `MidiMessageType` |
| **Tests** | Same name as source + `.spec.ts` | `rtp-midi.service.spec.ts` |

---

## TypeScript Naming

### Classes & Interfaces
```typescript
// Class names: PascalCase
export class RtpMidiService { ... }
export class ControlPanelComponent { ... }
export class ConnectionError extends Error { ... }

// Interface names: PascalCase, optional `I` prefix (discouraged in modern Angular)
export interface ConnectionConfig { ... }
export interface MidiMessage { ... }

// Type aliases: PascalCase
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type MidiCommand = 'noteOn' | 'noteOff' | 'controlChange';
```

### Properties & Methods

#### Services & Classes
```typescript
export class RtpMidiService {
  // Public observable: suffix with $
  connectionStatus$: Observable<ConnectionStatus>;
  
  // Public signal: suffix with Signal
  systemTimeSignal = signal<number>(0);
  
  // Private field: # prefix (ES2022)
  #socketId: string | null = null;
  #keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  
  // Private method: # prefix
  #handshakeInitiation(): Observable<void> { ... }
  #sendKeepAlivePacket(): void { ... }
  
  // Public method: camelCase
  connect(ipAddress: string, port: number): Observable<void> { ... }
  sendMidiCommand(command: MidiMessage): Observable<void> { ... }
  disconnect(): Observable<void> { ... }
}
```

#### Components
```typescript
export class ControlPanelComponent {
  // Input: camelCase
  @Input() isConnected: boolean;
  
  // Output: on{EventName}
  @Output() onPlayClick = new EventEmitter<void>();
  @Output() onStopClick = new EventEmitter<void>();
  
  // Signal: camelCase with Signal suffix (or just camelCase if obvious)
  statusSignal = signal<string>('ready');
  
  // Public property: camelCase
  buttonStates: { [key: string]: boolean };
  
  // Private field: # prefix
  #destroy$ = new Subject<void>();
  
  // Public method: camelCase, verb-first
  handlePlayClick(): void { ... }
  
  // Private method: # prefix
  #setupSubscriptions(): void { ... }
}
```

### Constants
```typescript
// In src/app/core/constants/midi.constants.ts
export const MIDI = {
  // Ports
  CONTROL_PORT: 5004,
  DATA_PORT: 5005,
  
  // Note numbers (use uppercase)
  NOTE_PLAY: 94,
  NOTE_STOP: 95,
  NOTE_NEXT: 96,
  
  // MIDI status bytes
  STATUS_NOTE_ON: 0x90,
  STATUS_NOTE_OFF: 0x80,
  STATUS_CONTROL_CHANGE: 0xB0,
  
  // Velocity (always > 0 for iPad Playback)
  VELOCITY_MAX: 0x7F,
  VELOCITY_DEFAULT: 0x7F,
  VELOCITY_OFF: 0x00,
};

// In src/app/core/constants/network.constants.ts
export const NETWORK = {
  // AppleMIDI magic bytes
  APPLEMIDI_MAGIC: new Uint8Array([0xFF, 0xFF]),
  APPLEMIDI_INVITATION: new Uint8Array([0x49, 0x4E]), // 'IN'
  APPLEMIDI_ACCEPTANCE: new Uint8Array([0x4F, 0x4B]), // 'OK'
  APPLEMIDI_CLOCK_SYNC: new Uint8Array([0x43, 0x4B]), // 'CK'
  
  // Timeouts
  HANDSHAKE_TIMEOUT_MS: 5000,
  KEEP_ALIVE_INTERVAL_MS: 2000,
  RECONNECT_DELAY_MS: 3000,
};
```

### Enums
```typescript
// In src/app/core/models/connection.types.ts
export enum ConnectionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
}

export enum MidiMessageType {
  NOTE_ON = 0x90,
  NOTE_OFF = 0x80,
  CONTROL_CHANGE = 0xB0,
  PROGRAM_CHANGE = 0xC0,
  PITCH_BEND = 0xE0,
}
```

---

## Observables & Subjects

```typescript
// Private destruction subject
private destroy$ = new Subject<void>();

// Observable properties: camelCase + $
connectionStatus$: Observable<ConnectionStatus>;
midiEventsReceived$: Observable<MidiMessage>;
keepAliveStatus$: Observable<{ lastSyncMs: number }>;

// BehaviorSubject for internal state: camelCase + subject suffix
#connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.IDLE);
#receivedPacketsSubject = new Subject<Uint8Array>();
```

---

## Method Naming Patterns

### Lifecycle & Setup
```typescript
ngOnInit(): void { ... }           // Angular lifecycle
ngOnDestroy(): void { ... }        // Angular lifecycle
initialize(): Observable<void> { ... }
teardown(): Observable<void> { ... }
reset(): void { ... }
```

### Network Operations
```typescript
connect(ipAddress: string, port: number): Observable<void> { ... }
disconnect(): Observable<void> { ... }
#performHandshake(): Observable<void> { ... }
#sendPacket(data: Uint8Array): Observable<void> { ... }
#receivePacket(data: Uint8Array): Observable<MidiMessage> { ... }
```

### MIDI Operations
```typescript
sendNoteOn(noteNumber: number, velocity: number): Observable<void> { ... }
sendNoteOff(noteNumber: number): Observable<void> { ... }
sendControlChange(controller: number, value: number): Observable<void> { ... }
#buildMidiPacket(message: MidiMessage): Uint8Array { ... }
#parseIncomingPacket(data: Uint8Array): MidiMessage { ... }
```

### UI/Handler Methods
```typescript
handlePlayClick(): void { ... }
handleStopClick(): void { ... }
handleSectionSelect(sectionIndex: number): void { ... }
displayConnectionError(error: Error): void { ... }
#updateConnectionIndicator(): void { ... }
```

### Validation & Helper
```typescript
isValidIpAddress(ip: string): boolean { ... }
isConnected(): boolean { ... }
#validateMidiMessage(msg: MidiMessage): boolean { ... }
#calculateRtpHeader(): Uint8Array { ... }
```

---

## Reactive State Naming

### RxJS Patterns
```typescript
// Observables from services
connectionStatus$: Observable<ConnectionStatus>;
midiReceived$: Observable<MidiMessage>;
systemError$: Observable<Error | null>;

// Signals in components
connectionStatus = signal<ConnectionStatus>(ConnectionStatus.IDLE);
isLoading = signal<boolean>(false);
errorMessage = signal<string | null>(null);

// Computed signals
isConnected = computed(() => this.connectionStatus() === ConnectionStatus.CONNECTED);
canSendCommands = computed(() => this.isConnected() && !this.isLoading());
```

---

## Error Classes

```typescript
// In src/app/core/models/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ConnectionError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
  }
}

export class MidiProtocolError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'MIDI_PROTOCOL_ERROR', originalError);
  }
}

export class HandshakeError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'HANDSHAKE_ERROR', originalError);
  }
}
```

---

## URL & Route Naming

```typescript
// In app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: 'connection', pathMatch: 'full' },
  { path: 'connection', component: ConnectionSetupPage },
  { path: 'stage-control', component: StageControlPage },
  { path: 'settings', component: SettingsPage },
  { path: '**', redirectTo: 'connection' },
];
```

---

## Example: Full Service Structure

```typescript
// src/app/core/services/rtp-midi.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MIDI, NETWORK } from '../constants';

@Injectable({ providedIn: 'root' })
export class RtpMidiService {
  // ===== Observables (Public) =====
  connectionStatus$: Observable<ConnectionStatus>;
  midiReceived$: Observable<MidiMessage>;

  // ===== Private Fields =====
  #socketId: string | null = null;
  #keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  #destroy$ = new Subject<void>();

  // ===== Subject for internal state =====
  #connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(
    ConnectionStatus.IDLE
  );
  #midiReceivedSubject = new Subject<MidiMessage>();

  constructor() {
    this.connectionStatus$ = this.#connectionStatusSubject.asObservable();
    this.midiReceived$ = this.#midiReceivedSubject.asObservable();
  }

  // ===== Public Methods =====

  connect(ipAddress: string, port: number): Observable<void> {
    return new Observable(observer => {
      // Implementation
    });
  }

  sendNoteOn(noteNumber: number, velocity: number): Observable<void> {
    return new Observable(observer => {
      // Implementation
    });
  }

  disconnect(): Observable<void> {
    return new Observable(observer => {
      // Implementation
    });
  }

  // ===== Private Methods =====

  #performHandshake(): Observable<void> {
    return new Observable(observer => {
      // Implementation
    });
  }

  #sendKeepAlivePacket(): void {
    // Implementation
  }

  #parseIncomingPacket(data: Uint8Array): MidiMessage {
    // Implementation
  }
}
```

---

**Last Updated:** 2026-11-23  
**Apply these rules consistently across all new files.**
