# BINGO (1-25 Variant)

A turn-based, 5x5 grid game where players arrange numbers 1-25, take turns calling numbers, and compete to complete 5 lines (Rows, Columns, or Diagonals) to spell B-I-N-G-O.

## 🎮 Game Mechanics

- **The Board:** Each player arranges numbers 1-25 on a personal 5x5 grid before the game begins.
- **Sequential Click Setup:** Click empty cells to auto-assign the lowest available number (1-25). Clicking a filled cell reclaims the number for reuse. An 'Auto-Shuffle' button provides instant randomization.
- **Phase 4.1 Flow:** Portal → Lobby → Setup → Arena → Recap
  1. **Portal**: Create or join a game session
  2. **Lobby**: Players toggle ready status, host starts game
  3. **Setup**: Players arrange their boards and submit
  4. **Arena**: Round-robin number calling gameplay
  5. **Recap**: View results and choose next action
- **Spectator Mode**: Players joining after game starts become spectators
- **Individual Actions**: Players can return to lobby independently from Recap
- **Tie-Breaker Rule:** Active player wins ties when multiple players achieve 5 lines simultaneously
- **Disconnect Safeguard:** Game automatically advances turn when player disconnects

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with turn-based gatekeeper logic and disconnect safeguards. Automatically manages player states and prevents soft-locks.

**Individual Player Stages:** Support for mixed game states where players can be in different stages (Lobby/Recap) while sharing the same session.

**Spectator System:** Centralized spectator mode with dedicated components and hooks. Late joiners automatically become spectators with consistent UI.

**State Management:** Robust player state tracking with ready status, submission tracking, and individual stage management.

**O(1) Matrix Math:** Server-side win calculation utilizing derived state (`lines_completed`) to prevent client-server state conflicts.

**Scalable Sessions:** Support for dynamic, multi-user rooms with randomized unique identity generation.

## 🏗️ Phase 4.1 Integration

Bingo now follows the standardized Modux platform lifecycle:

- **Portal → Lobby → Setup → Arena → Recap**: Universal entry through shared Portal, then progresses through standardized stages
- **ModuxLayout Shell**: Persistent platform UI with player sidebar and session management
- **Universal Components**: Uses shared LobbyStage, SetupStage, ArenaStage, RecapStage components
- **Spectator Support**: Centralized spectator components usable across all games

## 🧩 Component Architecture

**Main Container:**
- `BingoGame.jsx` - Orchestrates stage transitions and WebSocket management

**Stage Components:**
- `BingoSetup.jsx` - Handles board generation and number selection with spectator support
- `BingoActive.jsx` - Manages active gameplay, turn tracking, and number calling
- `BingoRecap.jsx` - Post-game results display with individual action buttons

**Shared Components:**
- `SpectatorView.jsx` - Centralized spectator UI component
- `useSpectator.js` - Reusable spectator detection hook

## 🗺️ Application Execution Plan

- [x] **Phase 1: Backend State Engine & Turn Logic**
  - Define the Pydantic models for the Bingo game state.
  - Implement WebSocket actions: 'join_game', 'submit_board', 'call_number', 'toggle_ready', 'start_game'.
  - Implement round-robin turn progression logic.
  - Add individual player stages and spectator support.

- [x] **Phase 2: The Setup Phase (UI)**
  - Build a React component for players to arrange their 1-25 grid before the game starts.
  - Include 'Auto-Shuffle' utility button for rapid testing.
  - Implement Sequential Click Setup with automatic number assignment.
  - Add spectator mode for late joiners.
  - Remove redundant waiting room, use sidebar for status tracking.

- [x] **Phase 3: The Active Game (UI & Matrix Logic)**
  - Render the 5x5 interactive grid with consistent styling.
  - Build matrix-checking algorithm for completed lines and B-I-N-G-O progression.
  - Implement visual 'Active Caller' indicator.
  - Add spectator view without game controls.
  - Remove redundant lines completed display.

- [x] **Phase 4: Win Condition & Edge Cases**
  - Handle 'BINGO Stop' broadcast when player hits 5 lines.
  - Manage edge cases: player disconnects, duplicate number calls.
  - Add Recap stage with individual actions.
  - Implement 'Return to Lobby' and 'Play Again' functionality.

- [x] **Phase 4.1: Platform Integration**
  - Integrate with standardized Portal → Lobby → Setup → Arena → Recap flow
  - Implement ModuxLayout with player sidebar and status indicators
  - Add centralized spectator components (SpectatorView, useSpectator hook)
  - Support mixed player stages (Lobby/Recap) in same session
  - Ensure consistent UI/UX across all game stages

## 🧪 Testing

To test the Bingo module locally:

1. **Multi-Player Simulation:** Open multiple browser tabs and navigate to the same session URL (e.g., `/bingo/TEST01`). Each tab generates a unique user ID via UserContext.

2. **Lobby Flow:** Verify players start in Lobby stage, can toggle ready status, and host can start game when all are ready.

3. **Setup Phase:** Arrange 5x5 grids using sequential click setup or auto-shuffle. Verify submission status updates in sidebar and boards disable after submission.

4. **Spectator Mode:** Join a game after it has started. Verify spectator UI displays consistently across Setup and Arena stages.

5. **Turn-Based Gameplay:** Take turns calling numbers. Verify active player indicator and synchronized number marking across all boards.

6. **Mixed Player Stages:** Have one player return to lobby from Recap while others remain in Recap. Verify individual stage management works correctly.

7. **Win Condition:** Play until someone achieves 5 lines. Verify Recap stage displays winner and individual action buttons work properly.

8. **Individual Actions:** Test "Return to Lobby" and "Play Again" buttons. Verify host can start new game even when some players are in different stages.

9. **Disconnect Safeguard:** Close browser tab during player's turn. Verify turn automatically advances to next player.

10. **Cross-Game Compatibility:** Test with CrossClue to ensure shared components work correctly.
