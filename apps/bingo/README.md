# BINGO (1-25 Variant)

A turn-based, 5x5 grid game where players arrange numbers 1-25, take turns calling numbers, and compete to complete 5 lines (Rows, Columns, or Diagonals) to spell B-I-N-G-O.

## 🎮 Game Mechanics

- **The Board:** Each player arranges numbers 1-25 on a personal 5x5 grid before the game begins.
- **Setup Phase:** Players use 'Sequential Click' board setup—click empty cells to auto-assign the lowest available number (1-25). Clicking a filled cell reclaims the number for reuse. An 'Auto-Shuffle' button provides instant randomization for rapid testing.
- **The Flow:**
  1. All players submit their boards in the **Setup** stage to enter the **Lobby**.
  2. Once all players are ready in the **Lobby**, the game transitions to the **Arena** stage with round-robin turns.
  3. On your turn in the **Arena**, select any uncalled number from your own board to "call" it.
  4. Called numbers are marked across all players' boards automatically.
  5. Complete 5 lines (rows, columns, or diagonals) to achieve BINGO.
- **Tie-Breaker Rule:** If multiple players achieve 5 lines simultaneously, the active player (who called the current number) wins the tie.
- **Disconnect Safeguard:** If a player disconnects during their turn, the game automatically advances to the next player to prevent soft-locks.

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with rigorous turn-based gatekeeper logic and disconnect safeguards. Automatically removes disconnected players from the game state and advances the turn to prevent soft-locks.

**O(1) Matrix Math:** Server-side win calculation utilizing derived state (`lines_completed`) to prevent client-server state conflicts. The backend validates all moves and calculates completed lines (rows, columns, diagonals) in real-time.

**Scalable Sessions:** Support for dynamic, multi-user rooms with randomized unique identity generation. Each player receives a unique `user_id` on connection, enabling seamless multi-tab and multi-device gameplay.

**UX Design:** 'Sequential Click' board setup that entirely eliminates keyboard input and duplicate validation errors. Players click empty cells to auto-assign the lowest available number (1-25); clicking filled cells reclaims the number for reuse.

## 🏗️ Phase 4.1 Integration

Bingo now follows the standardized Modux platform lifecycle:

- **Portal → Lobby → Setup → Arena → Recap**: Universal entry through shared Portal, then progresses through standardized stages
- **ModuxLayout Shell**: Persistent platform UI with player sidebar and session management
- **Modular Components**: Separated concerns with dedicated components for each stage

## 🧩 Component Architecture

**Main Container:**
- `BingoGame.jsx` - Orchestrates stage transitions and WebSocket management

**Stage Components:**
- `BingoSetup.jsx` - Handles board generation and number selection
- `BingoActive.jsx` - Manages active gameplay, turn tracking, and number calling

## 🗺️ Application Execution Plan

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

- [x] **Phase 4: Win Condition & Edge Cases**
  - Handle the 'BINGO Stop' broadcast when a player hits 5 lines.
  - Manage edge cases: player disconnects during their turn, or attempting to call a number that has already been called.

## 🧪 Testing

To test the Bingo module locally:

1. **Multi-Player Simulation:** Open two browser tabs and navigate to the same session URL (e.g., `/bingo/TEST01`). Each tab will generate a unique user ID via the global UserContext, simulating multiple players.
2. **Board Submission:** In each tab, arrange your 5x5 grid using sequential click setup or auto-shuffle, then submit. Verify that both players see the state transition from 'setup' to 'playing' once all boards are submitted.
3. **Turn-Based Gameplay:** Take turns calling numbers. Verify the active player indicator and confirm that numbers are marked across both boards simultaneously.
4. **Win Condition:** Play until one player achieves 5 lines. Verify the 'BINGO Stop!' victory screen displays with the correct winner and navigation options.
5. **Disconnect Safeguard:** During a player's turn, close their browser tab. Verify the remaining player sees the disconnected player removed from the turn order and the turn automatically advances.
