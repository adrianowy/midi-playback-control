# Phase 2: OSC Telemetry & Bidirectional Communication

**Status:** Planned  
**Objective:** Receive playback status from iPad via OSC (Open Sound Control)

---

## Overview

Phase 2 adds **bidirectional communication** to display real-time feedback from iPad Playback:

- Current track name and duration
- Playback position (time elapsed / remaining)
- Current section indicator
- Alert when track is ending
- Real-time metadata updates

---

## Architecture

### Additional Components

```
OscService (Phase 2)
├── Listen on local UDP port (default 9000)
├── Parse OSC messages from iPad
├── Extract address patterns & arguments
└── Emit to subscribers

Telemetry Service (Phase 2)
├── Combine RTP-MIDI commands + OSC feedback
├── Manage playback state
└── Cache track metadata

Playback Status Component (Phase 2)
├── Display current track info
├── Show time progress bar
├── Highlight current section
└── Auto-update from OSC messages
```

---

## OSC Protocol Details

### Message Format

**Address Pattern:** `/playback/status`  
**Type Tags:** `,isf` (int, string, float)  
**Arguments:**
- `track_id` (int32): Unique track identifier
- `track_name` (string): Display name of track
- `position_ms` (float32): Current playback position in milliseconds

### Expected OSC Messages from iPad

(To be documented after testing with actual iPad Playback app)

**Example (placeholder):**

```
Address:  /playback/status
TypeTag:  ,isf
Args:     [123, "Great Is Thy Faithfulness", 45500.0]

Meaning:  Track 123, "Great Is Thy Faithfulness", currently at 45.5 seconds
```

---

## Implementation Steps

### Step 1: UDP Listener Setup
- [ ] Open UDP listener on local port 9000
- [ ] Handle incoming packets
- [ ] Parse each packet as potential OSC message

### Step 2: OSC Message Parser
- [ ] Extract address (null-terminated string)
- [ ] Extract type tag string (`,isf` etc.)
- [ ] Parse arguments based on type tags
- [ ] Handle variable-length data (strings, blobs)

### Step 3: State Management
- [ ] Track current playback state (track name, position, etc.)
- [ ] Update state on OSC message receipt
- [ ] Expose as Observable for UI subscription

### Step 4: UI Components
- [ ] Playback status display component
- [ ] Time progress bar with elapsed/remaining
- [ ] Section indicator
- [ ] Auto-scroll to current section

### Step 5: Testing
- [ ] Parse OSC packets correctly
- [ ] Handle connection loss gracefully
- [ ] Test with actual iPad Playback app

---

## Configuration

**Local Listener Port:** 9000 (configurable)

**iPad Configuration (required):**
- iPad must send OSC messages to Android IP address on port 9000
- Address patterns must match `/playback/status`, `/time/position`, etc.

---

## Data Flow

```
iPad Playback                           Android App
─────────────                           ───────────

1. User plays track
2. iPad sends OSC /playback/status
   ──────────────────────────────────→
3. Android receives & parses OSC
4. Update state (track name, position)
5. UI re-renders with new info
                        ↓
                 [Show "Great Is Thy Faithfulness"]
                 [Show 0:45 / 3:20]
                 [Update position bar]

6. iPad sends /time/position every 100ms
   ──────────────────────────────────→
7. Progress bar updates in real-time
```

---

## Error Handling

| Error | Scenario | Action |
|-------|----------|--------|
| **Parsing Error** | Invalid OSC format | Log & skip packet, don't crash |
| **Connection Loss** | No OSC for 5+ seconds | Show "Status Unknown" in UI |
| **Invalid Address** | Unknown OSC address | Log warning, ignore |

---

## Future Enhancements

- [ ] mDNS discovery of iPad OSC service
- [ ] Support for more OSC address patterns
- [ ] Automatic section highlighting
- [ ] Playback statistics/analytics
- [ ] Remote section triggering via OSC

---

## References

- **OSC 1.0 Specification:** http://opensoundcontrol.org/spec-1_0
- **OSC on Wikipedia:** https://en.wikipedia.org/wiki/Open_Sound_Control
- **Playback App Documentation:** https://www.multitracks.com/

---

**Last Updated:** 2026-11-23  
**Depends On:** Phase 1 (RTP-MIDI) must be stable first
