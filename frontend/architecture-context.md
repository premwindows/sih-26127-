# AI-Powered Dynamic Intelligence Workspace — Architecture & Context

> Reference doc for building the prototype. Paste this whole file into any model/session to get full context instantly.

---

## 1. Core Concept

This is **not** a traditional dashboard with fixed pages/menus. It is a **single persistent workspace shell** with a chat/command bar at the bottom. A "Central AI" interprets operator intent, fetches data from intelligence modules, and dynamically composes the workspace using a **fixed set of UI components**. Follow-up commands **mutate the existing workspace** instead of navigating to a new page.

```
User Intent → Central AI → Intelligence Modules → Data → Layout Decision → Dynamic Workspace
```

Reference analogies: GeForce NOW (one outer shell, changing inner content), ChatGPT's dynamic UI, "Eagle Eye" centralized intelligence concept.

**Example flow:**
1. Operator types `MH12AB1234` → workspace assembles: vehicle profile, ANPR detections, camera locations, trajectory map, CCTV feeds, RTO info, alerts.
2. Operator says "show the camera footage" → existing workspace updates: video player becomes primary, other components shrink/reposition.
3. Operator says "show yesterday's route" → map + timeline update, same vehicle context retained.
4. Operator says "compare with another vehicle" → workspace forks/duplicates relevant components for comparison.

---

## 2. Scope Decision for Prototype

**Fixed component model.** The AI does NOT generate arbitrary UI. It selects from a **fixed set of 7 components** and decides: (a) which data to fetch, (b) which component to use per data type, (c) size/prominence, (d) position. This keeps the prototype buildable, predictable, and demoable under time pressure. No live layout generation, no risk of broken UI.

---

## 3. Fixed Component Set (8)

**`FeedGrid` vs `MultiFeedView` — when to use which:**
- `FeedGrid` = browsing mode. Static/thumbnail previews of many cameras (e.g. "show me cameras near this location"). Click one → promotes to `VideoPlayer`.
- `MultiFeedView` = watching mode. Operator explicitly wants several feeds playing at once, synced to the same timestamp (e.g. "show me all 4 cameras around the intersection at 10:15 PM" or "compare footage from these two cameras"). Supports layout presets (2x2, 1 large + 3 small, 3x3) and a shared scrub/timeline control so all feeds seek together.


| Component | Used for | Key props |
|---|---|---|
| `ProfileCard` | Vehicle/entity summary | `fields[]`, `photo`, `status/flag` |
| `DataTable` | RTO info, structured records | `columns[]`, `rows[]` |
| `FeedGrid` | Multiple CCTV feeds (thumbnails, browsing) | `cameras[]` (id, thumbnail/stream, location) |
| `VideoPlayer` | Single focused feed | `streamUrl`, `cameraId`, `timestamp` |
| `MultiFeedView` | Multiple *live/synced* feeds watched simultaneously (not just thumbnails) | `feeds[]` (id, streamUrl, cameraId, label), `syncTimestamp`, `layout` (2x2 / 1+3 / 3x3) |
| `MapView` | Locations, trajectory, routes | `markers[]`, `route[]`, `heatlayer?` |
| `EventTimeline` | ANPR detections, alerts | `events[]` (time, label, severity) |
| `ChartPanel` | Traffic stats, counts | `type` (bar/line), `data[]` |

**Do not add more components for the prototype.**

---

## 4. Data → Component Rule Table (hardcoded, not AI-inferred)

```
vehicle_profile                        → ProfileCard      (large)
rto_info                               → DataTable        (medium, sidebar)
cctv_feeds, browsing/many, no focus     → FeedGrid         (medium)
cctv_feeds, single/focused              → VideoPlayer      (large)
cctv_feeds, "watch together"/synced/    → MultiFeedView    (large, layout by count:
  compare 2+ cameras                                        2 feeds→1x2, 3-4→2x2, 5+→3x3)
trajectory / camera_locations          → MapView          (large, center)
anpr_detections / alerts               → EventTimeline    (sidebar)
traffic_stats                          → ChartPanel       (medium)
```

