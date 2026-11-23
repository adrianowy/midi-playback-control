# Copilot AI Instructions — MIDI Playback Control

**Project Language:** Portuguese (Brazil) for discussions · English for all code, comments, and documentation

---

## 🎯 Project Purpose

Develop a native Android mobile application to remotely control **Playback (MultiTracks.com)** running on an **iPad** via local **Wi-Fi** using:
- **Frontend:** Angular (TypeScript, RxJS/Signals)
- **Runtime:** Ionic Capacitor (@capacitor/core, @capacitor/android)
- **Network Communication:** UDP sockets (@capacitor-community/udp)
- **Protocols:** RTP-MIDI (AppleMIDI RFC 6295) → Phase 1; OSC (Phase 2)

---

## 📐 Architecture Principles

### 1. **Modular Layer Separation**
- **Network/Protocol Layer:** `RtpMidiService`, `OscService` — handle binary serialization, UDP communication, handshakes
- **State Management:** Services with RxJS Observables or Angular Signals
- **UI/Presentation:** Dumb components receiving data from services
- **Configuration:** Centralized in `environment.ts`, `config.service.ts`

### 2. **Binary Data Handling**
- Use native `Uint8Array`, `DataView`, `TextEncoder` for packet assembly/parsing
- **Never hardcode hex literals in components** — keep in protocol services
- Base64 conversion only at UDP plugin boundary (Capacitor)
- Document byte-offset calculations with clear comments

### 3. **Network Lifecycle**
- Explicit `connect()`, `disconnect()` methods with status observables
- Cleanup in `ngOnDestroy` and service teardown
- Keep-alive strategies (RTP clock sync packets) for session persistence
- Error handling with retry logic (exponential backoff for reconnection)

### 4. **TypeScript Strict Mode**
- **Always enabled:** `strict: true` in `tsconfig.json`
- Strong typing for all async operations (`Observable<T>`, `Promise<T>`)
- No `any` types — use generics or explicit unions
- Nullable fields explicitly typed (`T | null`)

---

## 🏗️ Project Structure

```
midi-playback-control/
├── .copilot/
│   ├── instructions.md (this file)
│   ├── naming-conventions.md
│   ├── protocol-specs.md
│   └── skills.json
├── .github/
│   ├── workflows/
│   │   ├── lint.yml
│   │   ├── build.yml
│   │   └── android-build.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── rtp-midi.service.ts
│   │   │   │   ├── osc.service.ts
│   │   │   │   ├── config.service.ts
│   │   │   │   └── connection-manager.service.ts
│   │   │   ├── models/
│   │   │   │   ├── midi.types.ts
│   │   │   │   ├── osc.types.ts
│   │   │   │   └── connection.types.ts
│   │   │   └── interceptors/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── connection-status/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── error-banner/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── stage-control/
│   │   │   │   ├── components/
│   │   │   │   │   ├── control-panel/
│   │   │   │   │   ├── playback-status/
│   │   │   │   │   └── section-selector/
│   │   │   │   ├── pages/
│   │   │   │   └── stage-control.module.ts
│   │   │   ├── connection/
│   │   │   │   ├── pages/
│   │   │   │   │   └── connection-setup/
│   │   │   │   └── connection.module.ts
│   │   │   └── settings/
│   │   │       ├── pages/
│   │   │       └── settings.module.ts
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   ├── globals.scss
│   │   ├── variables.scss
│   │   └── accessibility.scss
│   ├── index.html
│   └── main.ts
├── android/
│   ├── capacitor.settings.gradle
│   └── app/
│       └── src/main/AndroidManifest.xml
├── e2e/
├── docs/
│   ├── PHASE1_RTP_MIDI.md
│   ├── PHASE2_OSC.md
│   ├── NETWORK_DISCOVERY.md
│   └── API_REFERENCE.md
├── capacitor.config.ts
├── package.json
├── tsconfig.json
├── angular.json
├── ionic.config.json
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

---

## 🔧 Coding Standards

### File Naming
- **Services:** `feature-name.service.ts`
- **Components:** `component-name.component.ts` (folder with `.html`, `.scss`, `.spec.ts`)
- **Models/Types:** `entity-name.types.ts` or `entity-name.model.ts`
- **Modules:** `feature.module.ts`
- **Constants:** Use `CONSTANT_NAME` in `src/app/core/constants/`

### Naming Conventions
- **Private methods/fields:** `#privateMethod()`, `#privateField`
- **Observable properties:** Suffix with `$` (e.g., `connectionStatus$: Observable<Status>`)
- **Signals:** Suffix with `Signal` (e.g., `connectionStatusSignal = signal<Status>(...)`)
- **Event emitters:** `onEventName` (e.g., `onConnectionEstablished`)

