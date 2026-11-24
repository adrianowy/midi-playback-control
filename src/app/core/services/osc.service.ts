/**
 * OSC (Open Sound Control) Service
 *
 * Handles bidirectional communication with iPad Playback via OSC.
 * OSC runs over UDP and provides lightweight real-time telemetry exchange.
 *
 * This service:
 * 1. Opens a UDP listener on local port for incoming OSC messages
 * 2. Parses OSC messages received from iPad Playback
 * 3. Extracts telemetry data and publishes via RxJS Observables
 * 4. Maintains playback state reactively
 */

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class OscService implements OnDestroy {
  private config: OscListenerConfig = DEFAULT_OSC_CONFIG;
  private udpSocket: any = null;
  private messageBuffer: OscMessage[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  /**
   * Observable stream of parsed OSC messages
   */
  private messageSubject = new Subject<OscMessage>();
  public message$ = this.messageSubject.asObservable();

  /**
   * Observable stream of playback status updates
   */
  private statusSubject = new BehaviorSubject<OscPlaybackStatus>({});
  public playbackStatus$ = this.statusSubject.asObservable();

  /**
   * Observable for session state changes
   */
  private sessionStateSubject = new BehaviorSubject<OscSessionState>(
    OscSessionState.IDLE
  );
  public sessionState$ = this.sessionStateSubject.asObservable();

  /**
   * Observable for errors
   */
  private errorSubject = new Subject<OscError>();
  public error$ = this.errorSubject.asObservable();

  /**
   * Cleanup subject for memory management
   */
  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeListeners();
  }

  /**
   * Initialize internal listeners
   */
  private initializeListeners(): void {
    this.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.addToMessageBuffer(message);
        const status = OscParser.extractPlaybackStatus(message);
        const current = this.statusSubject.value;
        this.statusSubject.next({ ...current, ...status });

        if (this.config.enableLogging) {
          console.log('OSC Message:', message);
        }
      });

    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        console.error('OSC Error:', error);
        this.sessionStateSubject.next(OscSessionState.ERROR);
      });
  }

  /**
   * Start listening for OSC messages from iPad Playback
   * @param config Optional OSC configuration (uses defaults if not provided)
   */
  async startListening(config?: Partial<OscListenerConfig>): Promise<void> {
    try {
      this.config = { ...DEFAULT_OSC_CONFIG, ...config };
      this.sessionStateSubject.next(OscSessionState.LISTENING);

      // Note: Actual UDP socket implementation requires @capacitor-community/udp
      // which provides the UDPSocket class. This is a placeholder that emulates
      // the listening behavior. In production, integrate with the UDP plugin.
      this.startUdpListener();
    } catch (error) {
      const oscError = new OscError(
        OscErrorType.CONNECTION_ERROR,
        `Failed to start OSC listener on port ${this.config.localPort}: ${error}`
      );
      this.errorSubject.next(oscError);
      throw oscError;
    }
  }

  /**
   * Stop listening for OSC messages
   */
  async stopListening(): Promise<void> {
    try {
      if (this.udpSocket) {
        // Close UDP socket if available
        this.udpSocket = null;
      }
      this.sessionStateSubject.next(OscSessionState.CLOSED);
    } catch (error) {
      const oscError = new OscError(
        OscErrorType.SOCKET_ERROR,
        `Error closing OSC socket: ${error}`
      );
      this.errorSubject.next(oscError);
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
        this.errorSubject.next(oscError);
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
      this.messageSubject.next(message);
    } catch (error) {
      const oscError =
        error instanceof OscError
          ? error
          : new OscError(
              OscErrorType.PARSE_ERROR,
              `Error parsing OSC message: ${error}`
            );
      this.errorSubject.next(oscError);
    }
  }

  /**
   * Get current playback status
   */
  getCurrentStatus(): OscPlaybackStatus {
    return this.statusSubject.value;
  }

  /**
   * Get current session state
   */
  getCurrentSessionState(): OscSessionState {
    return this.sessionStateSubject.value;
  }

  /**
   * Get buffered messages (last N messages)
   */
  getMessageBuffer(): OscMessage[] {
    return [...this.messageBuffer];
  }

  /**
   * Clear message buffer
   */
  clearMessageBuffer(): void {
    this.messageBuffer = [];
  }

  /**
   * Reset status to empty state
   */
  resetStatus(): void {
    this.statusSubject.next({});
  }

  /**
   * Check if currently listening for messages
   */
  isListening(): boolean {
    return this.sessionStateSubject.value === OscSessionState.LISTENING;
  }

  /**
   * Check if there's an active error
   */
  hasError(): boolean {
    return this.sessionStateSubject.value === OscSessionState.ERROR;
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
    this.messageBuffer.push(message);
    if (this.messageBuffer.length > this.MAX_BUFFER_SIZE) {
      this.messageBuffer.shift();
    }
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.stopListening().catch();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