### Prominence rules (hardcoded)
- **Default plate search** → `ProfileCard` + `MapView` = large; rest = small/sidebar.
- **"show camera footage"** (single/unspecified) → `VideoPlayer` becomes large; `MapView` shrinks.
- **"show all cameras / watch together / compare feeds"** → `MultiFeedView` becomes large/full-width; `MapView` shrinks to a small locator card showing camera positions.
- **"show route/trajectory"** → `MapView` large; `EventTimeline` syncs alongside.
- **"compare vehicle X"** → duplicate primary components (`ProfileCard`×2, `MapView` with both routes overlaid).

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  - Command bar (chat input)                                   │
│  - Grid/canvas renderer — reads layout JSON, renders          │
│    components from the fixed set                              │
│  - Workspace state (current entities in focus, active         │
│    components, positions/sizes)                               │
└───────────────────────────▲───────────────────────────────────┘
                             │ layout JSON (see §6)
┌───────────────────────────┴───────────────────────────────────┐
│                    Central AI / Orchestrator                   │
│  1. Intent Parser — classify command → intent + entities       │
│     (keyword/regex matching is fine for prototype; can later   │
│     become an LLM call)                                        │
│  2. Context Manager — holds current workspace state            │
│     (active vehicle, active time range, active comparison)     │
│     so follow-ups don't need re-specification                  │
│  3. Data Orchestrator — calls relevant intelligence modules     │
│     based on parsed intent                                     │
│  4. Layout Engine — runs data through the rule table (§4),      │
│     outputs layout JSON                                        │
└───────────────────────────▲───────────────────────────────────┘
                             │ data requests
