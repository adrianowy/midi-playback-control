# Protocol Specifications — RTP-MIDI & OSC

**All Implementations:** English  
**Reference:** RFC 6295 (AppleMIDI), OSC 1.0

---

## Phase 1: RTP-MIDI (AppleMIDI RFC 6295)

### Overview
- **Protocol:** UDP-based MIDI over RTP
- **Ports:** iPad Playback listens on two consecutive ports:
  - **Control Port:** 5004 (handshake, acknowledgment)
  - **Data Port:** 5005 (MIDI commands, clock sync)
- **Requirement:** Complete handshake on **both** ports before sending MIDI commands

---

### AppleMIDI Packet Structure

#### 1. Invitation Packet (Handshake Initiation)
Sent on **Control Port (5004)** to initiate session.

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       2     Signature          0xFFFF (magic)
2       2     Command            0x494E ('IN' = Invitation)
4       4     Protocol Version   0x00000002 (version 2)
8       4     Initiator Token    Random 32-bit value
12      4     SSRC               Synchronization Source ID
16      1     Session Name Len   Length of session name (1-32 bytes)
17      N     Session Name       ASCII string (optional)
```

**Minimum packet size:** 20 bytes (without session name)

```typescript
// Example: Build invitation packet
const invitePacket = new Uint8Array(20);
const view = new DataView(invitePacket.buffer);

// 0-1: Signature
view.setUint16(0, 0xFFFF, false);

// 2-3: Command ('IN')
view.setUint8(2, 0x49); // 'I'
view.setUint8(3, 0x4E); // 'N'

// 4-7: Protocol version
view.setUint32(4, 0x00000002, false);

// 8-11: Initiator token (random)
const initiatorToken = Math.floor(Math.random() * 0xFFFFFFFF);
view.setUint32(8, initiatorToken, false);

// 12-15: SSRC
const ssrc = Math.floor(Math.random() * 0xFFFFFFFF);
view.setUint32(12, ssrc, false);

// 16: Session name length (optional)
view.setUint8(16, 0);
```

---

#### 2. Acceptance Packet (Handshake Response)
iPad Playback sends in response to Invitation.

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       2     Signature          0xFFFF
2       2     Command            0x4F4B ('OK' = Acceptance)
4       4     Protocol Version   0x00000002
8       4     Initiator Token    Echo of initiator token from invitation
12      4     SSRC               iPad's SSRC
16      1     Session Name Len   Length of session name
17      N     Session Name       ASCII string (optional)
```

**Key:** Initiator Token in acceptance **must match** the token sent in invitation.

```typescript
// Validation example
function validateAcceptancePacket(
  packet: Uint8Array,
  expectedToken: number
): boolean {
  const view = new DataView(packet.buffer);
  
  // Check signature
  if (view.getUint16(0, false) !== 0xFFFF) return false;
  
  // Check command
  const cmd = view.getUint16(2, false);
  if (cmd !== 0x4F4B) return false; // 'OK'
  
  // Validate token
  const receivedToken = view.getUint32(8, false);
  return receivedToken === expectedToken;
}
```

---

#### 3. Clock Synchronization Packet (Keep-Alive)
Sent on **Control Port (5004)** periodically to keep session alive.

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       2     Signature          0xFFFF
2       2     Command            0x434B ('CK' = Clock Sync)
4       4     SSRC               Sender's SSRC
8       1     Count              Clock sync count (0, 1, or 2)
9       3     Pad                Reserved (zeros)
12      8     Timestamp1         System timestamp (ms)
20      8     Timestamp2         (Optional) Remote timestamp echo
28      8     Timestamp3         (Optional) Time difference
```

**Purpose:** Prevent session timeout during idle playback.  
**Interval:** Send every 2 seconds (or as needed).  
**Count:** Cycles through 0 → 1 → 2 → 0

```typescript
// Keep-alive clock sync packet
function buildClockSyncPacket(ssrc: number, count: number): Uint8Array {
  const packet = new Uint8Array(12);
  const view = new DataView(packet.buffer);

  view.setUint16(0, 0xFFFF, false);       // Signature
  view.setUint8(2, 0x43);                 // 'C'
  view.setUint8(3, 0x4B);                 // 'K'
  view.setUint32(4, ssrc, false);         // SSRC
  view.setUint8(8, count % 3);            // Count: 0, 1, or 2
  // Bytes 9-11: pad with zeros

  return packet;
}
```

---

#### 4. Bye Packet (Session Termination)
Sent on **Control Port (5004)** to gracefully end session.

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       2     Signature          0xFFFF
2       2     Command            0x4259 ('BY' = Bye)
4       4     SSRC               Sender's SSRC
8       1     Session Name Len   Length
9       N     Session Name       ASCII
```

