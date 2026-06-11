# PROJECT_CONTEXT.md — LLM Orientation Document

> **Purpose:** This document is the starting point for any AI/LLM session working on Modux.
> It describes how to work with this codebase, what conventions to follow, and what to never break.
> For what the project does, see [README.md](./README.md). For why decisions were made, see [DECISIONS.md](./DECISIONS.md).

---

## Project Identity

**Modux** is a modular, real-time multiplayer platform for interactive party games.
- **Backend:** Python 3.11 · FastAPI · Uvicorn · Pydantic · native WebSockets
- **Frontend:** React 18 · Vite 5 · React Router v6 · Context API · vanilla CSS
- **Hosting:** Backend on Render (free tier) · Frontend on GitHub Pages
- **State:** In-memory Python dictionaries — no database, intentionally ephemeral

---

## Architecture Mental Model

### Server-Authoritative State
The backend is the **single source of truth** for all game state. The frontend is a renderer — it receives `state_update` messages via WebSocket and renders accordingly. The frontend **never computes game logic**.

### 4-Stage Lifecycle Pipeline
Every game on Modux must transition through exactly 4 stages:

| Status Value | Stage    | Description |
|-------------|----------|-------------|
| `"waiting"` | Lobby    | Players gather, toggle ready, host starts the game |
| `"setup"`   | Setup    | Optional game-specific configuration (e.g., board generation) |
| `"playing"` | Arena    | Core gameplay, real-time interaction |
| `"finished"`| Recap    | Results, play-again / return-to-lobby routing |

This is enforced by `BaseGameState.status` (a `Literal` type) and the frontend's switch on `gameState.status`.

### Action-Based WebSocket Messaging
Client sends: `{ "action": "...", "user_id": "...", ...payload }`
Server returns a 3-tuple from `handle_action()`:
1. `updated_state` — broadcast to all players if not `None`
2. `broadcast_msg` — additional broadcast message (e.g., notifications)
3. `personal_msg` — message sent only to the acting player

### BaseGameManager ABC Contract
All games implement `BaseGameManager` from `apps/base.py`:
- `get_session(session_id)` → returns or creates session state
- `join_game(session_id, user_id, username)` → adds player to session
- `remove_player(session_id, user_id)` → handles disconnection cleanup
- `handle_action(session_id, user_id, action, payload)` → core game logic, returns 3-tuple

### ConnectionManager (main.py)
The global `ConnectionManager` singleton handles all WebSocket I/O:
- Per-session `asyncio.Lock` for concurrency safety
- `user_connections` mapping for targeted personal messages
- Game managers are lazy-loaded singletons via `get_game_manager()`

---

## Directory Map

```
Modux/
├── main.py                          # FastAPI entrypoint, WebSocket router, ConnectionManager
├── apps/
│   ├── base.py                      # BasePlayer, BaseGameState, BaseGameManager (ABC)
│   ├── README.md                    # ⚠️ Backend rules for adding a new game
│   ├── bingo/                       # Bingo game module
│   │   ├── models.py               #   Pydantic models (BingoPlayer, BingoGameState)
│   │   └── game.py                  #   BingoGameManager
│   └── cross_clue/                  # Cross Clue game module
│       ├── models.py                #   Pydantic models
│       └── game.py                  #   CrossClueGameManager
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # React Router — all game routes
│   │   ├── context/UserContext.jsx   # userId + username (localStorage persistence)
│   │   ├── hooks/
│   │   │   ├── useGameSocket.js     # ⚠️ THE WebSocket hook — single source of truth
│   │   │   ├── useSpectator.js      # Spectator detection
│   │   │   └── useIsMobile.js       # Responsive breakpoint
│   │   ├── components/
│   │   │   ├── layout/ModuxLayout.jsx   # Universal shell (navbar + sidebar)
│   │   │   ├── stages/                   # Shared stage components (Lobby, Setup, Arena, Recap)
│   │   │   └── common/                   # GameGrid, SpectatorView, ErrorBoundary
│   │   └── apps/                    # Game-specific frontend modules
│   │       ├── bingo/               #   BingoGame.jsx + components/
│   │       └── cross_clue/          #   CrossClue.jsx + components/
│   └── README.md                    # ⚠️ Frontend rules for adding a new game
├── tests/
│   ├── README.md                    # ⚠️ Testing guide
│   ├── test_bingo.py                # Backend Bingo tests
│   ├── test_cross_clue.py           # Backend Cross Clue tests
│   └── test_websocket.py            # WebSocket integration tests
├── .agents/skills/                  # AI agent skills (branching, commit, PR creation)
├── .github/workflows/               # CI (test.yml) and CD (deploy-frontend.yml)
├── DECISIONS.md                     # Architectural decision records
└── CLAUDE.md                        # AI rules — read this first
```

