# Documentation Index

Complete documentation for the MIDI Playback Control project.

---

## 🎯 Getting Started

1. **[README.md](../README.md)** — Project overview, tech stack, quick start
2. **[.copilot/instructions.md](../.copilot/instructions.md)** — Copilot AI development guidelines
3. **[.copilot/naming-conventions.md](../.copilot/naming-conventions.md)** — Code naming standards
4. **[.copilot/protocol-specs.md](../.copilot/protocol-specs.md)** — Binary protocol specifications

---

## 📋 Development Phases

### Phase 1: MVP — RTP-MIDI Control ✅ [In Development]

**Document:** [PHASE1_RTP_MIDI.md](./PHASE1_RTP_MIDI.md)

**Overview:** Unidirectional MIDI command transmission from Android to iPad Playback.

**Key Features:**
- AppleMIDI handshake (ports 5004/5005)
- MIDI Note On/Off commands
- Keep-alive clock sync
- Connection setup UI
- Error handling & reconnection

**Status:** Service framework complete, UDP integration pending

---

### Phase 2: Telemetry — OSC Feedback 📊 [Planned]

**Document:** [PHASE2_OSC.md](./PHASE2_OSC.md)

**Overview:** Bidirectional communication with real-time playback status from iPad.

**Key Features:**
- OSC message listener
- Track info display (name, duration, position)
- Real-time progress updates
- Section indicator

**Status:** Service framework complete, UDP listener implementation pending

---

### Phase 3: Network Discovery 🔍 [Future]

**Document:** [NETWORK_DISCOVERY.md](./NETWORK_DISCOVERY.md) (To be created)

**Overview:** Automatic iPad discovery via mDNS/Bonjour.

**Key Features:**
- Zero-config networking
- Device browser UI
- Connection profiles

**Status:** Planned for v2.0+

---

## 🏗️ Architecture & Design

### Project Structure

```
.copilot/                   # AI development directives
docs/                       # This folder
src/app/core/               # Services, models, constants
  ├── services/
  │   ├── rtp-midi.service.ts
  │   ├── osc.service.ts
  │   └── config.service.ts
  ├── models/
  │   ├── connection.types.ts
  │   ├── midi.types.ts
  │   ├── osc.types.ts
  │   └── errors.ts
  └── constants/
      ├── midi.constants.ts
      ├── network.constants.ts
      ├── osc.constants.ts
      └── storage.constants.ts

src/app/features/           # Feature modules
  ├── stage-control/        # Main control UI
  ├── connection/           # Connection setup
  └── settings/             # App settings
```

### Design Patterns

1. **Modular Layer Separation**
   - Protocol layer (services) ← separate from → UI layer (components)
   - Configuration persistence (ConfigService)
   - Error handling (custom error classes)

2. **Reactive Architecture**
   - RxJS Observables for async operations
   - Angular Signals for simple state
   - Proper subscription cleanup

3. **Binary Protocol Handling**
   - Native `Uint8Array` for packet assembly
   - `DataView` for byte-level operations
   - Base64 at plugin boundaries only

4. **TypeScript Strict Mode**
   - `strict: true` in tsconfig.json
   - No `any` types
   - Explicit error handling

---

## 🔧 Technical References

### Protocol Specifications

- **AppleMIDI (RFC 6295):** See [.copilot/protocol-specs.md](../.copilot/protocol-specs.md)
  - Handshake packet structure
  - Clock sync packets
  - MIDI message format over RTP

- **OSC 1.0:** See [.copilot/protocol-specs.md](../.copilot/protocol-specs.md)
  - Message format & parsing
  - Type tags & arguments
  - Address patterns

### Code Standards

- **Naming:** [.copilot/naming-conventions.md](../.copilot/naming-conventions.md)
- **Architecture:** [.copilot/instructions.md](../.copilot/instructions.md)
- **Async Patterns:** Observable + Signals, takeUntil cleanup
- **Error Handling:** Domain-specific error classes

---

## 📦 Dependencies

