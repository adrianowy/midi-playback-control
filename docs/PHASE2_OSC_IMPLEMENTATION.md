# 📡 Phase 2: Telemetria via OSC (Open Sound Control)

## 🎯 Objetivo

Implementar comunicação bidirecional com iPad Playback para receber feedback em tempo real via OSC, permitindo exibição de estado do playback, música atual, tempo decorrido e seção em andamento.

## 🏗️ Arquitetura

### Componentes Principais

#### 1. **OscService** (`osc.service.ts`)
Serviço principal que gerencia conexão OSC e telemetria.

**Responsabilidades:**
- Abrir listener UDP local na porta configurável (padrão: 9000)
- Receber mensagens OSC do iPad Playback
- Decodificar mensagens e extrair telemetria
- Manter estado reativo via RxJS BehaviorSubject
- Gerenciar ciclo de vida (start/stop listening)

**Observables Públicos:**
```typescript
message$: Observable<OscMessage>              // Stream de mensagens brutas
playbackStatus$: Observable<OscPlaybackStatus> // Stream de status decodificado
sessionState$: Observable<OscSessionState>     // Estado da sessão (LISTENING, ERROR, CLOSED)
error$: Observable<OscError>                   // Stream de erros
```

#### 2. **OscParser** (`osc.parser.ts`)
Parser de protocolo OSC em nível binário.

**Responsabilidades:**
- Decodificar mensagens OSC brutas de UDP
- Validar estrutura (address, type tag, argumentos)
- Suportar tipos OSC: `i` (int), `f` (float), `s` (string), `b` (blob), `T`/`F`/`N` (booleano/null)
- Extrair telemetria de playback de mensagens conhecidas
- Alinhamento a 4 bytes (requisito OSC)

**Métodos Públicos:**
```typescript
static parseMessage(data: Uint8Array, timestamp: number): OscMessage
static extractPlaybackStatus(message: OscMessage): Partial<OscPlaybackStatus>
```

#### 3. **Tipos** (`osc.types.ts`)
Interfaces e enumerações para OSC.

**Principais Tipos:**
```typescript
interface OscMessage {
  address: string;
  typeTag: string;
  args: OscArgumentValue[];
  timestamp: number;
}

interface OscPlaybackStatus {
  trackName?: string;
  timePosition?: number;
  timeDuration?: number;
  currentSection?: string;
  bpm?: number;
  signature?: string;
  isPlaying?: boolean;
  loopActive?: boolean;
}

enum OscSessionState {
  IDLE, LISTENING, ERROR, CLOSED
}
```

#### 4. **Constantes** (`osc.constants.ts`)
Configurações e endereços OSC conhecidos.

```typescript
OSC.ADDRESSES = {
  TRACK_INFO: '/playback/track/info',
  TIME_POSITION: '/playback/time/position',
  PLAYBACK_STATUS: '/playback/status',
  SECTION_CHANGE: '/playback/section/change',
  TEMPO: '/playback/tempo',
  // ... mais endereços
}
```

## 📊 Formato de Mensagens OSC Esperadas

Mensagens do iPad Playback para Android:

### Track Information
```
/playback/track/name      ,s   "Amazing Grace"
/playback/track/artist    ,s   "John Newton"
/playback/track/album     ,s   "Hymns"
```

### Time Information
```
/playback/time/position   ,f   45.5        (segundos)
/playback/time/total      ,f   300.0       (segundos)
/playback/status          ,Tff true 300.0 45.5
```

### Section/Structure
```
/playback/section/change  ,s   "Verso 1"
/playback/section/index   ,i   0
```

### Musical Parameters
```
/playback/tempo           ,f   120.0       (BPM)
/playback/signature       ,s   "4/4"
/playback/bpm             ,f   120.0
```

### Loop & Repeat State
```
/playback/loop/active     ,T                (True boolean)
/playback/repeat/count    ,i   1
```

### Pad States
```
/playback/pad/0           ,T
/playback/pad/1           ,F
```

## 🔄 Fluxo de Dados

```
iPad Playback
    ↓
   UDP 5000:9000
    ↓
OscService.listenForMessages()
    ↓
OscParser.parseMessage()
    ↓
OscParser.extractPlaybackStatus()
    ↓
BehaviorSubject<OscPlaybackStatus>
    ↓
Componentes (Track Info, Progress Bar, Pads)
```

