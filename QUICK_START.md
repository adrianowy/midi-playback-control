# 🚀 MIDI Playback Control - Quick Start

> Este é um aplicativo Android nativo para controlar remotamente o **Playback (MultiTracks.com)** rodando em um iPad via Wi-Fi, usando RTP-MIDI e OSC.

---

## ✅ O que foi feito até agora

### Fundação do Projeto (Fase 1)
- **Ionic + Angular** - Framework mobile com web tech
- **TypeScript strict** - Tipagem segura
- **Jest** - Testes rápidos (substituindo Karma)
- **ESLint + Prettier** - Code quality
- **Capacitor** - Acesso a APIs nativas Android
- **Documentação Completa** - Guias para devs

### Arquivos Importantes
```
.copilot/              # Configurações para Copilot AI
  ├── instructions.md  # Diretrizes do projeto
  ├── skills.md        # Skills customizadas
  └── agents.md        # Agentes para automação

src/app/
  ├── core/
  │   ├── services/
  │   │   ├── config.service.ts       # Configurações persistidas
  │   │   └── rtp-midi.service.ts    # RTP-MIDI protocol (a implementar)
  │   └── models/                     # Tipos TypeScript
  ├── features/
  │   └── stage/                      # Componentes de UI/UX
  └── shared/                         # Componentes reutilizáveis

jest.config.js          # Configuração do Jest
setup-jest.ts           # Setup do ambiente de testes
tsconfig.json           # TypeScript strict mode
```

---

## 🎯 Próximos Passos (Fase 2: MVP RTP-MIDI)

### 1. Implementar RtpMidiService
Adicionar lógica de protocolo RTP-MIDI:
- Handshake AppleMIDI (IN/OK packets)
- Keep-alive com pacotes de clock sync
- Envio de comandos MIDI (Note On, CC)

**Localização:** `src/app/core/services/rtp-midi.service.ts`

### 2. Criar Componente "Stage"
UI com botões grandes otimizados para touch:
- Play, Stop, Próxima, Seções, Loops
- Entrada de IP/Porta
- Status de conexão

**Localização:** `src/app/features/stage/`

### 3. Integrar Capacitor UDP
Usar `@capacitor-community/udp` para sockets UDP nativos

### 4. Testes
Adicionar specs com mock UDP

---

## 🔧 Comandos Básicos

```bash
# Instalar dependências (primeira vez)
npm install

# Build development
npm run build

# Build produção
npm run build -- --prod

# Rodar testes (Jest)
npm run test

# Lint do código
npm run lint

# Format código (Prettier)
npm run format

# Build APK Android
npx cap add android
npx cap build android
```

---

## 📚 Stack Tecnológico

| Camada | Tecnologia | Razão |
|--------|-----------|-------|
| **Frontend** | Angular + TypeScript | Type-safe, reativo, produção |
| **Runtime** | Ionic Capacitor | Nativo Android sem compilar Java |
| **Rede** | @capacitor-community/udp | Acesso a sockets UDP (PWAs não têm) |
| **Protocolos** | RTP-MIDI + OSC | Padrão audio/midi industry |
| **Testing** | Jest | Rápido, moderno, sem Karma overhead |
| **Code Quality** | ESLint + Prettier | Consistência de código |

---

## 🎓 Linguagem de Código

✅ **Todo código** é em **INGLÊS**:
- Nomes de variáveis, funções, classes
- Comentários técnicos
- Documentação de API

✅ **Documentação** é em **PORTUGUÊS (Brasil)**:
- Guias, READMEs
- Comentários explicativos para devs
- Rastreamento de progresso

---

## 📖 Mais Informações

- **[README.md](./README.md)** - Visão geral completa
- **[WELCOME.md](./WELCOME.md)** - Guia para novos devs
- **[PROJECT_FOUNDATION.md](./PROJECT_FOUNDATION.md)** - Arquitetura detalhada
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Progresso e roadmap

---

## ⚡ Dicas de Desenvolvimento

### Debug no VS Code
1. Instalar extension **Debugger for Chrome**
2. No `launch.json`:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:4200",
  "webRoot": "${workspaceFolder}/src"
}
```

### Usar Copilot AI para Implementação
O projeto está configurado com instruções customizadas em `.copilot/`.
Qualquer prompt ao Copilot vai respeitar:
- Arquitetura modular
- Tipagem estrita
- Code quality standards
- Testes com Jest

**Exemplo de prompt:**
> "Implementa o handshake AppleMIDI no RtpMidiService com tipagem estrita e testes"

---

**Última atualização:** Fase 1 ✅
**Status:** Pronto para Fase 2 de desenvolvimento 🚀
