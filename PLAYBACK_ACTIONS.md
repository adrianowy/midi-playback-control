# 🎵 Ações do Playback MultiTracks - Guia de Controle Remoto

**Data:** Novembro 2024  
**Propósito:** Definir quais ações implementar na aplicação Android  
**Fase:** 2 (RTP-MIDI MVP)

---

## 📊 Categorias de Controle

### 1️⃣ **Reprodução Básica** (TIER 1 - ESSENCIAL)
- ▶️ **PLAY** - Inicia reprodução
- ⏸️ **PAUSE** - Pausa reprodução
- ⏹️ **STOP** - Para e retorna ao início
- ⏯️ **CONTINUE** - Continua do ponto de pausa

### 2️⃣ **Navegação de Faixas** (TIER 1 - ESSENCIAL)
- ⏮️ **PREVIOUS** - Música anterior
- ⏭️ **NEXT** - Próxima música
- 🔢 **GO TO [número]** - Ir para faixa específica

### 3️⃣ **Loops e Repetição** (TIER 1 - ESSENCIAL ✨ Sua sugestão!)
- ∞ **LOOP INFINITO** - Loop indefinido da faixa atual
- 🔁 **REPEAT** - Repetir 1x, 2x, 3x
- 📍 **LOOP SECTION** - Loop de seção específica
- 📐 **LOOP SELECTION** - Loop personalizado

### 4️⃣ **Seções/Partes** (TIER 2 - IMPORTANTE)
- 📌 **SECTION [nome]** - Ir para seção específica (Intro, Verso, Refrão, etc)
- ➡️ **NEXT SECTION** - Próxima seção
- ⬅️ **PREVIOUS SECTION** - Seção anterior
- 📋 **SECTION LIST** - Mostrar todas as seções

### 5️⃣ **Pads / Pré-sets** (TIER 1 - ESSENCIAL ✨ Sua sugestão!)
- 🎹 **PAD 1-8 ON/OFF** - Ativar/desativar instrumentos/som
- 🎵 **MUTE ALL PADS** - Silenciar todos os pads

### 6️⃣ **Volume e Áudio** (TIER 2 - IMPORTANTE)
- 🔊 **VOLUME UP/DOWN** - Aumentar/diminuir volume
- 🎚️ **MASTER VOLUME** - Controle de volume geral
- 🎼 **FADE IN/OUT** - Fade in/out suave
- 🎸 **SOLO [instrumento]** - Solo de instrumento específico

### 7️⃣ **Tempo e Sincronia** (TIER 2 - IMPORTANTE)
- ⏱️ **TEMPO UP/DOWN** - Aumentar/diminuir BPM
- 👆 **TAP TEMPO** - Sincronizar clicando no beat
- 🎚️ **SYNC TO METRONOME** - Sincronizar com metrônomo
- ♩ **METRONOME ON/OFF** - Ligar/desligar click

### 8️⃣ **Visualização e Info** (TIER 3 - OPCIONAL / Phase 3 OSC)
- 🎵 **CURRENT SONG** - Nome da música (via OSC)
- ⏱️ **CURRENT TIME** - Tempo atual / Total (via OSC)
- 📍 **CURRENT SECTION** - Seção atual (via OSC)
- 🔔 **END OF SONG ALERT** - Alerta quando faixa terminar (via OSC)

---

## 🎯 Priorização para Implementação

### TIER 1 - MVP (Phase 2 - RTP-MIDI)
✅ **ESSENCIAL - Implementar PRIMEIRO**

```
┌─ REPRODUÇÃO BÁSICA ─┐
│  Play / Pause / Stop │
├─────────────────────┤
│  Previous / Next    │
├─────────────────────┤
│  Loop ON/OFF        │
├─────────────────────┤
│  Pad 1-8 ON/OFF     │
└─────────────────────┘
```

**Razão:** Ações diárias do músico em palco

---

### TIER 2 - Phase 2.5 (Depois do MVP)
✅ **IMPORTANTE - Adicionar depois**

- Seções (ir para seção específica)
- Volume Up/Down
- Tempo Up/Down
- Metronome On/Off

**Razão:** Melhoram muito a experiência, mas não são críticas

---

### TIER 3 - Phase 3+ (Futuro)
⏳ **OPCIONAL - Adicionar gradualmente**

- Solo/Mute instrumentos
- Fade In/Out
- Tap Tempo
- Repeat modes (1x, 2x, etc)
- Telemetria completa (Phase 3 OSC)

**Razão:** Casos de uso avançados

---

## 🎼 Mapeamento MIDI Recomendado

| Controle | MIDI Note | Velocity | Channel |
|----------|-----------|----------|---------|
| **PLAY** | C3 (0x3C) | 127 | 1 |
| **PAUSE** | D3 (0x3E) | 127 | 1 |
| **STOP** | E3 (0x40) | 127 | 1 |
| **NEXT** | F3 (0x41) | 127 | 1 |
| **PREVIOUS** | G3 (0x43) | 127 | 1 |
| **LOOP ON** | A3 (0x45) | 127 | 1 |
| **LOOP OFF** | A3 (0x45) | 0 | 1 |
| **PAD 1 ON** | C4 (0x3C) | 127 | 1 |
| **PAD 1 OFF** | C4 (0x3C) | 0 | 1 |
| **PAD 2 ON** | D4 (0x3E) | 127 | 1 |
| **PAD 2 OFF** | D4 (0x3E) | 0 | 1 |
| ... | ... | ... | ... |

