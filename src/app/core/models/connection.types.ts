/**
 * Connection and network-related types
 */

export enum ConnectionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',
}

export interface ConnectionConfig {
  ipAddress: string;
  controlPort: number;
  dataPort: number;
  sessionName?: string;
  persistToStorage?: boolean;
}

export interface ConnectionState {
  status: ConnectionStatus;
  ipAddress: string | null;
  port: number | null;
  errorMessage: string | null;
  lastConnectedAt: number | null;
  socketId: string | null;
}

export interface AppleMidiHandshakeState {
  controlPortHandshakeComplete: boolean;
  dataPortHandshakeComplete: boolean;
  initiatorToken: number;
  remoteSSRC: number;
  localSSRC: number;
}
