# Cross Clue

A cooperative word-association party game where players work together to guess secret coordinates on a 4x4 grid based on verbal clues.

## 🎮 Game Mechanics

- **The Grid:** A 4x4 grid with coordinates A1-D4
- **The Words:** 8 unique words are randomly selected - 4 for rows (A-D) and 4 for columns (1-4)
- **Role Randomization:** Mathematical rejection sampling is used to guarantee perfect derangement—meaning every player gets to be a Guesser and a Giver exactly once, and never at the same time.
- **Spectator Mode**: Players joining after game starts become spectators
- **Cooperative Gameplay**: All players work together to reveal the grid

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with turn-based logic and private card distribution.

**Individual Player Stages:** Support for mixed game states where players can be in different stages while sharing the same session.

**Spectator System:** Centralized spectator mode with dedicated components. Late joiners automatically become spectators with consistent UI.

**Private Card System:** Each player's secret coordinate is sent only to them via targeted WebSocket messages.

**State Management:** Pydantic models for type safety and robust player state tracking.

## 🧪 Testing

Cross Clue is fully covered by our automated testing suite:

1. **Backend Unit Tests (`test_cross_clue.py`)**
   - Rigorously tests the role queue generation via 50+ iterations of rejection sampling to mathematically guarantee fair player role assignment.
   - Simulates end-to-end interaction cycles (Giver draws a card -> Voter casts a vote -> Guesser finalizes the turn).

2. **Frontend Tests (`vitest`)**
   - React components, WebSocket hooks, and state transitions are verified locally.

*To run tests locally, refer to the [Root Testing Guide](../../tests/README.md).*