---

## 📱 Layout Sugerido para Home Page

```
┌─────────────────────────────────────────────┐
│      MIDI PLAYBACK CONTROL - PALCO          │
├─────────────────────────────────────────────┤
│                                             │
│  🎵 Song: "Amazing Grace"  02:34 / 05:00   │
│  📍 Section: Verso                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│        ◄◄  ⏹️   ▶️   ⏸️  ►►               │
│     PREV  STOP PLAY PAUSE NEXT              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│   [🎼 Intro]  [Verso]  [Refrão] [Outro]    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│   [PAD 1]  [PAD 2]  [PAD 3]  [PAD 4]      │
│   [PAD 5]  [PAD 6]  [PAD 7]  [PAD 8]      │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [🔄 LOOP]  [🔊 Vol±]  [⏱️ BPM±]  [♩]     │
│    OFF        Medium    100 bpm   ON       │
│                                             │
├─────────────────────────────────────────────┤
│  ✅ Connected to iPad | IP: 192.168.1.100 │
└─────────────────────────────────────────────┘
```

---

## 🎨 Design e UX Recommendations

### **Cores por Tipo de Ação**

| Tipo | Cores | Exemplo |
|------|-------|---------|
| **PLAY** | Verde brilhante | ▶️ Play - Verde claro |
| **PAUSE** | Laranja/Amarelo | ⏸️ Pause - Laranja |
| **STOP** | Vermelho | ⏹️ Stop - Vermelho escuro |
| **NAVEGAÇÃO** | Azul | ⏮️ Prev / ⏭️ Next - Azul |
| **PADS ON** | Verde/Colorido | Destacado quando ligado |
| **PADS OFF** | Cinza | Escuro quando desligado |
| **SEÇÕES** | Verde claro | Cores diferentes por seção |
| **TOGGLE** | Verde/Cinza | Muda cor quando ativado |

### **Tamanho dos Botões**

```
PLAY/PAUSE/STOP:   100px x 100px   (GRANDE - primário)
PREV/NEXT:         70px x 70px     (médio - secundário)
PADS 1-8:          80px x 80px     (quadrado - toggle)
SEÇÕES:            90px x 50px     (retangular - dinâmico)
OPÇÕES:            60px x 60px     (pequeno - utilities)
```

### **Dicas para Palco**

✅ **Botões GRANDES** - Fácil tocar em movimento  
✅ **ESPAÇAMENTO** - Evitar cliques acidentais  
✅ **ALTO CONTRASTE** - Visível de longe  
✅ **FEEDBACK VISUAL** - Estado claro (ON/OFF)  
✅ **ORIENTAÇÃO LANDSCAPE** - Preferível em smartphones  
✅ **RÁPIDO** - Resposta imediata ao toque  

---

## 🔄 Fluxo de Implementação Sugerido

### **Phase 2 - Semana 1-2**
```
✅ Play / Pause / Stop
✅ Next / Previous
✅ Layout limpo em 5 botões
✅ Teste com iPad real
```

### **Phase 2 - Semana 3-4**
```
✅ Loop ON/OFF toggle
✅ Pads 1-8 (ON/OFF com cores)
✅ Estado visual (ligado/desligado)
✅ Teste com 8 pads diferentes
```

### **Phase 2.5 - Semana 5-6**
```
✅ Seções (ir para seção)
✅ Volume Up/Down
✅ Tempo Up/Down (BPM)
✅ Metronome On/Off
```

### **Phase 3 - Semana 7+**
```
✅ Telemetria OSC (song name, time)
✅ Display de informações dinâmicas
✅ Solo/Mute instrumentos
✅ Mais opções avançadas
```

---

## 📝 Notas Importantes

1. **Velocity = 0 significa OFF** no Playback
   - `velocity = 127` → Nota ON
   - `velocity = 0` → Nota OFF
   - Sempre enviar `velocity = 127` para ativar

2. **Pads são TOGGLE** (ON/OFF alternado)
   - Clique 1x: Ligado
   - Clique 2x: Desligado

3. **Seções são DINÂMICAS**
   - Vêm do arquivo de música
   - Descobrir quantas seções há
   - Mostrar apenas as que existem

4. **Loop é GLOBAL**
   - Afeta toda a faixa
   - Pode ser infinito ou X repetições

5. **Pads podem ser INSTRUMENTOS**
   - Exemplo: Pad 1 = Bateria, Pad 2 = Baixo
   - Ou EFEITOS: Pad 1 = Reverb, Pad 2 = Delay

---

## ✨ Resumo - O que Implementar

### **TIER 1 (MVP - Essencial)**
- ✅ Play / Pause / Stop
- ✅ Next / Previous
- ✅ Loop Infinito (sua sugestão!)
- ✅ Pads 1-8 ON/OFF (sua sugestão!)

### **TIER 2 (Depois)**
- ✅ Seções
- ✅ Volume / Tempo
- ✅ Metronome

### **TIER 3 (Futuro)**
- ✅ Solo / Mute
- ✅ Telemetria (Phase 3)
- ✅ Fade / Repeat modes

---

**Status:** Pronto para Phase 2  
**Próximo:** Começar implementação com RtpMidiService  
**Referência:** Manter este documento para consulta
