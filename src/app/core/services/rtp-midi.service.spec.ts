import { RtpMidiService } from './rtp-midi.service';
import { NETWORK } from '../constants/network.constants';
import { MIDI } from '../constants/midi.constants';
import { ConnectionStatus } from '../models/connection.types';

describe('RtpMidiService', () => {
  let service: RtpMidiService;

  beforeEach(() => {
    service = new RtpMidiService();
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connectionStatus$', () => {
    it('should emit initial IDLE status', (done) => {
      service.connectionStatus$.subscribe((status) => {
        expect(status).toBe(ConnectionStatus.IDLE);
        done();
      });
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('sendNoteOn', () => {
    it('should reject velocity of 0', (done) => {
      service.sendNoteOn(94, 0).subscribe({
        error: (error) => {
          expect(error.message).toContain(
            'Velocity cannot be 0 for Note On command'
          );
          done();
        },
      });
    });

    it('should accept velocity > 0', (done) => {
      // Note: This will fail to send because we're not connected,
      // but it should validate velocity first
      service.sendNoteOn(94, 0x7f).subscribe({
        error: (error) => {
          expect(error.message).toContain('Not connected');
          done();
        },
      });
    });
  });

  describe('Binary packet builders', () => {
    it('should build valid invitation packet', () => {
      // Access private method via any for testing
      const service_any = service as any;
      const packet = service_any.#buildInvitationPacket(0x12345678, 0x87654321);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBeGreaterThanOrEqual(20);

      const view = new DataView(packet.buffer);
      // Check signature (0xFFFF)
      expect(view.getUint16(0, false)).toBe(NETWORK.APPLEMIDI_SIGNATURE);
      // Check command ('IN' = 0x494E)
      expect(view.getUint16(2, false)).toBe(NETWORK.APPLEMIDI_INVITATION);
      // Check protocol version
      expect(view.getUint32(4, false)).toBe(NETWORK.APPLEMIDI_PROTOCOL_VERSION);
      // Check initiator token
      expect(view.getUint32(8, false)).toBe(0x12345678);
      // Check SSRC
      expect(view.getUint32(12, false)).toBe(0x87654321);
    });

    it('should build valid MIDI Note On message', () => {
      const service_any = service as any;
      const noteOn = service_any.#buildNoteOnMessage(94, 0x7f);

      expect(noteOn).toBeInstanceOf(Uint8Array);
      expect(noteOn.length).toBe(3);
      expect(noteOn[0]).toBe(MIDI.STATUS_NOTE_ON);
      expect(noteOn[1]).toBe(94);
      expect(noteOn[2]).toBe(0x7f);
    });

    it('should build valid MIDI Note Off message', () => {
      const service_any = service as any;
      const noteOff = service_any.#buildNoteOffMessage(94);

      expect(noteOff).toBeInstanceOf(Uint8Array);
      expect(noteOff.length).toBe(3);
      expect(noteOff[0]).toBe(MIDI.STATUS_NOTE_OFF);
      expect(noteOff[1]).toBe(94);
      expect(noteOff[2]).toBe(0x00);
    });

    it('should build valid MIDI Control Change message', () => {
      const service_any = service as any;
      const cc = service_any.#buildControlChangeMessage(7, 100);

      expect(cc).toBeInstanceOf(Uint8Array);
      expect(cc.length).toBe(3);
      expect(cc[0]).toBe(MIDI.STATUS_CONTROL_CHANGE);
      expect(cc[1]).toBe(7);
      expect(cc[2]).toBe(100);
    });

    it('should build valid clock sync packet', () => {
      const service_any = service as any;
      const packet = service_any.#buildClockSyncPacket(0x87654321, 0);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBe(12);

      const view = new DataView(packet.buffer);
      expect(view.getUint16(0, false)).toBe(NETWORK.APPLEMIDI_SIGNATURE);
      expect(view.getUint16(2, false)).toBe(NETWORK.APPLEMIDI_CLOCK_SYNC);
      expect(view.getUint32(4, false)).toBe(0x87654321);
      expect(view.getUint8(8)).toBe(0);
    });
  });

  describe('IP validation', () => {
    it('should validate correct IPv4 addresses', (done) => {
      // This should proceed to connection logic (which will fail without UDP plugin)
      service.connect('192.168.1.100', 5004, 5005).subscribe({
        error: () => {
          // Expected to fail at handshake, not IP validation
          done();
        },
      });
    });

    it('should reject invalid IPv4 addresses', (done) => {
      service.connect('999.999.999.999', 5004, 5005).subscribe({
        error: (error) => {
          expect(error.message).toContain('Invalid IP address');
          done();
        },
      });
    });
  });
});
