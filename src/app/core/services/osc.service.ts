/**
 * OSC (Open Sound Control) Service
 *
 * Handles bidirectional communication with iPad Playback via OSC.
 * OSC runs over UDP and provides lightweight real-time telemetry exchange.
 *
 * Uses Angular Signals for reactive state management.
 */

import { Injectable, signal, computed, effect } from '@angular/core';

import {
  OscMessage,
  OscPlaybackStatus,
  OscListenerConfig,
  OscError,
  OscErrorType,
} from '../models/osc.types';
import { OscParser } from './osc.parser';

/**
 * Session states for OSC listener
 */
export enum OscSessionState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED',
}

/**
 * Default OSC configuration
 */
const DEFAULT_OSC_CONFIG: OscListenerConfig = {
  localPort: 9000,
  remoteIp: '192.168.1.100',
  remotePort: 9000,
  enableLogging: false,
  timeout: 5000,
};

@Injectable({
  providedIn: 'root',
})
export class OscService {
  private config: OscListenerConfig = DEFAULT_OSC_CONFIG;
  private udpSocket: any = null;
  private messageBuffer = signal<OscMessage[]>([]);
  private readonly MAX_BUFFER_SIZE = 100;

  /**
   * Signal for parsed OSC messages
   */
  private messageSignal = signal<OscMessage | null>(null);
  readonly message = this.messageSignal.asReadonly();

  /**
   * Signal for playback status updates
   */
  readonly playbackStatus = signal<OscPlaybackStatus>({});

  /**
   * Signal for session state changes
   */
  readonly sessionState = signal<OscSessionState>(OscSessionState.IDLE);

  /**
   * Signal for errors
   */
  private errorSignal = signal<OscError | null>(null);
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for checking if currently listening
   */
  readonly isListening = computed(
    () => this.sessionState() === OscSessionState.LISTENING
  );

  /**
   * Computed signal for checking if there's an active error
   */
  readonly hasError = computed(() => this.sessionState() === OscSessionState.ERROR);

  constructor() {
    this.initializeEffects();
  }

  /**
   * Initialize reactive effects
   */
  private initializeEffects(): void {
    effect(() => {
      const message = this.message();
      if (message) {
        this.addToMessageBuffer(message);
        const status = OscParser.extractPlaybackStatus(message);
        const current = this.playbackStatus();
        this.playbackStatus.set({ ...current, ...status });

        if (this.config.enableLogging) {
          console.log('OSC Message:', message);
        }
      }
    });

    effect(() => {
      const error = this.error();
      if (error) {
        console.error('OSC Error:', error);
        this.sessionState.set(OscSessionState.ERROR);
      }
    });
  }

  /**
   * Start listening for OSC messages from iPad Playback
   * @param config Optional OSC configuration (uses defaults if not provided)
   */
  async startListening(config?: Partial<OscListenerConfig>): Promise<void> {
    try {
      this.config = { ...DEFAULT_OSC_CONFIG, ...config };
      this.sessionState.set(OscSessionState.LISTENING);

      this.startUdpListener();
    } catch (error) {
      const oscError = new OscError(
        OscErrorType.CONNECTION_ERROR,
        `Failed to start OSC listener on port ${this.config.localPort}: ${error}`
      );
      this.errorSignal.set(oscError);
      throw oscError;
    }
  }

  /**
   * Stop listening for OSC messages
   */
  async stopListening(): Promise<void> {
    try {
      if (this.udpSocket) {
        this.udpSocket = null;
      }
      this.sessionState.set(OscSessionState.CLOSED);
    } catch (error) {
      const oscError = new OscError(
        OscErrorType.SOCKET_ERROR,
        `Error closing OSC socket: ${error}`
      );
      this.errorSignal.set(oscError);
      throw oscError;
    }
  }

  /**
   * Initialize UDP listener
   * This creates a UDP socket and starts listening for incoming messages
   */
  private startUdpListener(): void {
    // TODO: Implement UDP socket using @capacitor-community/udp
    // const { UDPSocket } = await import('@capacitor-community/udp');
    // this.udpSocket = new UDPSocket({
    //   address: '0.0.0.0',
    //   port: this.config.localPort,
    // });
    // await this.udpSocket.create();
    // this.listenForMessages();
  }

  /**
   * Listen for incoming UDP messages
   * This method continuously receives messages from the socket
   */
  private async listenForMessages(): Promise<void> {
    if (!this.udpSocket) return;

    try {
      while (this.udpSocket) {
        // Placeholder: In production, use this.udpSocket.receiveString()
        // const { buffer } = await this.udpSocket.receiveString();
        // if (buffer) {
        //   this.handleIncomingData(buffer);
        // }
      }
    } catch (error) {
      if (this.udpSocket) {
        const oscError = new OscError(
          OscErrorType.SOCKET_ERROR,
          `Error receiving OSC message: ${error}`
        );
        this.errorSignal.set(oscError);
      }
    }
  }

  /**
   * Process incoming UDP data
   * @param data Raw binary data from UDP packet
   */
  public handleIncomingData(
    data: string | Uint8Array | ArrayBuffer
  ): void {
    try {
      let uint8Data: Uint8Array;

      if (typeof data === 'string') {
        uint8Data = new TextEncoder().encode(data);
      } else if (data instanceof ArrayBuffer) {
        uint8Data = new Uint8Array(data);
      } else {
        uint8Data = data;
      }

      const timestamp = Date.now();
      const message = OscParser.parseMessage(uint8Data, timestamp);
      this.messageSignal.set(message);
    } catch (error) {
      const oscError =
        error instanceof OscError
          ? error
          : new OscError(
              OscErrorType.PARSE_ERROR,
              `Error parsing OSC message: ${error}`
            );
      this.errorSignal.set(oscError);
    }
  }

  /**
   * Get current playback status
   */
  getCurrentStatus(): OscPlaybackStatus {
    return this.playbackStatus();
  }

  /**
   * Get current session state
   */
  getCurrentSessionState(): OscSessionState {
    return this.sessionState();
  }

  /**
   * Get buffered messages (last N messages)
   */
  getMessageBuffer(): OscMessage[] {
    return this.messageBuffer();
  }

  /**
   * Clear message buffer
   */
  clearMessageBuffer(): void {
    this.messageBuffer.set([]);
  }

  /**
   * Reset status to empty state
   */
  resetStatus(): void {
    this.playbackStatus.set({});
  }

  /**
   * Get configuration
   */
  getConfig(): OscListenerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (must stop listening before updating)
   */
  updateConfig(config: Partial<OscListenerConfig>): void {
    if (this.isListening()) {
      throw new Error('Cannot update config while listening. Stop first.');
    }
    this.config = { ...this.config, ...config };
  }

  /**
   * Add message to circular buffer
   */
  private addToMessageBuffer(message: OscMessage): void {
    const buffer = this.messageBuffer();
    const updated = [...buffer, message];
    if (updated.length > this.MAX_BUFFER_SIZE) {
      updated.shift();
    }
    this.messageBuffer.set(updated);
  }
}
