/**
 * Custom error classes for domain-specific error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ConnectionError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class MidiProtocolError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'MIDI_PROTOCOL_ERROR', originalError);
    Object.setPrototypeOf(this, MidiProtocolError.prototype);
  }
}

export class HandshakeError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'HANDSHAKE_ERROR', originalError);
    Object.setPrototypeOf(this, HandshakeError.prototype);
  }
}

export class NetworkTimeoutError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_TIMEOUT', originalError);
    Object.setPrototypeOf(this, NetworkTimeoutError.prototype);
  }
}

export class UdpPluginError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'UDP_PLUGIN_ERROR', originalError);
    Object.setPrototypeOf(this, UdpPluginError.prototype);
  }
}
