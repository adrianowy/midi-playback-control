import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError, timeout } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { MIDI } from '../constants/midi.constants';
import { NETWORK } from '../constants/network.constants';
import { ConnectionError, HandshakeError, MidiProtocolError, NetworkTimeoutError } from '../models/errors';
import { AppleMidiHandshakeState, ConnectionStatus } from '../models/connection.types';
import { MidiMessage } from '../models/midi.types';

/**
 * RtpMidiService handles AppleMIDI (RFC 6295) protocol for UDP MIDI communication.
 * Manages handshake, session lifecycle, and MIDI command transmission to iPad Playback.
 *
 * Key responsibilities:
 * - AppleMIDI handshake on control port (5004) and data port (5005)
 * - Session keep-alive with clock sync packets
 * - MIDI command serialization and transmission
 * - Error handling and automatic reconnection
 *
 * Uses Angular Signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class RtpMidiService implements OnDestroy {
  // ===== Public Observables (Legacy - for backward compatibility) =====
  connectionStatus$: Observable<ConnectionStatus>;
  midiReceived$: Observable<MidiMessage>;

  // ===== Public Signals =====
  readonly connectionStatus = signal<ConnectionStatus>(ConnectionStatus.IDLE);
  readonly midiReceived = signal<MidiMessage | null>(null);
  readonly isConnected = computed(
    () => this.connectionStatus() === ConnectionStatus.CONNECTED
  );
  readonly isConnecting = computed(
    () => this.connectionStatus() === ConnectionStatus.CONNECTING
  );
  readonly hasError = computed(() => this.connectionStatus() === ConnectionStatus.ERROR);

  // ===== Private Fields =====
  #destroy$ = new Subject<void>();
  #connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.IDLE);
  #midiReceivedSubject = new Subject<MidiMessage>();

  // Connection state
  #socketId: string | null = null;
  #remoteIpAddress: string | null = null;
  #remoteControlPort: number | null = null;
  #remoteDataPort: number | null = null;

  // Handshake state
  #handshakeState: AppleMidiHandshakeState | null = null;
  #keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  #rtpSequenceNumber = 0;

  constructor() {
    // Legacy Observable support
    this.connectionStatus$ = this.#connectionStatusSubject.asObservable();
    this.midiReceived$ = this.#midiReceivedSubject.asObservable();

    // Keep signals and observables in sync
    this.#initializeEffects();
  }

  /**
   * Initialize reactive effects to sync signals with observables
   */
  #initializeEffects(): void {
    effect(() => {
      const status = this.connectionStatus();
      this.#connectionStatusSubject.next(status);
    });

    effect(() => {
      const midi = this.midiReceived();
      if (midi) {
        this.#midiReceivedSubject.next(midi);
      }
    });
  }

  ngOnDestroy(): void {
    this.disconnect().subscribe({
      complete: () => {
        this.#destroy$.next();
        this.#destroy$.complete();
      },
    });
  }

  /**
   * Initiate connection to iPad Playback
   * Performs complete AppleMIDI handshake on both ports
   */
  connect(ipAddress: string, controlPort: number, dataPort: number): Observable<void> {
    return new Observable(observer => {
      // Validation
      if (!this.#isValidIpAddress(ipAddress)) {
        const error = new ConnectionError(`Invalid IP address: ${ipAddress}`);
        this.#updateStatus(ConnectionStatus.ERROR);
        observer.error(error);
        return;
      }

      this.#updateStatus(ConnectionStatus.CONNECTING);
      this.#remoteIpAddress = ipAddress;
      this.#remoteControlPort = controlPort;
      this.#remoteDataPort = dataPort;

      // Initialize handshake state
      this.#handshakeState = {
        controlPortHandshakeComplete: false,
        dataPortHandshakeComplete: false,
        initiatorToken: this.#generateRandomUint32(),
        remoteSSRC: 0,
        localSSRC: this.#generateRandomUint32(),
      };

      // Step 1: Handshake on control port
      this.#performControlPortHandshake()
        .pipe(
          timeout(NETWORK.HANDSHAKE_TIMEOUT_MS),
          catchError(error => {
            this.#updateStatus(ConnectionStatus.ERROR);
            return throwError(
              () => new HandshakeError(`Control port handshake failed: ${error.message}`, error)
            );
          }),
          takeUntil(this.#destroy$)
        )
        .subscribe({
          next: () => {
            // Step 2: Handshake on data port
            this.#performDataPortHandshake()
              .pipe(
                timeout(NETWORK.HANDSHAKE_TIMEOUT_MS),
                catchError(error => {
                  this.#updateStatus(ConnectionStatus.ERROR);
                  return throwError(
                    () =>
                      new HandshakeError(`Data port handshake failed: ${error.message}`, error)
                  );
                }),
                takeUntil(this.#destroy$)
              )
              .subscribe({
                next: () => {
                  // Step 3: Start keep-alive
                  this.#startKeepAlive();
                  this.#updateStatus(ConnectionStatus.CONNECTED);
                  observer.next();
                  observer.complete();
                },
                error: err => observer.error(err),
              });
          },
          error: err => observer.error(err),
        });
    });
  }

  /**
   * Gracefully disconnect from iPad
   */
  disconnect(): Observable<void> {
    return new Observable(observer => {
      if (this.#connectionStatusSubject.value === ConnectionStatus.IDLE) {
        observer.next();
        observer.complete();
        return;
      }

      this.#updateStatus(ConnectionStatus.DISCONNECTING);

      // Stop keep-alive
      this.#stopKeepAlive();

      // Send BYE packet
      if (this.#handshakeState) {
        const byePacket = this.#buildByePacket(this.#handshakeState.localSSRC);
        // TODO: Send bye packet via UDP
      }

      // Reset state
      this.#socketId = null;
      this.#remoteIpAddress = null;
      this.#remoteControlPort = null;
      this.#remoteDataPort = null;
      this.#handshakeState = null;

      this.#updateStatus(ConnectionStatus.IDLE);
      observer.next();
      observer.complete();
    });
  }

  /**
   * Send MIDI Note On command
   */
  sendNoteOn(noteNumber: number, velocity: number = MIDI.VELOCITY_DEFAULT): Observable<void> {
    if (velocity === 0) {
      return throwError(
        () =>
          new MidiProtocolError(
            'Velocity cannot be 0 for Note On command (iPad Playback requirement)'
          )
      );
    }

    const midiMessage = this.#buildNoteOnMessage(noteNumber, velocity);
    return this.#sendMidiCommand(midiMessage);
  }

  /**
   * Send MIDI Note Off command
   */
  sendNoteOff(noteNumber: number): Observable<void> {
    const midiMessage = this.#buildNoteOffMessage(noteNumber);
    return this.#sendMidiCommand(midiMessage);
  }

  /**
   * Send MIDI Control Change command
   */
  sendControlChange(controller: number, value: number): Observable<void> {
    const midiMessage = this.#buildControlChangeMessage(controller, value);
    return this.#sendMidiCommand(midiMessage);
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.#connectionStatusSubject.value === ConnectionStatus.CONNECTED;
  }

  // ===== Private Methods =====

  #performControlPortHandshake(): Observable<void> {
    return new Observable(observer => {
      if (!this.#handshakeState) {
        observer.error(new HandshakeError('Handshake state not initialized'));
        return;
      }

      const invitePacket = this.#buildInvitationPacket(
        this.#handshakeState.initiatorToken,
        this.#handshakeState.localSSRC
      );

      // TODO: Send invitePacket to remoteIpAddress:remoteControlPort
      // TODO: Listen for acceptance packet and validate

      // For now, simulate handshake
      setTimeout(() => {
        this.#handshakeState!.controlPortHandshakeComplete = true;
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  #performDataPortHandshake(): Observable<void> {
    return new Observable(observer => {
      if (!this.#handshakeState) {
        observer.error(new HandshakeError('Handshake state not initialized'));
        return;
      }

      const invitePacket = this.#buildInvitationPacket(
        this.#handshakeState.initiatorToken,
        this.#handshakeState.localSSRC
      );

      // TODO: Send invitePacket to remoteIpAddress:remoteDataPort
      // TODO: Listen for acceptance packet and validate

      // For now, simulate handshake
      setTimeout(() => {
        this.#handshakeState!.dataPortHandshakeComplete = true;
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  #sendMidiCommand(midiMessage: Uint8Array): Observable<void> {
    return new Observable(observer => {
      if (!this.isConnected()) {
        observer.error(new ConnectionError('Not connected to Playback device'));
        return;
      }

      // TODO: Wrap in RTP header and send via UDP to data port
      observer.next();
      observer.complete();
    });
  }

  #startKeepAlive(): void {
    if (this.#keepAliveInterval) {
      clearInterval(this.#keepAliveInterval);
    }

    let clockCount = 0;

    this.#keepAliveInterval = setInterval(() => {
      if (this.#handshakeState) {
        const clockPacket = this.#buildClockSyncPacket(this.#handshakeState.localSSRC, clockCount);
        // TODO: Send clockPacket to control port
        clockCount = (clockCount + 1) % 3;
      }
    }, NETWORK.KEEP_ALIVE_INTERVAL_MS);
  }

  #stopKeepAlive(): void {
    if (this.#keepAliveInterval) {
      clearInterval(this.#keepAliveInterval);
      this.#keepAliveInterval = null;
    }
  }

  #buildInvitationPacket(initiatorToken: number, localSSRC: number): Uint8Array {
    const packet = new Uint8Array(20);
    const view = new DataView(packet.buffer);

    // Bytes 0-1: Signature (0xFFFF)
    view.setUint16(0, NETWORK.APPLEMIDI_SIGNATURE, false);

    // Bytes 2-3: Command ('IN' = 0x494E)
    view.setUint16(2, NETWORK.APPLEMIDI_INVITATION, false);

    // Bytes 4-7: Protocol version (0x00000002)
    view.setUint32(4, NETWORK.APPLEMIDI_PROTOCOL_VERSION, false);

    // Bytes 8-11: Initiator token
    view.setUint32(8, initiatorToken, false);

    // Bytes 12-15: SSRC (Synchronization Source)
    view.setUint32(12, localSSRC, false);

    // Bytes 16-19: Session name length (0 for MVP)
    view.setUint32(16, 0, false);

    return packet;
  }

  #buildAcceptancePacket(initiatorToken: number, localSSRC: number): Uint8Array {
    const packet = new Uint8Array(20);
    const view = new DataView(packet.buffer);

    view.setUint16(0, NETWORK.APPLEMIDI_SIGNATURE, false);
    view.setUint16(2, NETWORK.APPLEMIDI_ACCEPTANCE, false);
    view.setUint32(4, NETWORK.APPLEMIDI_PROTOCOL_VERSION, false);
    view.setUint32(8, initiatorToken, false);
    view.setUint32(12, localSSRC, false);
    view.setUint32(16, 0, false);

    return packet;
  }

  #buildClockSyncPacket(localSSRC: number, count: number): Uint8Array {
    const packet = new Uint8Array(12);
    const view = new DataView(packet.buffer);

    view.setUint16(0, NETWORK.APPLEMIDI_SIGNATURE, false);
    view.setUint16(2, NETWORK.APPLEMIDI_CLOCK_SYNC, false);
    view.setUint32(4, localSSRC, false);
    view.setUint8(8, count % 3);

    return packet;
  }

  #buildByePacket(localSSRC: number): Uint8Array {
    const packet = new Uint8Array(8);
    const view = new DataView(packet.buffer);

    view.setUint16(0, NETWORK.APPLEMIDI_SIGNATURE, false);
    view.setUint16(2, NETWORK.APPLEMIDI_BYE, false);
    view.setUint32(4, localSSRC, false);

    return packet;
  }

  #buildNoteOnMessage(noteNumber: number, velocity: number): Uint8Array {
    return new Uint8Array([MIDI.STATUS_NOTE_ON, noteNumber, velocity]);
  }

  #buildNoteOffMessage(noteNumber: number): Uint8Array {
    return new Uint8Array([MIDI.STATUS_NOTE_OFF, noteNumber, 0x00]);
  }

  #buildControlChangeMessage(controller: number, value: number): Uint8Array {
    return new Uint8Array([MIDI.STATUS_CONTROL_CHANGE, controller, value]);
  }

  #buildRtpHeader(midiPayload: Uint8Array): Uint8Array {
    const headerSize = NETWORK.RTP_HEADER_SIZE + NETWORK.RTP_MIDI_COMMAND_HEADER;
    const packet = new Uint8Array(headerSize + midiPayload.length);
    const view = new DataView(packet.buffer);

    // Byte 0: V=2, P=0, X=0, CC=0
    view.setUint8(0, 0x80);

    // Byte 1: M=0, PT=97 (0x61 for MIDI)
    view.setUint8(1, NETWORK.RTP_PAYLOAD_TYPE_MIDI);

    // Bytes 2-3: Sequence number
    view.setUint16(2, this.#rtpSequenceNumber++, false);

    // Bytes 4-7: Timestamp (90 kHz clock)
    const timestamp = Math.floor(Date.now() * 90);
    view.setUint32(4, timestamp, false);

    // Bytes 8-11: SSRC
    if (this.#handshakeState) {
      view.setUint32(8, this.#handshakeState.localSSRC, false);
    }

    // Byte 12: Command section header (0x00)
    view.setUint8(12, 0x00);

    // Byte 13: Command (0x00 for journal)
    view.setUint8(13, 0x00);

    // Remaining: MIDI payload
    packet.set(midiPayload, headerSize);

    return packet;
  }

  #isValidIpAddress(ip: string): boolean {
    const ipv4Regex =
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    return ipv4Regex.test(ip);
  }

  #generateRandomUint32(): number {
    return Math.floor(Math.random() * 0xffffffff);
  }

  #updateStatus(status: ConnectionStatus): void {
    this.connectionStatus.set(status);
    this.#connectionStatusSubject.next(status);
  }
}