```typescript
function buildByePacket(ssrc: number): Uint8Array {
  const packet = new Uint8Array(8);
  const view = new DataView(packet.buffer);

  view.setUint16(0, 0xFFFF, false);
  view.setUint8(2, 0x42);                 // 'B'
  view.setUint8(3, 0x59);                 // 'Y'
  view.setUint32(4, ssrc, false);
  
  return packet;
}
```

---

### RTP Header (for MIDI Data Packets)

MIDI commands are wrapped in RTP packets and sent on **Data Port (5005)**.

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       1     V, P, X, CC        Version (2), Padding, Extension, CSRC Count
1       1     M, PT              Marker, Payload Type (0x61 = 97 for MIDI)
2       2     Sequence Number    Incremented per packet
4       4     Timestamp          RTP timestamp (90 kHz clock)
8       4     SSRC               Synchronization Source
12      1     Command Section    0x00 (command header)
13      1     Command            0x00 (journal) or 0x01-0x08 (MIDI commands)
14      N     MIDI Data          Variable length MIDI message
```

**Command Codes (Byte 13):**
- `0x00` = Journal (recovery log, can be omitted for MVP)
- `0x01+` = MIDI Command (note on, note off, control change, etc.)

```typescript
// Build RTP header with MIDI payload
function buildRtpMidiPacket(
  midiMessage: Uint8Array,
  sequenceNumber: number,
  timestamp: number,
  ssrc: number
): Uint8Array {
  const headerSize = 14;
  const packet = new Uint8Array(headerSize + midiMessage.length);
  const view = new DataView(packet.buffer);

  // Byte 0: V=2, P=0, X=0, CC=0
  view.setUint8(0, 0x80);

  // Byte 1: M=0, PT=97 (0x61 for MIDI)
  view.setUint8(1, 0x61);

  // Bytes 2-3: Sequence number (big-endian)
  view.setUint16(2, sequenceNumber, false);

  // Bytes 4-7: Timestamp (big-endian, 90 kHz)
  view.setUint32(4, timestamp, false);

  // Bytes 8-11: SSRC
  view.setUint32(8, ssrc, false);

  // Byte 12: Command section header (0x00)
  view.setUint8(12, 0x00);

  // Byte 13: Command (0x00 for journal, or MIDI length+1)
  // For MVP: Use 0x00, copy MIDI directly
  view.setUint8(13, 0x00);

  // Remaining: MIDI message
  packet.set(midiMessage, headerSize);

  return packet;
}
```

---

### MIDI Messages (Payload)

**Standard MIDI Status Bytes:**

| Message | Status | Data Byte 1 | Data Byte 2 |
|---------|--------|-------------|-------------|
| Note On | 0x90 | Note (0-127) | **Velocity (1-127)** ⚠️ |
| Note Off | 0x80 | Note (0-127) | Velocity (0-127) |
| Control Change | 0xB0 | Controller (0-127) | Value (0-127) |
| Program Change | 0xC0 | Program (0-127) | — |

**⚠️ CRITICAL for iPad Playback:** Velocity **must never be 0x00** for Note On commands. Use 0x7F (127) as default.

```typescript
// MIDI Note On (velocity = 0x7F)
function buildNoteOn(noteNumber: number, velocity: number): Uint8Array {
  if (velocity === 0) {
    throw new Error('Velocity cannot be 0 for Note On command');
  }
  return new Uint8Array([0x90, noteNumber, velocity]);
}

// MIDI Note Off
function buildNoteOff(noteNumber: number): Uint8Array {
  return new Uint8Array([0x80, noteNumber, 0x00]);
}

// MIDI Control Change
function buildControlChange(controller: number, value: number): Uint8Array {
  return new Uint8Array([0xB0, controller, value]);
}
```

---

### Complete Handshake Sequence

```
Client (Android)                           iPad (Playback)
─────────────────                           ──────────────

1. Send Invitation (port 5004)
   ─────────────────────────────────────────→
                                        2. Receive Invitation
                                        3. Validate token
                                        4. Send Acceptance
   ←─────────────────────────────────────────
5. Receive Acceptance
6. Validate token match
7. Send Invitation (port 5005)
   ─────────────────────────────────────────→
                                        8. Receive Invitation
                                        9. Send Acceptance
   ←─────────────────────────────────────────
10. Receive Acceptance
11. Handshake COMPLETE ✓

12. Start Keep-Alive (every 2s, port 5004)
    ─────────────────────────────────────────→
    ─────────────────────────────────────────→
    (periodic clock sync)

13. Send MIDI commands (port 5005)
    ─────────────────────────────────────────→
    ─────────────────────────────────────────→
