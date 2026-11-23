import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MIDI, NETWORK } from '../constants';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { ConnectionConfig } from '../models/connection.types';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private #config$ = new BehaviorSubject<ConnectionConfig>({
    ipAddress: this.#loadStoredIpAddress(),
    controlPort: this.#loadStoredControlPort(),
    dataPort: this.#loadStoredDataPort(),
    sessionName: this.#loadStoredSessionName(),
    persistToStorage: true,
  });

  constructor() {}

  /**
   * Get current configuration as observable
   */
  getConfig(): Observable<ConnectionConfig> {
    return this.#config$.asObservable();
  }

  /**
   * Get current configuration synchronously
   */
  getConfigSync(): ConnectionConfig {
    return this.#config$.value;
  }

  /**
   * Update configuration and persist to storage
   */
  updateConfig(config: Partial<ConnectionConfig>): void {
    const current = this.#config$.value;
    const updated: ConnectionConfig = { ...current, ...config };

    if (updated.persistToStorage) {
      this.#persistToStorage(updated);
    }

    this.#config$.next(updated);
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    const defaults: ConnectionConfig = {
      ipAddress: '',
      controlPort: MIDI.CONTROL_PORT,
      dataPort: MIDI.DATA_PORT,
      sessionName: NETWORK.DEFAULT_SESSION_NAME,
      persistToStorage: true,
    };

    localStorage.removeItem(STORAGE_KEYS.LAST_IP_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.LAST_CONTROL_PORT);
    localStorage.removeItem(STORAGE_KEYS.LAST_DATA_PORT);
    localStorage.removeItem(STORAGE_KEYS.LAST_SESSION_NAME);

    this.#config$.next(defaults);
  }

  #loadStoredIpAddress(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_IP_ADDRESS) || '';
  }

  #loadStoredControlPort(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_CONTROL_PORT);
    return stored ? parseInt(stored, 10) : MIDI.CONTROL_PORT;
  }

  #loadStoredDataPort(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_DATA_PORT);
    return stored ? parseInt(stored, 10) : MIDI.DATA_PORT;
  }

  #loadStoredSessionName(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_SESSION_NAME) || NETWORK.DEFAULT_SESSION_NAME;
  }

  #persistToStorage(config: ConnectionConfig): void {
    localStorage.setItem(STORAGE_KEYS.LAST_IP_ADDRESS, config.ipAddress);
    localStorage.setItem(STORAGE_KEYS.LAST_CONTROL_PORT, config.controlPort.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_DATA_PORT, config.dataPort.toString());
    if (config.sessionName) {
      localStorage.setItem(STORAGE_KEYS.LAST_SESSION_NAME, config.sessionName);
    }
  }
}