### Code Style
- **Formatting:** Prettier with 2 spaces, single quotes
- **Linting:** ESLint + Angular style guide
- **Unused imports:** Always removed (checked by ESLint)
- **Comments:** Only for non-obvious logic; prefer self-documenting code
  - **Protocol specs:** Always comment binary structures (byte offsets, purposes)
  - **Example:** 
    ```typescript
    // AppleMIDI Invitation packet: 0xFFFF494E (2 bytes magic + 2 bytes command)
    // Followed by: protocol version (4), initiator token (4), ssrc (4)
    const invitePacket = new Uint8Array([0xFF, 0xFF, 0x49, 0x4E, ...]);
    ```

### Async Patterns
- **Prefer RxJS Observables** in services for multi-consumer scenarios
- **Use Signals** for simple state in components
- **Never nest subscriptions** — use `switchMap`, `mergeMap`, `combineLatest`, `takeUntil`
- **Unsubscribe:** Use `takeUntil(this.destroy$)` or `takeUntilDestroyed()` (Angular 16+)
- **Example:**
  ```typescript
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.connectionStatus$
      .pipe(
        takeUntil(this.destroy$),
        filter(status => status === 'connected')
      )
      .subscribe(() => this.startKeepAlive());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ```

### Error Handling
- All promises/observables **must** have error handlers
- Create domain-specific error types in `core/models/errors.ts`
- Propagate meaningful messages to UI
- **Example:**
  ```typescript
  connect(ipAddress: string, port: number): Observable<void> {
    return this.udpPlugin.open({ address: ipAddress, port }).pipe(
      catchError(error => {
        const domainError = new ConnectionError(
          `Failed to connect to ${ipAddress}:${port}`,
          error
        );
        return throwError(() => domainError);
      })
    );
  }
  ```

---

## 🚀 Development Workflow

### Before Starting
1. Check `.copilot/protocol-specs.md` for binary protocol details
2. Check `.copilot/naming-conventions.md` for exact naming rules
3. Review existing tests to understand patterns

### During Development
- **Run linter:** `npm run lint`
- **Run tests:** `npm run test`
- **Build:** `npm run build` (web) or `npm run build:android` (APK)
- **Debug:** Use Chrome DevTools for web; Android Logcat for native code

### Code Review Checklist (Copilot Self-Check)
- [ ] All types are strict (no `any`)
- [ ] All async operations have error handlers
- [ ] Unused imports removed
- [ ] Protocol binary structures commented with byte offsets
- [ ] No hardcoded magic numbers outside of constants
- [ ] `ngOnDestroy` implemented for subscription cleanup
- [ ] Prettier/ESLint passing
- [ ] Tests added for new logic (if applicable)
- [ ] Documentation updated (`.md` files in `/docs`)

---

## 📚 Important References

| File | Purpose |
|------|---------|
| `.copilot/protocol-specs.md` | RTP-MIDI, OSC binary structures, handshakes |
| `.copilot/naming-conventions.md` | Exact naming rules for methods, constants, files |
| `docs/PHASE1_RTP_MIDI.md` | Detailed Phase 1 implementation guide |
| `docs/PHASE2_OSC.md` | Phase 2 (telemetry) roadmap |
| `src/app/core/models/midi.types.ts` | MIDI message interfaces |
| `src/app/core/services/rtp-midi.service.ts` | Main network protocol handler |

---

## 🎯 Phase 1 (MVP) Milestones

1. ✅ Project scaffold (Angular + Capacitor)
2. ⏳ `RtpMidiService` with AppleMIDI handshake
3. ⏳ Stage control component (Play, Stop, Next, Sections)
4. ⏳ Connection setup page (IP/Port input, localStorage)
5. ⏳ Keep-alive (clock sync packets)
6. ⏳ Testing + Android APK build
7. ⏳ Documentation

---

## ⚠️ Critical Notes for Copilot

1. **iPad Playback Requirements:**
   - Velocity **must** be `> 0` (never `0x00`) for MIDI Note On commands
   - AppleMIDI handshake is **mandatory** on both ports (5004 and 5005)
   - Clock sync packets (`CK`) prevent session timeout

2. **UDP Plugin Gotchas:**
   - Base64 encoding/decoding happens at Capacitor boundary
   - Always decode on receive; always encode on send
   - Handle `SocketId` lifecycle carefully

3. **Testing Priority:**
   - Unit tests for binary packet assembly (MIDI, RTP headers)
   - Integration tests for handshake sequence
   - E2E tests for full control flow (if possible)

4. **No External Dependencies Without Approval**
   - Approve new npm packages via discussion before install
   - Prefer native Web APIs and Angular built-ins

---

**Last Updated:** 2026-11-23  
**Maintained By:** Copilot AI