### Core
- `@angular/core` — Framework
- `@angular/router` — Routing
- `rxjs` — Reactive programming
- `@ionic/angular` — UI components
- `@capacitor/core` — Mobile runtime

### Network
- `@capacitor-community/udp` — UDP sockets (Phase 1 integration)

### Development
- `typescript` — Type checking
- `eslint` — Linting
- `prettier` — Code formatting
- `jasmine/karma` — Testing

---

## 🧪 Testing

### Test Coverage Areas

1. **Protocol Layer (Unit Tests)**
   - Packet builders (invitation, clock sync, MIDI)
   - Packet parsers (acceptance, OSC)
   - Error handling

2. **Service Layer (Integration Tests)**
   - Handshake sequence
   - Connection lifecycle
   - Keep-alive mechanism

3. **UI Layer (E2E Tests)**
   - Full connection flow
   - Command transmission
   - Feedback updates

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- rtp-midi.service.spec

# Run with coverage
npm run test -- --code-coverage
```

---

## 🚀 Build & Deployment

### Development

```bash
npm start              # Dev server + file watch
npm run lint           # ESLint check
npm run format         # Prettier format
```

### Production

```bash
npm run build          # Web build (dist/)
npm run build:prod     # Production optimized
npm run build:android  # APK build
```

### Android APK Build

```bash
npm run build:android
# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🐛 Troubleshooting

### Common Issues

**Q: Connection fails immediately**  
A: Check iPad IP address, ensure Wi-Fi is on same network, verify ports 5004/5005 are open

**Q: Handshake times out**  
A: Increase `HANDSHAKE_TIMEOUT_MS` in network.constants.ts, check network latency

**Q: MIDI commands not received**  
A: Verify velocity > 0 (see MIDI constant), check RTP sequence number increment, ensure keep-alive is running

**Q: "Velocity cannot be 0" error**  
A: This is intentional! iPad Playback ignores Note On with velocity 0. Use default 0x7F.

---

## 📖 External References

- **RFC 6295:** RTP MIDI Protocol (AppleMIDI)
  - https://tools.ietf.org/html/rfc6295

- **MIDI Specification:**
  - https://www.midi.org/specifications

- **OSC 1.0 Specification:**
  - http://opensoundcontrol.org/spec-1_0

- **Ionic Documentation:**
  - https://ionicframework.com/docs

- **Angular Documentation:**
  - https://angular.io/docs

- **Capacitor Documentation:**
  - https://capacitorjs.com/docs

---

## 📝 Contributing

### Code Review Checklist

Before committing, ensure:

- [ ] All types are strict (no `any`)
- [ ] All async operations have error handlers
- [ ] Unused imports removed
- [ ] Protocol binary structures documented with byte offsets
- [ ] No hardcoded magic numbers outside of constants
- [ ] `ngOnDestroy` implemented for subscription cleanup
- [ ] ESLint/Prettier passing
- [ ] Tests added for new logic
- [ ] Documentation updated

### Commit Guidelines

- Use English for commit messages
- Reference issues/PRs when applicable
- Include description of changes

**Example:**

```
feat: implement AppleMIDI handshake on control port

- Add buildInvitationPacket() method
- Add validateAcceptancePacket() method
- Add timeout handling with retry logic
- Add unit tests for packet validation

Fixes #42
```

---

## 🎓 Learning Resources

### For Developers New to This Project

1. Read [README.md](../README.md) first
2. Review [.copilot/instructions.md](../.copilot/instructions.md) for architecture
3. Study [.copilot/protocol-specs.md](../.copilot/protocol-specs.md) for binary protocols
4. Review existing services in `src/app/core/services/`
5. Run tests to understand expected behavior

### For Copilot AI

1. Always reference `.copilot/instructions.md` before writing code
2. Check `.copilot/naming-conventions.md` for exact naming rules
3. Review `.copilot/protocol-specs.md` for binary packet structures
4. Run linter/tests after code generation
5. Update documentation in `docs/` folder for new features

---

**Last Updated:** 2026-11-23  
**Maintainer:** Copilot AI + Development Team
