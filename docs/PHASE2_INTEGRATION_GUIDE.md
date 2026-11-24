# 🔗 Integration Guide - Phase 2 Components in HomeComponent

## Overview

Este guia descreve como integrar os três novos componentes de Phase 2 (TrackInfo, ProgressBar, PadIndicator) no HomeComponent existente.

## Componentes a Integrar

### 1. TrackInfoComponent
**Localização:** `src/app/features/home/components/track-info/track-info.component.ts`  
**Responsabilidade:** Exibir metadata da música (nome, artista, álbum, seção)  
**Entrada:** Nenhuma (injeta OscService)  
**Saída:** Nenhuma

### 2. ProgressBarComponent
**Localização:** `src/app/features/home/components/progress-bar/progress-bar.component.ts`  
**Responsabilidade:** Mostrar progresso de reprodução  
**Entrada:** Nenhuma (injeta OscService)  
**Saída:** Nenhuma

### 3. PadIndicatorComponent
**Localização:** `src/app/features/home/components/pad-indicator/pad-indicator.component.ts`  
**Responsabilidade:** Exibir estados dos 8 pads  
**Entrada:** Nenhuma (injeta OscService)  
**Saída:** Nenhuma

---

## Integração no HomeComponent

### Passo 1: Importar Componentes

No arquivo `home.component.ts`, adicionar os imports:

```typescript
import { TrackInfoComponent } from './components/track-info/track-info.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { PadIndicatorComponent } from './components/pad-indicator/pad-indicator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackInfoComponent,      // ← Novo
    ProgressBarComponent,    // ← Novo
    PadIndicatorComponent,   // ← Novo
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // ... código existente
}
```

### Passo 2: Inicializar OscService no OnInit

```typescript
ngOnInit() {
  // Conexão RTP-MIDI existente
  this.setupConnectionMonitoring();
  this.connectToPlayback();

  // ← ADICIONAR: Iniciar OSC listener
  this.startOscListener();
}

/**
 * Iniciar OSC listener para telemetria
 */
private startOscListener(): void {
  this.oscService.startListening({ localPort: 9000 }).then(() => {
    console.log('OSC listener iniciado na porta 9000');
  }).catch((error) => {
    console.error('Erro ao iniciar OSC listener:', error);
  });
}
```

### Passo 3: Adicionar Componentes no Template

No arquivo `home.component.html`, adicionar os componentes antes dos botões:

```html
<ion-content class="ion-padding">
  <!-- Connection Status (existente) -->
  <div class="connection-status" *ngIf="connectionStatus">
    <!-- ... código existente ... -->
  </div>

  <!-- ← NOVO: Track Info (Telemetria) -->
  <app-track-info cssClass="telemetry-section"></app-track-info>

  <!-- ← NOVO: Progress Bar -->
  <app-progress-bar cssClass="telemetry-section"></app-progress-bar>

  <!-- ← NOVO: Pad Indicator -->
  <app-pad-indicator cssClass="telemetry-section"></app-pad-indicator>

  <!-- Divider -->
  <hr class="controls-divider">

  <!-- Playback Controls (existente) -->
  <div class="controls-section">
    <!-- ... código existente de botões ... -->
  </div>
</ion-content>
```

### Passo 4: Adicionar Estilos

No arquivo `home.component.scss`, adicionar:

```scss
/* Telemetry Section */
.telemetry-section {
  margin-bottom: 1.5rem;
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Divider */
.controls-divider {
  margin: 2rem 0;
  border: none;
  border-top: 2px solid rgba(100, 116, 139, 0.2);
  opacity: 0.5;
}

/* Controls Section */
.controls-section {
  animation: slideUp 0.5s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Passo 5: Injetar OscService (se não existir)

No HomeComponent, adicionar no constructor:

```typescript
constructor(
  private rtpMidiService: RtpMidiService,
  private oscService: OscService,  // ← Novo
) {}
```

### Passo 6: Adicionar Cleanup

No método `ngOnDestroy`, adicionar stop do OSC:

```typescript
ngOnDestroy() {
  // Limpeza existente
  this.destroy$.next();
  this.destroy$.complete();
  
  // ← NOVO: Parar OSC listener
  this.oscService.stopListening().catch();
}
```

---

## Layout Resultante

Após integração, a tela ficará com este layout:

```
┌─────────────────────────────────────┐
│  Ionic Header                       │
├─────────────────────────────────────┤
│                                     │
│  Connection Status (RTP-MIDI)       │ ← Existente
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Track Info Component               │ ← Novo (Phase 2)
│  🎵 Amazing Grace                   │
│  Artista: John Newton               │
│  Álbum: Hymns                       │
│  📍 Verso 1                         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Progress Bar Component             │ ← Novo (Phase 2)
│  ▶ Reproduzindo                     │
│  0:45 ████░░░░░░ 5:00               │
│  Restante: 4:15                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Pad Indicator Component            │ ← Novo (Phase 2)
│  🔴 P1  🔴 P2  ⭕ P3  ⭕ P4         │
│  🔴 P5  ⭕ P6  🔴 P7  ⭕ P8         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Playback Controls Grid             │ ← Existente
│  [PLAY]  [PAUSE]  [STOP]           │
│  [LOOP]  [REPEAT] [INFINITY]       │
│  [PAD 1] [PAD 2] ... [PAD 8]       │
│  [FADE IN]  [FADE OUT]             │
│                                     │
├─────────────────────────────────────┤
│  Ionic Footer                       │
└─────────────────────────────────────┘
```

---

## Configuração OSC no iPad

Antes de testar, configurar iPad para enviar OSC:

### Playback Settings
1. Abrir **Playback** no iPad
2. **Settings** > **OSC**
3. Habilitar **OSC Broadcasting**
4. Definir **Remote IP:** IP do Android (ex: 192.168.1.50)
5. Definir **Remote Port:** 9000
6. Habilitar **Send Track Info**
7. Habilitar **Send Playback Status**
8. Habilitar **Send Pad States**

### Teste Inicial
1. Ligar Music > selecionar uma música
2. Verificar se **Track Info** aparece no Android
3. Play/Pause e verificar **Progress Bar**
4. Mudar pads no iPad e verificar **Pad Indicator**

---

## Dados Esperados (OSC Messages)

O OscService espera receber estas mensagens do iPad:

```
/playback/track/info    ,s   "Amazing Grace"
/playback/track/artist  ,s   "John Newton"
/playback/track/album   ,s   "Hymns"
/playback/time/position ,f   45.5
/playback/time/total    ,f   300.0
/playback/status        ,Tff true 300.0 45.5
/playback/section/change,s   "Verso 1"
/playback/bpm           ,f   120.0
/playback/pad/0         ,T
/playback/pad/1         ,F
... até /playback/pad/7
```

---

## Troubleshooting

### Componentes não aparecem
- [ ] Verificar imports no HomeComponent
- [ ] Verificar que componentes são `standalone: true`
- [ ] Executar `npm run build` para validar TypeScript

### Nenhum dado aparece (fica em "Aguardando conexão...")
- [ ] Verificar que OSC listener iniciou (console.log)
- [ ] Verificar IP/port corretos
- [ ] Verificar que iPad está configurado para enviar OSC
- [ ] Ambos aparecem na mesma rede WiFi

### Progress Bar não atualiza
- [ ] OSC service não recebe `/playback/time/position`
- [ ] Verificar se iPad envia telemetria periódica
- [ ] Usar ferramentas de debugging OSC para ver pacotes

### Pads não atualizam
- [ ] OSC service não recebe `/playback/pad/*`
- [ ] Verificar que iPad está enviando pad states

---

## Debug Mode

Para ativar logs detalhados, editar OscService:

```typescript
// No startListening():
await this.oscService.startListening({ 
  localPort: 9000,
  enableLogging: true  // ← Habilita logs
});
```

Verificar console do navegador/device para ver todas as mensagens OSC recebidas.

---

## Próximas Melhorias

Após integração básica funcionar:

1. **Click no Progress Bar:** Implementar seeking (enviar MIDI CC para iPad)
2. **Animações de Transição:** Slide in/out de componentes
3. **Dark Mode:** Adaptar cores para noite
4. **Responsive:** Testar em diferentes tamanhos de tela
5. **Performance:** Monitorar memory usage de Observables

---

## Checklist de Integração

- [ ] Componentes importados no HomeComponent
- [ ] OscService injetado no constructor
- [ ] startOscListener() chamado no ngOnInit
- [ ] Componentes adicionados no template HTML
- [ ] Estilos CSS adicionados
- [ ] stopListening() no ngOnDestroy
- [ ] npm run build (sem erros)
- [ ] npm run test (todos passam)
- [ ] Testar no device/emulador
- [ ] Verificar console para OSC messages

---

**Data de Atualização:** 2024-11-24  
**Status:** Pronto para Integração