```

---

## Phase 2: OSC (Open Sound Control)

### Overview
- **Protocol:** Text + binary over UDP
- **Purpose:** Telemetry & state from iPad → Android
- **Ports:** Android listens on a local port (e.g., 9000); iPad sends to this port
- **Format:** Address pattern + type tags + arguments

---

### OSC Message Structure

```
Offset  Size  Field              Description
------  ----  -----              -----------
0       N     Address            Null-terminated string (e.g., "/playback/status")
        4-N   Padding            To align to 4-byte boundary
N+P     4     Type Tag String    Comma + type codes + null (e.g., ",is\0")
N+P+4   M     Arguments           Variable-length data for each type
```

**Type Tags:**
- `i` = int32
- `f` = float32
- `s` = string (null-terminated, 4-byte aligned)
- `b` = blob (size prefix, then data)

```typescript
// Example: Parse "/playback/status" with int (song_id) + string (name)
function parseOscMessage(packet: Uint8Array): {
  address: string;
  args: (number | string)[];
} {
  let offset = 0;

  // Read address (null-terminated)
  const addressEnd = packet.indexOf(0, offset);
  const address = new TextDecoder().decode(
    packet.slice(offset, addressEnd)
  );
  offset = Math.ceil((addressEnd + 1) / 4) * 4; // Align to 4 bytes

  // Read type tag string
  const typeTagEnd = packet.indexOf(0, offset);
  const typeTagStr = new TextDecoder().decode(packet.slice(offset, typeTagEnd));
  offset = Math.ceil((typeTagEnd + 1) / 4) * 4;

  // Parse arguments based on type tags (skip comma)
  const args: (number | string)[] = [];
  for (let i = 1; i < typeTagStr.length; i++) {
    const type = typeTagStr[i];
    const view = new DataView(packet.buffer);

    if (type === 'i') {
      args.push(view.getInt32(offset, false));
      offset += 4;
    } else if (type === 'f') {
      args.push(view.getFloat32(offset, false));
      offset += 4;
    } else if (type === 's') {
      const strEnd = packet.indexOf(0, offset);
      args.push(new TextDecoder().decode(packet.slice(offset, strEnd)));
      offset = Math.ceil((strEnd + 1) / 4) * 4;
    }
  }

  return { address, args };
}
```

---

### Expected OSC Messages from iPad Playback

(To be documented once iPad OSC support is verified)

---

## Constants File Structure

```typescript
// src/app/core/constants/midi.constants.ts
export const MIDI = {
  // Ports
  CONTROL_PORT: 5004,
  DATA_PORT: 5005,

  // Note numbers (customize per use case)
  NOTE_PLAY: 94,
  NOTE_STOP: 95,
  NOTE_NEXT: 96,
  NOTE_PREVIOUS: 97,
  NOTE_SECTION_A: 60,
  NOTE_SECTION_B: 61,
  // ... etc

  // Status bytes
  STATUS_NOTE_ON: 0x90,
  STATUS_NOTE_OFF: 0x80,
  STATUS_CONTROL_CHANGE: 0xB0,

  // Velocity
  VELOCITY_DEFAULT: 0x7F,
  VELOCITY_MAX: 0x7F,
};

// src/app/core/constants/network.constants.ts
export const NETWORK = {
  // AppleMIDI
  APPLEMIDI_SIGNATURE: 0xFFFF,
  APPLEMIDI_INVITATION: 0x494E, // 'IN'
  APPLEMIDI_ACCEPTANCE: 0x4F4B, // 'OK'
  APPLEMIDI_CLOCK_SYNC: 0x434B, // 'CK'
  APPLEMIDI_BYE: 0x4259,         // 'BY'
  APPLEMIDI_PROTOCOL_VERSION: 0x00000002,

  // Timeouts & Intervals
  HANDSHAKE_TIMEOUT_MS: 5000,
  KEEP_ALIVE_INTERVAL_MS: 2000,
  RECONNECT_MAX_ATTEMPTS: 3,
  RECONNECT_DELAY_MS: 3000,

  // RTP
  RTP_PAYLOAD_TYPE_MIDI: 0x61,
  RTP_VERSION: 2,
  RTP_CLOCK_RATE_HZ: 90000,
};

// src/app/core/constants/osc.constants.ts
export const OSC = {
  LOCAL_LISTEN_PORT: 9000,
  
  // Address patterns
  ADDRESSES: {
    PLAYBACK_STATUS: '/playback/status',
    TRACK_INFO: '/track/info',
    TIME_POSITION: '/time/position',
  },

  // OSC Type tags
  TYPES: {
    INT32: 'i',
    FLOAT32: 'f',
    STRING: 's',
    BLOB: 'b',
  },
};
```

---

**Last Updated:** 2026-11-23  
**Reference Specifications:** RFC 6295 (AppleMIDI), OSC 1.0 Official Specification
