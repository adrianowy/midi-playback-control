/**
 * OSC Service Unit Tests
 */

import { TestBed } from '@angular/core/testing';
import { OscService, OscSessionState } from './osc.service';
import { OscListenerConfig, OscPlaybackStatus } from '../models/osc.types';

describe('OscService', () => {
  let service: OscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OscService);
  });

  afterEach(async () => {
    await service.stopListening();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start in IDLE state', () => {
      expect(service.getCurrentSessionState()).toBe(OscSessionState.IDLE);
    });

    it('should have empty playback status initially', () => {
      expect(service.getCurrentStatus()).toEqual({});
    });

    it('should not be listening initially', () => {
      expect(service.isListening()).toBe(false);
    });
  });

  describe('startListening', () => {
    it('should change state to LISTENING', async () => {
      await service.startListening({ localPort: 9000 });
      expect(service.getCurrentSessionState()).toBe(OscSessionState.LISTENING);
    });

    it('should use default config if none provided', async () => {
      await service.startListening();
      const config = service.getConfig();
      expect(config.localPort).toBe(9000);
    });

    it('should merge provided config with defaults', async () => {
      const customConfig: Partial<OscListenerConfig> = { localPort: 8000 };
      await service.startListening(customConfig);
      const config = service.getConfig();
      expect(config.localPort).toBe(8000);
    });

    it('should enable logging if specified', async () => {
      await service.startListening({ enableLogging: true });
      const config = service.getConfig();
      expect(config.enableLogging).toBe(true);
    });
  });

  describe('stopListening', () => {
    it('should change state to CLOSED', async () => {
      await service.startListening();
      await service.stopListening();
      expect(service.getCurrentSessionState()).toBe(OscSessionState.CLOSED);
    });

    it('should not throw error if not listening', async () => {
      expect(async () => await service.stopListening()).not.toThrow();
    });
  });

  describe('handleIncomingData', () => {
    it('should emit message on data received', (done) => {
      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      service.message$.subscribe((message) => {
        expect(message.address).toBe('/test');
        done();
      });

      service.handleIncomingData(data);
    });

    it('should extract playback status from message', (done) => {
      const data = new Uint8Array(32);
      let offset = 0;

      // Build /playback/track/info ,s Amazing Grace message
      const address = '/playback/track/info';
      new TextEncoder().encodeInto(address, data.subarray(offset));
      offset += address.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      const typeTag = ',s';
      new TextEncoder().encodeInto(typeTag, data.subarray(offset));
      offset += typeTag.length + 1;
      offset = Math.ceil(offset / 4) * 4;

      const arg = 'Amazing Grace';
      new TextEncoder().encodeInto(arg, data.subarray(offset));

      service.playbackStatus$.subscribe((status) => {
        if (status.trackName) {
          expect(status.trackName).toBe('Amazing Grace');
          done();
        }
      });

      service.handleIncomingData(data);
    });

    it('should handle string data input', (done) => {
      service.message$.subscribe((message) => {
        expect(message.address).toBe('/test');
        done();
      });

      const data = '/test';
      service.handleIncomingData(data);
    });

    it('should handle ArrayBuffer input', (done) => {
      service.message$.subscribe((message) => {
        expect(message.address).toBe('/test');
        done();
      });

      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      service.handleIncomingData(data.buffer);
    });

    it('should emit error on parse failure', (done) => {
      service.error$.subscribe((error) => {
        expect(error).toBeTruthy();
        done();
      });

      const invalidData = new Uint8Array(1); // Too small
      service.handleIncomingData(invalidData);
    });
  });

  describe('getCurrentStatus', () => {
    it('should return current playback status', () => {
      const status = service.getCurrentStatus();
      expect(status).toEqual({});
    });
  });

  describe('resetStatus', () => {
    it('should clear playback status', async () => {
      await service.startListening();
      service.resetStatus();
      expect(service.getCurrentStatus()).toEqual({});
    });
  });

  describe('getMessageBuffer', () => {
    it('should return empty buffer initially', () => {
      const buffer = service.getMessageBuffer();
      expect(buffer.length).toBe(0);
    });

    it('should accumulate messages in buffer', (done) => {
      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      let count = 0;
      service.message$.subscribe(() => {
        count++;
        if (count === 2) {
          const buffer = service.getMessageBuffer();
          expect(buffer.length).toBe(2);
          done();
        }
      });

      service.handleIncomingData(data);
      service.handleIncomingData(data);
    });
  });

  describe('clearMessageBuffer', () => {
    it('should clear the message buffer', (done) => {
      const data = new Uint8Array(32);
      const address = '/test';
      new TextEncoder().encodeInto(address, data);

      let count = 0;
      service.message$.subscribe(() => {
        count++;
        if (count === 1) {
          service.clearMessageBuffer();
          expect(service.getMessageBuffer().length).toBe(0);
          done();
        }
      });

      service.handleIncomingData(data);
    });
  });

  describe('configuration', () => {
    it('should not allow config update while listening', async () => {
      await service.startListening();
      expect(() => service.updateConfig({ localPort: 8000 })).toThrow();
    });

    it('should allow config update after stopping', async () => {
      await service.startListening();
      await service.stopListening();
      expect(() => service.updateConfig({ localPort: 8000 })).not.toThrow();
      expect(service.getConfig().localPort).toBe(8000);
    });
  });

  describe('error handling', () => {
    it('should emit error observable', (done) => {
      service.error$.subscribe((error) => {
        expect(error).toBeTruthy();
        done();
      });

      const invalidData = new Uint8Array(1);
      service.handleIncomingData(invalidData);
    });

    it('should change state to ERROR on parse error', (done) => {
      service.error$.subscribe(() => {
        expect(service.getCurrentSessionState()).toBe(OscSessionState.ERROR);
        done();
      });

      const invalidData = new Uint8Array(1);
      service.handleIncomingData(invalidData);
    });

    it('should indicate error state with hasError', (done) => {
      service.error$.subscribe(() => {
        expect(service.hasError()).toBe(true);
        done();
      });

      const invalidData = new Uint8Array(1);
      service.handleIncomingData(invalidData);
    });
  });

  describe('cleanup', () => {
    it('should clean up on destroy', async () => {
      await service.startListening();
      service.ngOnDestroy();
      // Service should be cleaned up without errors
      expect(service).toBeTruthy();
    });
  });
});
