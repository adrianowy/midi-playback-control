import { ConfigService } from './config.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { MIDI } from '../constants/midi.constants';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    service = new ConfigService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfig', () => {
    it('should return configuration as Observable', (done) => {
      const config = service.getConfig();
      config.subscribe((result) => {
        expect(result).toBeDefined();
        expect(result.ipAddress).toBe('');
        expect(result.controlPort).toBe(MIDI.CONTROL_PORT);
        expect(result.dataPort).toBe(MIDI.DATA_PORT);
        done();
      });
    });
  });

  describe('getConfigSync', () => {
    it('should return configuration synchronously', () => {
      const config = service.getConfigSync();
      expect(config).toBeDefined();
      expect(config.controlPort).toBe(MIDI.CONTROL_PORT);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      service.updateConfig({
        ipAddress: '192.168.1.100',
        controlPort: 5004,
      });

      const config = service.getConfigSync();
      expect(config.ipAddress).toBe('192.168.1.100');
      expect(config.controlPort).toBe(5004);
    });

    it('should persist to localStorage when persistToStorage is true', () => {
      service.updateConfig({
        ipAddress: '192.168.1.100',
        persistToStorage: true,
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_IP_ADDRESS,
        '192.168.1.100'
      );
    });
  });

  describe('resetConfig', () => {
    it('should reset configuration to defaults', () => {
      service.updateConfig({
        ipAddress: '192.168.1.100',
      });

      service.resetConfig();
      const config = service.getConfigSync();

      expect(config.ipAddress).toBe('');
      expect(config.controlPort).toBe(MIDI.CONTROL_PORT);
      expect(config.dataPort).toBe(MIDI.DATA_PORT);
    });

    it('should clear localStorage items', () => {
      service.resetConfig();

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_IP_ADDRESS
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_CONTROL_PORT
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_DATA_PORT
      );
    });
  });
});
