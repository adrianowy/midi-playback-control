# RTP-MIDI Service Implementation

## Overview
O `RtpMidiService` implementa o protocolo AppleMIDI (RFC 6295) para comunicação com o Playback (MultiTracks.com) rodando em um iPad via UDP sobre rede local Wi-Fi.

## Estrutura

### Serviço Principal
- **Arquivo:** `src/app/core/services/rtp-midi.service.ts`
- **Responsabilidades:**
  1. Gerenciar conexão e handshake AppleMIDI
  2. Enviar comandos MIDI (Note On/Off, Control Change)
  3. Manter sessão ativa com keep-alive
  4. Gerenciar estado de conexão e erros

### Tipos e Interfaces
- **Arquivo:** `src/app/core/services/rtp-midi.types.ts`
- **Contém:**
  - `RtpMidiConfig` - Configuração de conexão
  - `AppleMidiCommand` - Enums de comandos do protocolo
  - `MidiCommand` - Enums de status MIDI
  - `PlaybackNote` - Notas MIDI específicas para Playback
  - `SessionState` - Estados da sessão
  - Interfaces de pacotes RTP e AppleMIDI

## Integração com Home Component

### Fluxo de Inicialização
1. `ngOnInit()` inicializa os pads
2. `setupConnectionMonitoring()` observa estado de conexão
3. `connectToPlayback()` inicia conexão com IP estático

### IP e Portas (MVP)
```typescript
IPAD_IP = '192.168.1.100'      // Configurável depois
CONTROL_PORT = 5004             // Padrão AppleMIDI
DATA_PORT = 5005                // Control port + 1
```

### Envio de Comandos
Cada botão chama um método que:
1. Verifica se está conectado
2. Chama método correspondente no `RtpMidiService`
3. Trata erros e atualiza UI

**Exemplo - Play Button:**
```typescript
onPlayClick(): void {
  if (!this.isConnected) {
    this.errorMessage = 'Not connected to Playback';
    return;
  }

  this.rtpMidiService
    .sendNoteOn(0x3c, 0x7f) // Middle C, velocity 127
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => console.log('Play command sent'),
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
}
```

## Mapeamento de Notas MIDI

### Reprodução Básica
| Ação | Nota | Hex | Decimal |
|------|------|-----|---------|
| Play | C4 | 0x3C | 60 |
| Pause | C#4 | 0x3D | 61 |
| Stop | D4 | 0x3E | 62 |
| Next | D#4 | 0x3F | 63 |
| Previous | E4 | 0x40 | 64 |

### Loops e Repetição
| Ação | Nota | Hex | Decimal |
|------|------|-----|---------|
| Loop Section | F4 | 0x41 | 65 |
| Repeat | F#4 | 0x42 | 66 |
| Loop Infinity | G4 | 0x43 | 67 |

### Pads (Padrão)
| Pad | Nota Base | Hex |
|-----|-----------|-----|
| 1-8 | A4+ | 0x48 |

### Áudio
| Ação | CC | Valor |
|------|----|----|
| Fade In | 0x07 (Volume) | 0x7F (Max) |
| Fade Out | 0x07 (Volume) | 0x00 (Min) |

## Protocolo AppleMIDI - Handshake

### Fluxo de Conexão
1. **Control Port (5004):**
   - Enviar pacote `IN` (Invitation)
   - Aguardar resposta `OK` (Acceptance)

2. **Data Port (5005):**
   - Enviar pacote `IN` novamente
   - Aguardar resposta `OK`

3. **Keep-Alive:**
   - Enviar pacotes `CK` (Clock Sync) a cada 5 segundos
   - Evita timeout por inatividade

### Estrutura de Pacotes

#### Invitation (IN) - 20 bytes
```
Offset  | Tamanho | Campo | Valor |
--------|---------|-------|-------|
0       | 2       | Signature | 0xFFFF |
2       | 2       | Command | 0x494E (IN) |
4       | 4       | Version | 0x00000002 |
8       | 4       | Initiator Token | Random |
12      | 4       | SSRC | Random |
16      | 4       | Session Name Length | 0 (no session name) |
```

