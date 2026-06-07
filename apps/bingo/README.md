# Bingo

A customizable, turn-based number grid game where players arrange numbers, take turns calling them out, and compete to complete lines (Rows, Columns, or Diagonals) to spell B-I-N-G-O.

## 🎮 Game Mechanics

- **The Board:** The Host can dynamically select the grid size (from classic 5x5 up to a massive 8x8). Each player arranges numbers on their personal grid before the game begins.
- **Sequential Click Setup:** Click empty cells to auto-assign the lowest available number. Clicking a filled cell reclaims the number for reuse. An 'Auto-Shuffle' button provides instant randomization.
- **Spectator Mode**: Players joining after game starts become spectators
- **Tie-Breaker Rule:** Active player wins ties when multiple players achieve 5 lines simultaneously
- **Disconnect Safeguard:** Game automatically advances turn when player disconnects

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with turn-based gatekeeper logic and disconnect safeguards. Automatically manages player states and prevents soft-locks.

**Individual Player Stages:** Support for mixed game states where players can be in different stages (Lobby/Recap) while sharing the same session.

**Spectator System:** Centralized spectator mode with dedicated components and hooks. Late joiners automatically become spectators with consistent UI.

**State Management:** Robust player state tracking with ready status, submission tracking, and individual stage management.

**O(1) Matrix Math:** Server-side win calculation utilizing derived state (`lines_completed`) to prevent client-server state conflicts.

**Scalable Sessions:** Support for dynamic, multi-user rooms with randomized unique identity generation.

## 🧪 Testing

Bingo is fully covered by our automated testing suite:

1. **Backend Unit Tests (`test_bingo.py`)**
   - Validates dynamic grid sizes (e.g. 3x3, 5x5, 8x8) and rejects duplicate numbers.
   - Calculates O(1) Matrix Math for horizontal, vertical, and diagonal completions.
   - End-to-end simulations of players joining, submitting boards, calling numbers, and triggering auto-win logic.

2. **Frontend Tests (`vitest`)**
   - Game layout and UI state interactions are simulated locally via React Testing Library.

*To run tests locally, refer to the [Root Testing Guide](../../tests/README.md).*