┌───────────────────────────┴───────────────────────────────────┐
│                    Intelligence Modules (mocked for demo)       │
│  - ANPR module        - CCTV module       - RTO module          │
│  - Trajectory module  - GIS/Map module    - Alerts module       │
│  - Traffic stats module                                         │
└─────────────────────────────────────────────────────────────────┘
```

**For the prototype:** Central AI = intent classifier (rule/keyword-based) + context manager + rule-table layout engine. This does not need to be a real LLM call on every turn — it can be, but isn't required to demo the concept.

---

## 6. Layout JSON Contract (frontend ↔ AI layer)

This is the single contract between backend/AI logic and frontend rendering. Frontend never hardcodes what to show — it always renders from this JSON.

```json
{
  "workspaceId": "session-123",
  "intent": "vehicle_search",
  "context": {
    "activeEntity": "MH12AB1234",
    "activeTimeRange": null,
    "comparisonEntity": null
  },
  "components": [
    {
      "id": "profile-1",
      "type": "ProfileCard",
      "size": "large",
      "position": { "row": 1, "col": 1 },
      "data": {
        "plate": "MH12AB1234",
        "owner": "…",
        "model": "…",
        "status": "flagged"
      }
    },
    {
      "id": "map-1",
      "type": "MapView",
      "size": "large",
      "position": { "row": 1, "col": 2 },
      "data": {
        "markers": [ { "lat": 0, "lng": 0, "label": "Camera 4" } ],
        "route": []
      }
    },
    {
      "id": "rto-1",
      "type": "DataTable",
      "size": "small",
      "position": { "row": 2, "col": 1 },
      "data": { "columns": ["Field", "Value"], "rows": [] }
    },
    {
      "id": "timeline-1",
      "type": "EventTimeline",
      "size": "small",
      "position": { "row": 2, "col": 2 },
      "data": { "events": [] }
    }
  ]
}
```

**Rules for the AI layer when emitting this JSON on a follow-up command:**
- Reuse existing `component.id`s where the underlying entity is unchanged (so frontend can animate/update in place rather than full re-render).
- Only add/remove/resize components that are affected by the new command.
- Always update `context` so the next command has continuity.

---

## 7. Motion & Transition Requirements

The workspace's core promise is that it *transforms*, not reloads. If components pop/jump/flash on every command, the "living workspace" feeling breaks and it looks like a normal dashboard with extra steps. Motion is not a polish pass — it's part of what makes this demo different from a static UI, so treat it as a first-class requirement, not decoration.

**Principles:**
- **Persist, don't replace.** If a component's `id` is unchanged between layout updates (see §6), it must animate to its new size/position — never unmount and remount. Reusing `id`s is precisely what makes this possible, which is why §6 calls it out as a rule for the AI layer, not just a nice-to-have.
- **Everything animates from its current state, not from zero.** A card resizing from small→large should smoothly grow, not disappear and reappear larger.
- **New components fade/slide in; removed components fade/slide out** — never hard-cut.
- **One shared easing + duration system**, not per-component custom timing. E.g.:
  - Layout/position/size changes: ~350–450ms, `ease-in-out` (or a spring with light damping)
  - Enter/exit (mount/unmount): ~200–250ms fade + slight scale/slide
  - Micro-interactions (hover, focus, button press): ~100–150ms
- **Stagger, don't dump.** When several components enter at once (e.g. initial plate search producing 4 components), stagger their entrance by ~50–80ms each rather than all popping in simultaneously — reads as intentional, not chaotic.
- **MultiFeedView / VideoPlayer transitions** deserve extra care since they're visually heavy: when promoting a feed from `FeedGrid` → `VideoPlayer` (or into `MultiFeedView`), animate from the clicked thumbnail's screen position/size into the new player position (a "shared element" transition), not a generic fade — this sells the "it grew out of what you clicked" feeling.
- **Command bar → workspace response** should itself have a small transition (e.g. a subtle loading/thinking state on the command bar, then components animate in) rather than an instant hard swap, so it reads as the AI "building" the view.

**Implementation note for whoever builds this:**
- React: use `framer-motion` (layout animations via `layoutId` map directly onto the "persist component `id`, animate the diff" principle above — `layoutId` = component `id` from the JSON contract).
- Grid should use CSS Grid or a library like `react-grid-layout` combined with `framer-motion`'s `layout` prop so resizing/repositioning is automatically animated rather than hand-coded per component.
- Keep it to ONE motion library/system project-wide — mixing ad hoc CSS transitions with a motion library per-component is exactly what causes "some things animate, some things jump" inconsistency in demos.

---

## 8. Context Manager — State to Track

Minimum state needed so follow-ups work without re-specifying:

```json
{
  "activeEntity": "MH12AB1234",
  "activeTimeRange": { "from": null, "to": null },
  "comparisonEntity": null,
  "focusedComponent": null,   // e.g. "VideoPlayer" if user zoomed into footage
  "history": [ "search MH12AB1234", "show camera footage" ]
}
```

This is what makes "show yesterday's route" work without the user repeating the plate number.

---

## 9. Build Plan (prototype-scoped)

1. **Mock data layer** — static/mock JSON for each intelligence module (vehicle profile, RTO, ANPR events, CCTV feed list, map markers/routes, traffic stats). No real integrations needed for demo.
2. **Intent classifier** — keyword/regex based command → intent + entity extraction (e.g. regex for plate number pattern, keyword match for "camera", "route", "compare").
3. **Context manager** — simple in-memory session state object (§7).
4. **Layout engine** — implement rule table (§4) as a pure function: `(intent, data) → layoutJSON`.
5. **Frontend renderer** — React grid that maps `layoutJSON.components[]` to the 8 fixed component types (§3). Build each component once, reusable. Wire up `framer-motion` (`layoutId` = component `id`) from day one, not as a later polish pass — retrofitting animation onto a static grid later is much more work than building animated from the start (see §7).
6. **Command bar** — text input → sends to intent classifier → triggers full pipeline → re-renders workspace.
7. **Demo script** — scripted sequence: plate search → show footage → show route → compare vehicle. Pre-mock data for exactly this flow to guarantee a clean demo.

---

## 10. Explicitly Out of Scope for Prototype

- Free-form AI-generated layouts (fixed component set only).
- Real-time video streaming integration (use static/mock feeds).
- Real ANPR/CCTV/RTO backend integration (mocked data).
- Multi-user concurrent workspaces.
- Persistent storage across sessions (in-memory state is fine).

---

## 11. Open Decisions (revisit post-prototype)

1. Should intent parsing move from keyword-based to LLM-based post-prototype?
2. How is "relevance/prominence" scored beyond hardcoded rules, for more complex queries?
3. Incremental layout patching vs. full re-decision on every command — prototype uses full re-decision (simpler); revisit if performance/UX suffers.
4. Reconcile "user-selected capability/plugin" framing (brainstorm doc) vs. "AI infers everything" framing (dashboard doc) — prototype currently leans toward AI-inferred intent with keyword matching underneath.