---

## Key Conventions

### Naming
| Layer | Convention | Example |
|-------|-----------|---------|
| Backend files/dirs | `snake_case` | `cross_clue/`, `game.py`, `models.py` |
| Backend classes | `PascalCase` | `CrossClueGameManager`, `BingoPlayer` |
| Frontend components | `PascalCase` files | `BingoGame.jsx`, `ModuxLayout.jsx` |
| Frontend hooks | `camelCase` files | `useGameSocket.js`, `useIsMobile.js` |
| CSS | Co-located, same name | `BingoGame.css` next to `BingoGame.jsx` |
| Backend tests | `test_*.py` in `tests/` | `test_bingo.py` |
| Frontend tests | `*.test.jsx` co-located | `ModuxLayout.test.jsx` next to component |

### Game Module Structure
**Backend** — each game is a self-contained directory under `apps/`:
```
apps/your_game/
├── __init__.py
├── models.py    # Pydantic models extending BasePlayer & BaseGameState
└── game.py      # GameManager extending BaseGameManager
```

**Frontend** — each game is a self-contained directory under `frontend/src/apps/`:
```
frontend/src/apps/your_game/
├── YourGame.jsx           # Orchestrator — switches on gameState.status
├── YourGame.css
└── components/
    ├── YourGameSetup.jsx  # Setup stage
    ├── YourGameArena.jsx  # Arena stage
    └── YourGameRecap.jsx  # Recap stage
```

### Git & Branching
- **GitFlow:** `development` → `staging` → `main` (never commit directly to `main`)
- **Commits:** Conventional format — `<type>(<scope>): <description>`
- **Types:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- **Scopes:** `(bingo)`, `(cross-clue)`, `(spectator)`, `(ui)`, or omitted for platform-wide

---

## Invariants — Do NOT Break

1. **Frontend is a dumb renderer.** Never add game logic to the frontend. All state transitions happen server-side.
2. **`useGameSocket` is the single source of truth.** Never create a parallel state store (no Redux, no Zustand, no second WebSocket).
3. **No database.** State is intentionally in-memory and ephemeral. Sessions die when the server restarts. This is by design.
4. **4-stage pipeline is mandatory.** Every game must pass through `waiting` → `setup` → `playing` → `finished`. No shortcuts, no extra stages.
5. **`ModuxLayout` wraps everything.** Every game's top-level component must be wrapped in `<ModuxLayout>` for the navbar and sidebar.
6. **Host is the first player.** `host_id` is set to the first `user_id` to join. Only the host can start games and modify config.
7. **Per-session locking.** All `handle_action` calls are wrapped in `asyncio.Lock` per session. Never bypass this.
8. **Spectator mode for late joiners.** Players joining a game in `"playing"` status are automatically marked `is_spectator=True`.

---

## Anti-Patterns — Avoid These

- ❌ Adding a database or persistent storage layer
- ❌ Creating frontend-side game state or game logic
- ❌ Bypassing `BaseGameManager` to handle WebSocket messages directly
- ❌ Adding new WebSocket endpoints — all traffic goes through `/ws/{app_name}/{session_id}`
- ❌ Using external state management libraries (Redux, Zustand, MobX)
- ❌ Skipping tests when adding or modifying game logic
- ❌ Committing directly to `main` (always use a PR from `staging`)
- ❌ Creating game components that don't respect the 4-stage lifecycle

---

## Current Active Games

| Game | Backend | Frontend | Description |
|------|---------|----------|-------------|
| **Cross Clue** | `apps/cross_clue/` | `frontend/src/apps/cross_clue/` | Cooperative word-association with 4x4 grid, role rotation via rejection sampling |
| **Bingo** | `apps/bingo/` | `frontend/src/apps/bingo/` | Turn-based number grid (5x5 to 8x8), auto-win detection |

---

## References

- [Backend Architecture Rules](./apps/README.md) — how to add a new backend game
- [Frontend Architecture Rules](./frontend/README.md) — how to add a new frontend game
- [Testing Guide](./tests/README.md) — how to write and run tests
- [DECISIONS.md](./DECISIONS.md) — why things are the way they are
- [CLAUDE.md](./CLAUDE.md) — AI rules and post-change checklist
