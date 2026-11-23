# 🎉 MIDI Playback Control — Bem-vindo!

Olá! Bem-vindo ao projeto **MIDI Playback Control** — um controlador remoto nativo para Android que comanda o aplicativo **Playback (MultiTracks.com)** em um iPad via Wi-Fi local.

---

## 🚀 Comece Aqui

### 1. **Entenda o Projeto** (5 min)
   Leia: [README.md](./README.md)

### 2. **Veja O Que Foi Feito** (5 min)
   Leia: [PROJECT_FOUNDATION.md](./PROJECT_FOUNDATION.md)

### 3. **Aprenda as Regras Copilot** (20 min)
   Leia em sequência:
   - [.copilot/instructions.md](./.copilot/instructions.md)
   - [.copilot/naming-conventions.md](./.copilot/naming-conventions.md)
   - [.copilot/protocol-specs.md](./.copilot/protocol-specs.md)

### 4. **Fase 1 em Detalhe** (10 min)
   Leia: [docs/PHASE1_RTP_MIDI.md](./docs/PHASE1_RTP_MIDI.md)

---

## ⚡ Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Instalar UDP plugin
npm install @capacitor-community/udp

# 3. Verificar setup
npm run lint

# 4. Dev server
npm start
```

---

## 🎯 Arquitetura em 2 Minutos

```
Android App (Ionic + Angular)
   ↓
RtpMidiService (Core)
   ├─ AppleMIDI Handshake (portas 5004 + 5005)
   ├─ MIDI Command Serialization
   ├─ RTP Header Wrapping
   └─ Keep-Alive (clock sync)
   ↓
UDP Plugin (@capacitor-community/udp)
   ↓
iPad Playback (via Wi-Fi local)
```

**Fase 1:** Apenas envio de comandos (unidirecional)  
**Fase 2:** + Recebimento de telemetria OSC (bidirecional)

---

## 📋 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `.copilot/instructions.md` | Guia para Copilot AI — SEMPRE ler antes de codificar |
| `.copilot/naming-conventions.md` | Nomes: serviços, componentes, tipos, constantes |
| `.copilot/protocol-specs.md` | Especificações binárias (RTP-MIDI, OSC) |
| `src/app/core/services/rtp-midi.service.ts` | Coração do MVP — AppleMIDI |
| `docs/PHASE1_RTP_MIDI.md` | Implementação Phase 1 passo-a-passo |
| `package.json` | Dependências + npm scripts |
| `tsconfig.json` | TypeScript `strict: true` |

---

## ⚠️ 3 Requisitos Críticos (Nunca Esquecer!)

### 1. **Velocity NUNCA 0x00 para Note On**
```typescript
// ❌ ERRADO - iPad rejeita
sendNoteOn(94, 0x00); // velocity = 0

// ✅ CORRETO
sendNoteOn(94, 0x7F); // velocity = 127
```

### 2. **Handshake em DUAS Portas**
```
Android → iPad:5004 (Convite)   ← iPad responde com OK
Android → iPad:5005 (Convite)   ← iPad responde com OK
Android → Enviar MIDI commands
```

### 3. **Keep-Alive Essencial**
```typescript
// Sem isso, conexão timeout em ~10 segundos
setInterval(() => {
  sendClockSyncPacket(); // A cada 2 segundos
}, 2000);
```

---

## 🔧 Comandos Principais

```bash
npm start              # Dev server + file watch
npm run lint           # ESLint check
npm run format         # Prettier format
npm run test           # Rodar testes
npm run build          # Build web
npm run build:android  # Build APK
npm run cap:add:android # Adicionar Android a Capacitor
npm run cap:open:android # Abrir Android Studio
```

---

## 🌍 Linguagem

| Aspecto | Linguagem |
|---------|-----------|
| **Código** | English ✅ |
| **Comentários** | English ✅ |
| **Commits** | English ✅ |
| **Documentação** | English ✅ |
| **Discussões comigo (Copilot)** | Português (Brasil) ✅ |

---

## 📚 Documentação Completa

Veja [docs/README.md](./docs/README.md) para índice completo.

---

## 💡 Dicas Rápidas

- ✅ Sempre use constantes, nunca hardcode hex values
- ✅ Implementar error handling em todas as operações async
- ✅ Adicionar comentário apenas para lógica complexa (não óbvia)
- ✅ Implementar `ngOnDestroy` com `takeUntil(destroy$)`
- ✅ Rodar `npm run lint` após toda mudança
- ✅ Adicionar testes para nova lógica

---

## 🚀 Próximas Prioridades

1. **UDP Plugin Integration**
   ```bash
   npm install @capacitor-community/udp
   ```

2. **Completar RtpMidiService**
   - Handshake implementation
   - MIDI command sending
   - Keep-alive mechanism

3. **UI Components**
   - ConnectionSetupComponent
   - StageControlComponent
   - ControlPanelComponent

4. **Testing**
   - Packet builders (unit)
   - Handshake sequence (integration)

5. **Build Android APK**
   ```bash
   npm run build:android
   ```

---

## ❓ Perguntas?

Consulte em ordem:
1. `.copilot/instructions.md` — Arquitetura geral
2. `.copilot/naming-conventions.md` — Nomes específicos
3. `.copilot/protocol-specs.md` — Protocolos binários
4. `docs/PHASE1_RTP_MIDI.md` — Implementação Phase 1
5. `docs/README.md` — Índice de documentação

---

## ✅ Checklist Inicial

- [ ] Leu `README.md`
- [ ] Leu `PROJECT_FOUNDATION.md`
- [ ] Leu `.copilot/instructions.md`
- [ ] Leu `.copilot/naming-conventions.md`
- [ ] Leu `.copilot/protocol-specs.md`
- [ ] Entendeu handshake AppleMIDI
- [ ] Conhece os 3 requisitos críticos
- [ ] Rodou `npm install`
- [ ] Rodou `npm run lint`
- [ ] Pronto para começar!

---

**Bem-vindo! Vamos construir algo incrível! 🚀**

---

*Mantido por: Copilot AI*  
*Última atualização: 2026-11-23*
