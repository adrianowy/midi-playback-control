# Status do Projeto: MIDI Playback Control

**Data:** 2024
**Status:** Fase de Setup e Fundação Concluída ✅

---

## ✅ Fase 1: Fundação e Configuração Concluída

### 1.1 Estrutura Base Criada
- [x] Projeto Ionic + Angular inicializado
- [x] TypeScript com tipagem estrita
- [x] Capacitor configurado (`@capacitor/core`, `@capacitor/android`)
- [x] Structure de pastas organizada em `src/app/`

### 1.2 Configuração de Desenvolvimento
- [x] ESLint + Prettier (code quality & formatting)
- [x] Prettier pré-formatação com semikolon + single quotes
- [x] TypeScript strict mode habilitado
- [x] Capacitor config (iOS/Android targets)

### 1.3 Testes Configurados
- [x] Jest substituindo Karma/Jasmine
- [x] `jest.config.js` customizado para Angular
- [x] `setup-jest.ts` para ambiente de testes
- [x] `tsconfig.spec.json` atualizado para Jest
- [x] Exemplos de specs: `config.service.spec.ts`, `rtp-midi.service.spec.ts`

### 1.4 Documentação de Entrada
- [x] `README.md` - Visão geral do projeto
- [x] `WELCOME.md` - Guia de boas-vindas para novos contribuidores
- [x] `PROJECT_FOUNDATION.md` - Arquitetura, decisões técnicas, diretrizes
- [x] `.copilot/` - Configurações e instruções para Copilot

---

## 📋 Próximas Fases

### Fase 2: MVP — Implementação de RTP-MIDI
**Escopo:** Envio de comandos MIDI via Wi-Fi para iPad

#### Tarefas Principais:
1. **Serviço de Rede (RtpMidiService)**
   - [ ] Interface para entrada de IP/Porta do iPad
   - [ ] Implementação do handshake AppleMIDI (IN/OK packets)
   - [ ] Keep-alive com pacotes CK (Clock Sync)
   - [ ] Envio de comandos MIDI (Note On, Control Change)
   - [ ] Manipulação binária com `Uint8Array` / `DataView`

2. **Componentes de UI/UX (Palco)**
   - [ ] Componente "Stage" com botões grandes
   - [ ] Botões: Play, Stop, Próxima, Seções, Loops
   - [ ] Otimização para touch (`touch-action: manipulation`)
   - [ ] Feedback visual de conexão/estado

3. **Persistência**
   - [ ] LocalStorage para IP/Porta do iPad
   - [ ] Configurações de usuário

4. **Testes**
   - [ ] Unit tests para RtpMidiService
   - [ ] Integration tests com mock UDP
   - [ ] Tests de UI dos componentes de stage

---

### Fase 3: Upgrade — Telemetria Bidirecional (OSC)
**Escopo:** Receber feedback do Playback em tempo real

#### Tarefas Principais:
1. **Serviço OSC (OscService)**
   - [ ] Listener UDP local no Android
   - [ ] Parsing de mensagens OSC (addresses, arguments)
   - [ ] Atualização de estado reativo (RxJS Signals)

2. **Telemetria na UI**
   - [ ] Display de música atual
   - [ ] Tempo decorrido/restante
   - [ ] Alerta de fim de faixa
   - [ ] Seção atual

3. **Integração RTP-MIDI + OSC**
   - [ ] Comunicação bidirecional coordenada
   - [ ] Sincronização de estado

---

### Fase 4: Descoberta de Rede (mDNS/Bonjour)
**Escopo:** Localizar iPad automaticamente

#### Tarefas Principais:
1. **Implementação mDNS**
   - [ ] Discovery de serviços `_apple-midi._udp`
   - [ ] Alternativa: `_osc._udp`
   - [ ] UI para seleção automática

---

## 📊 Checklist de Verificação

### Dependências
```bash
npm list | grep -E "(ionic|@angular|@capacitor|jest)"
```

### Build & Lint
```bash
npm run build          # Build produção
npm run lint           # ESLint
npm run test           # Jest tests
npm run format         # Prettier format
```

### Git
```bash
git log --oneline      # Histórico de commits
git branch -a          # Branches disponíveis
```

---

## 🎯 Decisões Arquiteturais Registradas

1. **Angular + RxJS/Signals** - Reatividade moderna
2. **Ionic Capacitor** - Nativo Android com web tech
3. **Jest** - Testes rápidos e moderno (não Karma/Jasmine)
4. **Modular** - Serviços separados (RtpMidi, Osc, Config)
5. **Tipagem Estrita** - `strict: true` em tsconfig.json
6. **Código em Inglês** - Comentários, nomes, documentação técnica

---

## 📝 Notas para Próximas Sessões

- **Variáveis de Ambiente:** Considere `.env.example` para configurações de desenvolvimento (IPs de teste)
- **Mock Data:** Preparar mock services para testes sem iPad físico
- **Capacitor Plugins:** Verificar `@capacitor-community/udp` para versão compatível com Capacitor 6+
- **iOS Support:** Feitura atual é Android, mas Ionic/Capacitor suporta iOS com mesma base

---

**Mantido por:** Copilot AI
**Última atualização:** Fase de Configuração
