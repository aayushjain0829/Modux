# BINGO (1-25 Variant)

A turn-based, 5x5 grid game where players arrange numbers 1-25, take turns calling numbers, and compete to complete 5 lines (Rows, Columns, or Diagonals) to spell B-I-N-G-O.

## Execution Plan

- [x] **Phase 1: Backend State Engine & Turn Logic**
  - Define the Pydantic models for the Bingo game state.
  - Implement WebSocket actions: 'join_game', 'submit_board' (validating a 1-25 array), and 'call_number'.
  - Implement round-robin turn progression logic.

- [x] **Phase 2: The Setup Phase (UI)**
  - Build a React component for players to arrange their 1-25 grid before the game starts.
  - Include an 'Auto-Fill/Shuffle' utility button for faster testing.
  - Build a 'Waiting Room' state that holds until all players have submitted their boards.
  - Implemented Sequential Click Setup: Users click empty cells to automatically assign the lowest available number (1-25). Clicking a filled cell reclaims the number, making it available again.

- [x] **Phase 3: The Active Game (UI & Matrix Logic)**
  - Render the 5x5 interactive grid.
  - Build the matrix-checking algorithm to detect completed lines and track the B-I-N-G-O letter progression.
  - Implement the visual 'Active Caller' indicator.

- [ ] **Phase 4: Win Condition & Edge Cases**
  - Handle the 'BINGO Stop' broadcast when a player hits 5 lines.
  - Manage edge cases: player disconnects during their turn, or attempting to call a number that has already been called.

## Phase 5: Security & Quality of Life (Planned)
- [ ] **State Sanitization:** Refactor the WebSocket broadcast logic to strip opponent board arrays from the payload. This ensures the frontend only receives the active player's board, preventing network-level cheating.
