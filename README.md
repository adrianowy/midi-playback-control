# Project README

> 🎵 **Remote Control for MultiTracks Playback on iPad via Android**

A native Android mobile application to remotely control **Playback (MultiTracks.com)** running on an **iPad** via local **Wi-Fi** using **RTP-MIDI (AppleMIDI)** and **OSC** protocols.

---

## 📋 Project Information

- **Language:** Portuguese (Brazil) for discussions · **English for all code**
- **Repository:** [adrianowy/midi-playback-control](https://github.com/adrianowy/midi-playback-control)
- **Status:** MVP (Phase 1 - RTP-MIDI in development)
- **Maintained By:** Copilot AI (with guidance from developers)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular (TypeScript, RxJS/Signals) |
| **Mobile Runtime** | Ionic Capacitor (@capacitor/core, @capacitor/android) |
| **Network** | UDP Sockets (@capacitor-community/udp) |
| **Protocol (Phase 1)** | RTP-MIDI (AppleMIDI RFC 6295) |
| **Protocol (Phase 2)** | OSC (Open Sound Control) |

---

## 📐 Project Architecture

### Folder Structure
```
.copilot/                      # Copilot AI instructions & specs
├── instructions.md            # Main AI directives
├── naming-conventions.md      # Code naming rules
├── protocol-specs.md          # Binary protocol definitions
└── skills.json               # Copilot skills & patterns

src/app/core/                 # Core services & types
├── services/                 # RtpMidiService, OscService, etc.
├── models/                   # Type definitions & interfaces
└── constants/                # Protocol constants

src/app/shared/               # Reusable components & utilities
├── components/               # UI components (spinners, banners)
└── directives/               # Custom directives

src/app/features/             # Feature modules
├── stage-control/            # Main control interface
├── connection/               # Connection setup & management
└── settings/                 # Settings & configuration

docs/                         # Detailed documentation
├── PHASE1_RTP_MIDI.md        # Phase 1 implementation guide
├── PHASE2_OSC.md             # Phase 2 roadmap
└── NETWORK_DISCOVERY.md      # mDNS/Bonjour discovery (future)

capacitor.config.ts           # Capacitor configuration
tsconfig.json                 # TypeScript strict mode enabled
ionic.config.json             # Ionic CLI configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Ionic CLI: `npm install -g @ionic/cli`
- Android SDK (for APK build)
- iPad with Playback app + Wi-Fi network

### Installation
```bash
# Clone repository
git clone https://github.com/adrianowy/midi-playback-control.git
cd midi-playback-control

# Install dependencies
npm install

# Install Capacitor plugins
npm install @capacitor/core @capacitor/android
npm install @capacitor-community/udp

# Initialize Capacitor for Android
npx cap init
npx cap add android
```

### Development

```bash
# Start development server
npm start

# Run linter
npm run lint

# Run tests
npm run test

# Build for web
npm run build

# Sync Android project
npx cap sync android

# Build APK
npm run build:android
```

---

## 🎯 Phases & Milestones

### Phase 1: MVP — RTP-MIDI Control (In Progress)
- [x] Project setup & scaffolding
- [ ] `RtpMidiService` with AppleMIDI handshake (ports 5004/5005)
- [ ] Stage control component (Play, Stop, Next, Sections)
- [ ] Connection setup page (IP/Port input, localStorage)
- [ ] Keep-alive (clock sync packets)
- [ ] Testing + Android APK build

**Deliverable:** Android APK capable of sending MIDI commands to Playback.

### Phase 2: Telemetry — OSC Feedback (Future)
- [ ] `OscService` for receiving state from iPad
- [ ] Display current track, time position, section info
- [ ] Real-time playback status updates
- [ ] Bidirectional communication layer

**Deliverable:** Full 2-way control + status display.

### Phase 3: Network Discovery (Future)
- [ ] mDNS/Bonjour scanning (`_apple-midi._udp`, `_osc._udp`)
- [ ] Automatic iPad discovery without manual IP entry
- [ ] Persistent connection profiles

**Deliverable:** Zero-config networking.

---

## 📖 Documentation

For detailed information, see:

| Document | Purpose |
|----------|---------|
| [`.copilot/instructions.md`](./.copilot/instructions.md) | AI development directives, architecture principles |
| [`.copilot/naming-conventions.md`](./.copilot/naming-conventions.md) | TypeScript naming rules, code style |
| [`.copilot/protocol-specs.md`](./.copilot/protocol-specs.md) | Binary protocol specs (RTP-MIDI, OSC) |
| [`docs/PHASE1_RTP_MIDI.md`](./docs/PHASE1_RTP_MIDI.md) | Phase 1 implementation details |
| [`docs/PHASE2_OSC.md`](./docs/PHASE2_OSC.md) | Phase 2 roadmap & OSC integration |

---

## 🔑 Key Design Principles

1. **Modular Separation:** Protocol/network services ← separate from → UI components
2. **Binary Protocol Handling:** Native `Uint8Array`, `DataView` with clear byte-offset comments
3. **Strict TypeScript:** `strict: true`, no `any` types, strong typing throughout
4. **Reactive Architecture:** RxJS Observables in services, Angular Signals in components
5. **Proper Cleanup:** `ngOnDestroy` with subscription teardown, explicit socket management

---

## ⚠️ Critical Requirements

### iPad Playback (Receiver)
- ✅ Listens on ports **5004** (control) & **5005** (data)
- ✅ Requires complete **AppleMIDI handshake** on both ports
- ✅ **Velocity must be > 0** for MIDI Note On commands (default: 0x7F)
- ✅ Keeps session alive with **clock sync packets** every 2 seconds

### Android App (Sender)
- ✅ Initiates AppleMIDI handshake with invitation + acceptance flow
- ✅ Maintains session with periodic keep-alive packets
- ✅ Handles network errors with exponential backoff retry
- ✅ Cleans up resources on disconnect

---

## 💬 Communication Guidelines

- **Discussions:** Portuguese (Brazil) only
- **Code Comments:** English only
- **Commit Messages:** English
- **Documentation:** English

This ensures clarity for international collaboration while maintaining consistency across the codebase.

---

## 🤝 Development with Copilot

This project is **designed to be developed primarily by Copilot AI** with human oversight.

**For Copilot:**
- Always reference `.copilot/instructions.md` for architecture & patterns
- Check `.copilot/naming-conventions.md` for naming rules **before writing code**
- Consult `.copilot/protocol-specs.md` for binary packet assembly
- Maintain TypeScript strict mode and proper async handling
- Add tests for new logic (unit tests for binary protocol, integration tests for handshakes)

**For Developers:**
- Review and approve Copilot-generated PRs
- Provide feedback on design decisions
- Discuss architectural questions using Portuguese
- Keep AI instructions updated as requirements evolve

---

## 📝 License

(To be defined)

---

## 📧 Contact & Support

For questions or discussions about this project, please open an issue on GitHub or reach out to the development team.

---

**Last Updated:** 2026-11-23  
**AI-Assisted Development:** Copilot SDK in VS Code
