# DECISIONS.md — Architecture Decision Records

> **Purpose:** Track the "why" behind major architectural choices so that future contributors (and LLMs) don't have to reverse-engineer reasoning from the code. Each entry should be short — aim for < 10 lines.

## Template

```
## ADR-NNN — Title
**Date:** YYYY-MM-DD | **Status:** accepted | superseded | deprecated
**Context:** Why did this come up?
**Decision:** What did we choose?
**Consequence:** What does this mean going forward?
```

---

## ADR-001 — In-Memory State, No Database
**Date:** 2025-01-01 | **Status:** accepted
**Context:** Modux hosts ephemeral party game sessions lasting minutes to an hour. Players create a room, play, and leave. There is no need to persist game history, user accounts, or session replays.
**Decision:** All game state is stored in Python dictionaries (`self.sessions: Dict[str, GameState]`). No database, no ORM, no persistence layer.
**Consequence:** Sessions are lost on server restart. This is acceptable because sessions are short-lived. It also means zero infrastructure overhead — no database provisioning, migrations, or connection pools. If we ever need persistence (e.g., leaderboards), this decision should be revisited.

---

## ADR-002 — 4-Stage Lifecycle as a Hard Contract
**Date:** 2025-01-01 | **Status:** accepted
**Context:** Early development had games with inconsistent flows — some had setup phases, some didn't, recap screens were ad hoc. This made the platform feel disjointed and the shared UI shell unreliable.
**Decision:** Every game must transition through exactly 4 stages: `waiting` → `setup` → `playing` → `finished`. This is enforced by `BaseGameState.status` being a `Literal["waiting", "setup", "playing", "finished"]` type. The frontend switches on this value to render shared stage components.
**Consequence:** New games cannot skip stages — even if setup is trivial, the transition must happen. This forces consistency but may feel restrictive for very simple games. The tradeoff is worth it for a unified platform experience.

---

## ADR-003 — Server-Authoritative State Model
**Date:** 2025-01-01 | **Status:** accepted
**Context:** In early prototypes, some game logic leaked into the frontend (e.g., validating moves client-side). This caused desync bugs where different players saw different game states.
**Decision:** The backend is the single source of truth. The frontend sends `action` messages and renders whatever state the server broadcasts back. The frontend never computes game outcomes, validates moves, or maintains its own copy of game state.
**Consequence:** All game logic lives in `GameManager.handle_action()`. The frontend is a pure renderer driven by `gameState` from `useGameSocket`. This simplifies debugging (one place to look) but means every interaction requires a server round-trip.

---

## ADR-004 — BaseGameManager ABC Pattern
**Date:** 2025-01-01 | **Status:** accepted
**Context:** With multiple games on the platform, we needed a consistent interface so the WebSocket router in `main.py` could dispatch actions to any game without knowing its internals.
**Decision:** All games implement `BaseGameManager` (an abstract base class) with four methods: `get_session()`, `join_game()`, `remove_player()`, and `handle_action()`. The `handle_action()` method returns a 3-tuple: `(updated_state, broadcast_msg, personal_msg)`.
**Consequence:** Adding a new game follows a predictable recipe: create models, implement the ABC, register in `main.py`. The router doesn't need to change. The 3-tuple return contract means the router handles all I/O uniformly.

---

## ADR-005 — GitFlow with Three Branches
**Date:** 2025-01-01 | **Status:** accepted
**Context:** Deploying directly from `main` caused production issues when untested code was pushed. We needed a buffer for automated QA.
**Decision:** Strict 3-branch GitFlow: `development` (active coding) → `staging` (automated CI: pytest + vitest) → `main` (production, auto-deploys to Render + GitHub Pages). No direct commits to `main`.
**Consequence:** Every change goes through automated testing before production. The tradeoff is slower deploys (two merges instead of one), but this is acceptable for a platform where broken WebSocket logic ruins the experience for all connected players.