#### Clock Sync (CK) - 8+ bytes
```
Offset  | Tamanho | Campo | Valor |
--------|---------|-------|-------|
0       | 2       | Signature | 0xFFFF |
2       | 2       | Command | 0x434B (CK) |
4       | 4       | SSRC | Local SSRC |
8       | 1       | Clock Count | 0, 1, 2 (round-robin) |
```

## Estrutura de Pacotes RTP para MIDI

### RTP Header - 12 bytes
```
Offset  | Bits | Campo | Descrição |
--------|------|-------|-----------|
0       | 2 | V (Version) | 2 (RTP v2) |
0       | 1 | P (Padding) | 0 |
0       | 1 | X (Extension) | 0 |
0       | 4 | CC (CSRC Count) | 0 |
1       | 1 | M (Marker) | 0 |
1       | 7 | PT (Payload Type) | 97 (MIDI) |
2       | 16 | Sequence Number | Incrementa |
4       | 32 | Timestamp | 90 kHz clock |
8       | 32 | SSRC | Synchronization Source |
```

### MIDI Command Section Header - 1 byte
```
Bits  | Campo |
------|-------|
7-6   | Reserved |
5     | B (Bias) |
4-0   | Command Count or Length |
```

### MIDI Data
Bytes MIDI tradicionais:
- Note On: `[0x90, nota, velocity]`
- Note Off: `[0x80, nota, 0x00]`
- Control Change: `[0xB0, cc, valor]`

## Estados de Conexão

```typescript
export enum ConnectionStatus {
  IDLE = 'idle',                    // Desconectado/Inicial
  CONNECTING = 'connecting',        // Tentando conectar
  CONNECTED = 'connected',          // Conectado e pronto
  DISCONNECTING = 'disconnecting',  // Desconectando
  ERROR = 'error',                  // Erro na conexão
}
```

## Observáveis

### connectionStatus$
Observable que emite mudanças de estado de conexão.
```typescript
rtpMidiService.connectionStatus$.subscribe(status => {
  console.log('Status:', status);
});
```

### midiReceived$
Observable para mensagens MIDI recebidas (Fase 2 - OSC Telemetria).
```typescript
rtpMidiService.midiReceived$.subscribe(midiMessage => {
  console.log('MIDI Recebido:', midiMessage);
});
```

## Implementação UDP (@capacitor-community/udp)

### TODO
O serviço contém placeholders para integração real com UDP:

1. **Criar sockets UDP:**
```typescript
const { UDPSocket } = await import('@capacitor-community/udp');
this.controlSocket = await UDPSocket.create();
await this.controlSocket.bind({ address: '0.0.0.0', port: 5004 });
```

2. **Enviar pacotes:**
```typescript
await this.controlSocket.send({
  address: this.config.ipAddress,
  port: this.config.controlPort,
  buffer: Buffer.from(packet).toString('base64'),
});
```

3. **Receber pacotes:**
```typescript
this.controlSocket.onReceive((result) => {
  const data = Buffer.from(result.buffer, 'base64');
  // Processar handshake
});
```

## Tratamento de Erros

### Erros Implementados
- `ConnectionError` - Falha ao conectar
- `HandshakeError` - Falha no handshake AppleMIDI
- `MidiProtocolError` - Erro ao enviar MIDI
- `NetworkTimeoutError` - Timeout de rede

### Importantes
- **Velocity = 0**: Playback ignora! Sempre use velocity > 0 para Note On
- **Timeout Handshake**: 5 segundos por padrão
- **Keep-Alive**: 5 segundos entre pacotes CK

## Próximos Passos (Fase 2)

1. **Implementar recepção de dados** via OSC para telemetria
2. **Adicionar UI de configuração** para IP e portas
3. **Persistir configuração** em localStorage
4. **Implementar discovery** via mDNS/Bonjour
5. **Adicionar feedback visual** de estado da música (track name, tempo, seção)

## Referências
- [RFC 6295 - AppleMIDI](https://www.rfc-editor.org/rfc/rfc6295.html)
- [RTP MIDI Jitter Buffer Guidelines](https://www.rfc-editor.org/rfc/rfc6295#section-3)
- [MIDI Specification](https://www.midi.org/specifications-old)
- [Playback WiFi MIDI Setup](https://www.multitracks.com/help/)
