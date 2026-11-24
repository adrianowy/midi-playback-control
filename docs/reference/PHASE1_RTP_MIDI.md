# Phase 1: RTP-MIDI Implementation Guide

**Status:** In Development  
**Objective:** Send MIDI commands from Android to iPad Playback via RTP-MIDI (AppleMIDI RFC 6295)

---

## Overview

Phase 1 is the **MVP (Minimum Viable Product)** focused on **unidirectional control** from Android → iPad.

The app will:
1. Connect to iPad Playback via Wi-Fi using **AppleMIDI handshake**
2. Send **MIDI commands** to control playback (Play, Stop, Next, etc.)
3. Maintain connection with **keep-alive packets**
4. Handle **errors and reconnection** gracefully

---

## Architecture

### Components

```
RtpMidiService (Core)
├── Handshake management (control port 5004 + data port 5005)
├── MIDI message serialization
├── RTP header wrapping
├── Keep-alive clock sync
└── Error handling & retry

ConfigService (Persistence)
├── Store/load IP address
├── Store/load port configuration
└── Manage connection preferences

Stage Control Component (UI)
├── Play / Stop buttons
├── Next / Previous buttons
├── Section selector
└── Connection status indicator
```

---

## Implementation Steps

### Step 1: UDP Plugin Integration
- [ ] Install `@capacitor-community/udp`
- [ ] Create wrapper/adapter for UDP send/receive
- [ ] Handle base64 encoding/decoding at plugin boundary
- [ ] Error handling for socket failures

### Step 2: AppleMIDI Handshake
- [ ] Implement **Invitation packet builder** (port 5004)
- [ ] Implement **Acceptance packet parser**
- [ ] Validate **initiator token** matching
- [ ] Repeat handshake on **data port (5005)**
- [ ] Add timeout & retry logic

### Step 3: MIDI Command Serialization
- [ ] Build MIDI Note On messages (velocity > 0 requirement)
- [ ] Build MIDI Note Off messages
- [ ] Build MIDI Control Change messages
- [ ] Wrap in RTP header with correct timestamp/sequence

### Step 4: Keep-Alive Mechanism
- [ ] Implement **clock sync packet** builder
- [ ] Send every 2 seconds on control port
- [ ] Cycle through count values (0 → 1 → 2)
- [ ] Handle stop on disconnect

### Step 5: UI Implementation
- [ ] Connection setup page (IP + port input)
- [ ] Connection status indicator
- [ ] Control panel with large touch-friendly buttons
- [ ] Error banner for connection issues

### Step 6: Testing & Build
- [ ] Unit tests for binary packet assembly
- [ ] Integration tests for handshake sequence
- [ ] E2E tests for full control flow (if possible)
- [ ] Build APK and test on actual Android device + iPad

---

## Key Technical Details

### Handshake Sequence (Simplified)

```
Android                                    iPad Playback
──────────                                 ──────────────

1. Send Invitation packet
   (port 5004, initiator token = 0x12345678)
   ──────────────────────────────────────→

2. Receive Acceptance packet
   (echoes token 0x12345678)
   ←──────────────────────────────────────

3. Send Invitation packet
   (port 5005, same token)
   ──────────────────────────────────────→

4. Receive Acceptance packet
   ←──────────────────────────────────────

5. Handshake Complete ✓
   Start sending MIDI commands & keep-alive

6. Send Clock Sync every 2 seconds
   ──────────────────────────────────────→
   (Prevents session timeout)
```

### MIDI Message Format

**Note On** (Play/Pause/Next buttons):
```
Byte 0: Status (0x90 = Note On, channel 1)
Byte 1: Note Number (e.g., 94 for Play)
Byte 2: Velocity (0x7F = 127, NEVER 0x00)
```

**Example:** `[0x90, 94, 0x7F]` = Note On, Note 94, Velocity 127

---

## Packet Structures (Binary)

### Invitation Packet (20 bytes minimum)

```
Offset  Size  Content                 Value
------  ----  -------                 -----
0-1     2     Signature               0xFFFF
2-3     2     Command                 0x494E ('IN')
4-7     4     Protocol Version        0x00000002
8-11    4     Initiator Token         Random 32-bit
12-15   4     SSRC                    Random 32-bit
16-19   4     Session Name Length     0x00000000 (MVP)
```

### Clock Sync Packet (12 bytes)

```
Offset  Size  Content                 Value
------  ----  -------                 -----
0-1     2     Signature               0xFFFF
2-3     2     Command                 0x434B ('CK')
4-7     4     SSRC                    Sender's SSRC
8       1     Count                   0, 1, or 2 (cycle)
9-11    3     Pad                     0x000000
```

---

## Error Handling Strategy

| Error | Trigger | Action |
|-------|---------|--------|
| **Handshake Timeout** | No response within 5s | Retry up to 3 times, then error |
| **Connection Lost** | Socket error or timeout | Auto-reconnect with exponential backoff |
| **Invalid Velocity** | Velocity = 0 on Note On | Throw MidiProtocolError, prevent send |
| **Invalid IP** | Malformed IP address | Show validation error in UI |

---

## Configuration (localStorage)

Persisted keys:
- `midi_playback_last_ip` — Last connected IP address
- `midi_playback_last_control_port` — Control port (default 5004)
- `midi_playback_last_data_port` — Data port (default 5005)
- `midi_playback_last_session_name` — Session identifier

---

## UI Flow

```
App Start
   ↓
Connection Setup Page
   ├─ Input: IP Address
   ├─ Input: Control Port (default 5004)
   ├─ Button: "Connect"
   └─ [Load from storage if available]
   ↓
[Connecting...]
   ├─ Handshake on port 5004
   ├─ Handshake on port 5005
   └─ Start keep-alive
   ↓
Stage Control Page
   ├─ [Connected] status indicator
   ├─ Play / Stop buttons
   ├─ Next / Previous buttons
   ├─ Section selector
   └─ Disconnect button
```

---

## Testing Checklist

- [ ] **Unit:** Invitation packet builder produces correct bytes
- [ ] **Unit:** Acceptance packet validator correctly validates token
- [ ] **Unit:** MIDI message builders (Note On/Off, CC) are correct
- [ ] **Unit:** RTP header construction is correct
- [ ] **Integration:** Full handshake sequence (5004 → 5005)
- [ ] **Integration:** Keep-alive packets sent every 2 seconds
- [ ] **E2E:** Android app sends commands → iPad Playback receives
- [ ] **E2E:** Connection persists with keep-alive (5+ minutes)
- [ ] **E2E:** Graceful disconnect with BYE packet

---

## Known Limitations (MVP)

- ❌ No session name support (always empty)
- ❌ No clock sync timestamp info (minimal packet)
- ❌ No journal/recovery data (not critical for MVP)
- ❌ No network discovery (manual IP entry required)
- ❌ No telemetry from iPad (Phase 2)

---

## References

- **RFC 6295:** RTP MIDI Protocol (AppleMIDI)
- **MIDI Specification:** https://www.midi.org/
- **Capacitor UDP:** https://github.com/capacitor-community/udp

---

**Last Updated:** 2026-11-23  
**Next Phase:** Phase 2 - OSC Telemetry & Bidirectional Communication
