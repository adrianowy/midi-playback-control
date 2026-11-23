import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OSC } from '../constants/osc.constants';
import { OscListenerConfig, OscMessage } from '../models/osc.types';

/**
 * OscService handles Open Sound Control (OSC) for telemetry and state feedback.
 * Currently a framework for Phase 2 - receives playback status from iPad.
 *
 * Key responsibilities:
 * - Listen for OSC messages on a local UDP port
 * - Parse OSC address patterns and type tags
 * - Emit parsed messages to subscribers
 * - Handle connection/disconnection to OSC sender (iPad)
 */
@Injectable({
  providedIn: 'root',
})
export class OscService implements OnDestroy {
  // ===== Public Observables =====
  oscMessageReceived$: Observable<OscMessage>;

  // ===== Private Fields =====
  #destroy$ = new Subject<void>();
  #oscMessageSubject = new Subject<OscMessage>();
  #isListening = false;
  #listenerConfig: OscListenerConfig | null = null;

  constructor() {
    this.oscMessageReceived$ = this.#oscMessageSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  /**
   * Start listening for OSC messages on local UDP port
   */
  startListening(config: OscListenerConfig): Observable<void> {
    return new Observable(observer => {
      if (this.#isListening) {
        observer.next();
        observer.complete();
        return;
      }

      this.#listenerConfig = config;
      this.#isListening = true;

      // TODO: Implement UDP listener setup with @capacitor-community/udp
      // 1. Open UDP socket on localPort
      // 2. Register message handler
      // 3. Parse incoming OSC packets
      // 4. Emit to #oscMessageSubject

      if (config.enableLogging) {
        console.log(`OSC Listener started on port ${config.localPort}`);
      }

      observer.next();
      observer.complete();
    });
  }

  /**
   * Stop listening for OSC messages
   */
  stopListening(): void {
    if (!this.#isListening) {
      return;
    }

    // TODO: Close UDP socket and cleanup listeners

    this.#isListening = false;
    this.#listenerConfig = null;
  }

  /**
   * Parse raw UDP packet as OSC message
   * @internal
   */
  parseOscPacket(packet: Uint8Array): OscMessage | null {
    try {
      let offset = 0;

      // Read address (null-terminated string)
      const addressEnd = packet.indexOf(0, offset);
      if (addressEnd === -1) {
        return null;
      }

      const addressBytes = packet.slice(offset, addressEnd);
      const address = new TextDecoder().decode(addressBytes);
      offset = Math.ceil((addressEnd + 1) / OSC.ALIGNMENT) * OSC.ALIGNMENT;

      // Read type tag string (null-terminated, starts with comma)
      const typeTagEnd = packet.indexOf(0, offset);
      if (typeTagEnd === -1) {
        return null;
      }

      const typeTagBytes = packet.slice(offset, typeTagEnd);
      const typeTagStr = new TextDecoder().decode(typeTagBytes);
      offset = Math.ceil((typeTagEnd + 1) / OSC.ALIGNMENT) * OSC.ALIGNMENT;

      // Parse arguments based on type tags
      const args: (number | string | Uint8Array)[] = [];
      const view = new DataView(packet.buffer);

      // Skip comma in type tag
      const startIdx = typeTagStr.startsWith(OSC.TYPE_TAG_PREFIX) ? 1 : 0;

      for (let i = startIdx; i < typeTagStr.length; i++) {
        const type = typeTagStr[i];

        switch (type) {
          case OSC.TYPES.INT32:
            if (offset + 4 <= packet.length) {
              args.push(view.getInt32(offset, false));
              offset += 4;
            }
            break;

          case OSC.TYPES.FLOAT32:
            if (offset + 4 <= packet.length) {
              args.push(view.getFloat32(offset, false));
              offset += 4;
            }
            break;

          case OSC.TYPES.STRING:
            const strEnd = packet.indexOf(0, offset);
            if (strEnd !== -1) {
              const strBytes = packet.slice(offset, strEnd);
              args.push(new TextDecoder().decode(strBytes));
              offset = Math.ceil((strEnd + 1) / OSC.ALIGNMENT) * OSC.ALIGNMENT;
            }
            break;

          case OSC.TYPES.BLOB:
            if (offset + 4 <= packet.length) {
              const blobSize = view.getUint32(offset, false);
              offset += 4;
              if (offset + blobSize <= packet.length) {
                args.push(packet.slice(offset, offset + blobSize));
                offset += blobSize;
                offset = Math.ceil(offset / OSC.ALIGNMENT) * OSC.ALIGNMENT;
              }
            }
            break;
        }
      }

      return {
        address,
        typeTag: typeTagStr,
        args,
      };
    } catch (error) {
      console.error('Failed to parse OSC packet:', error);
      return null;
    }
  }

  /**
   * Check if currently listening for OSC messages
   */
  isListening(): boolean {
    return this.#isListening;
  }
}
