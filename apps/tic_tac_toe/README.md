# Tic Tac Toe

The classic 1v1 grid game where two players take turns marking spaces in a 3x3 grid, competing to get three of their marks in a row (horizontally, vertically, or diagonally).

## 🎮 Game Mechanics

- **The Grid:** A classic 3x3 board.
- **1v1 with Spectators:** The game naturally supports 2 active players. Any additional players in the room are automatically assigned the Spectator role, letting them watch the game live.
- **Opponent Selection:** The room Host can select their opponent from the list of ready players before starting the game.
- **First Player Configuration:** The Host can choose who gets the first move: Random, Host, or the Opponent.

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets handles all moves instantly and broadcasts board updates.

**Strict 1v1 Enforcement:** The `GameManager` separates the active two players from the rest of the lobby and accurately enforces who can interact with the board based on the `turn_order` list.

**Individual Player Stages:** Players can be in different visual stages (Lobby vs Playing) depending on their connection status, with spectators correctly routed to the Arena.

**State Management:** Tracks board state efficiently as a 2D array and verifies win/draw conditions on every move in O(1) checks.

## 🧪 Testing

Tic Tac Toe is fully covered by our automated testing suite:

1. **Backend Unit Tests (`test_tic_tac_toe.py`)**
   - Validates proper assignment of the `turn_order` based on `first_player_rule`.
   - Tests end-to-end turn cycles, turn switching, and prevents out-of-turn play.
   - Mathematically verifies all win conditions (horizontal, vertical, diagonal) and draw conditions (full board without a winner).
   - Simulates opponent selection and properly categorizes non-active players as spectators.

*To run tests locally, refer to the [Root Testing Guide](../../tests/README.md).*