## 🧪 Testes Implementados

### OscParser Tests
- ✅ Parse mensagem com string
- ✅ Parse com integer
- ✅ Parse com float
- ✅ Validação de endereço
- ✅ Validação de type tag
- ✅ Tipos não suportados
- ✅ Timestamp preservado
- ✅ Extração de telemetria

### OscService Tests
- ✅ Inicialização
- ✅ Start/stop listening
- ✅ Recebimento de dados
- ✅ Parsing de mensagens
- ✅ Limpeza de recursos
- ✅ Tratamento de erros
- ✅ Buffer de mensagens
- ✅ Configuração dinâmica

## 🚀 Próximos Passos: Componentes UI

### Track Info Component
Exibe informações da música atual:
- Nome da música
- Artista
- Álbum
- Seção atual

### Progress Bar Component
Mostra progresso de reprodução:
- Barra visual
- Tempo decorrido / Total
- Atualização em tempo real

### Pad State Indicator
Mostra estado dos 8 pads:
- Visual de ligado/desligado
- Atualização via OSC

## 📋 Integração com HomeComponent

O serviço será integrado no HomeComponent:

```typescript
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    private rtpMidiService: RtpMidiService,
    private oscService: OscService
  ) {}

  ngOnInit() {
    // Iniciar listeners
    this.oscService.startListening({ localPort: 9000 });
    
    // Monitorar telemetria
    this.oscService.playbackStatus$.subscribe(status => {
      this.currentTrack = status.trackName;
      this.currentTime = status.timePosition;
      this.totalTime = status.timeDuration;
    });
  }
}
```

## ⚙️ Configuração do Playback (iPad)

No aplicativo Playback do iPad:
1. Abrir **Settings > OSC**
2. Habilitar **OSC Broadcasting**
3. Definir **Remote Device IP**: IP do Android
4. Definir **Remote Port**: 9000
5. Habilitar envio de telemetria periódica

## 🔧 Integração com Capacitor UDP

Atualmente, o `OscService` é um placeholder. Para integração real com UDP:

```typescript
import { UDPSocket } from '@capacitor-community/udp';

private async startUdpListener(): Promise<void> {
  this.socket = new UDPSocket({
    address: '0.0.0.0',
    port: this.config.localPort,
  });
  
  await this.socket.create();
  
  while (this.socket) {
    const { buffer } = await this.socket.receiveString();
    if (buffer) {
      this.handleIncomingData(buffer);
    }
  }
}
```

## 📊 Exemplo de Uso

```typescript
// Injetar serviço
constructor(private osc: OscService) {}

// Iniciar listening
await this.osc.startListening({ localPort: 9000 });

// Monitorar status
this.osc.playbackStatus$.subscribe(status => {
  console.log(`Playing: ${status.trackName}`);
  console.log(`Position: ${status.timePosition}/${status.timeDuration}`);
  console.log(`Section: ${status.currentSection}`);
});

// Monitorar erros
this.osc.error$.subscribe(error => {
  console.error(`OSC Error: ${error.message}`);
});

// Parar listening
await this.osc.stopListening();
```

## 🎯 Métricas de Sucesso

- ✅ Parser OSC decode 100% de mensagens válidas
- ✅ Latência < 100ms entre envio (iPad) e recebimento (Android)
- ✅ Sem memory leaks por listeners
- ✅ Tratamento gracioso de erros
- ✅ Buffer circular de últimas 100 mensagens
- ✅ Testes unitários com cobertura > 90%

## 📅 Timeline Estimado

- **Parsing OSC**: ✅ Completo (osc.parser.ts)
- **OscService**: ✅ Completo (osc.service.ts)
- **Testes**: ✅ Completo (osc.parser.spec.ts, osc.service.spec.ts)
- **Integração com @capacitor-community/udp**: 2-3 dias
- **Track Info Component**: 1 dia
- **Progress Bar Component**: 1 dia
- **Integração com HomeComponent**: 1 dia
- **Testes e2e**: 1 dia

**Total estimado:** 1 semana para Phase 2 completa

## 🔗 Referências

- RFC 5OSC: https://opensoundcontrol.org/spec-1_0
- @capacitor-community/udp: https://github.com/capacitor-community/udp
- Playback OSC Documentation: (documento a ser fornecido)
