# Cross Clue

A cooperative word-association party game where players work together to guess secret coordinates on a 4x4 grid based on verbal clues.

## 🎮 Game Mechanics

- **The Grid:** A 4x4 grid with coordinates A1-D4
- **The Words:** 8 unique words are randomly selected - 4 for rows (A-D) and 4 for columns (1-4)
- **Phase 4.1 Flow:** Portal → Lobby → Setup → Arena → Recap
  1. **Portal**: Create or join a game session
  2. **Lobby**: Players toggle ready status, host starts game
  3. **Setup**: Game initialization and word selection
  4. **Arena**: Cooperative clue-giving and guessing gameplay
  5. **Recap**: View results and choose next action
- **Spectator Mode**: Players joining after game starts become spectators
- **Individual Actions**: Players can return to lobby independently from Recap
- **Cooperative Gameplay**: All players work together to reveal the grid

## 🔧 Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with turn-based logic and private card distribution.

**Individual Player Stages:** Support for mixed game states where players can be in different stages while sharing the same session.

**Spectator System:** Centralized spectator mode with dedicated components. Late joiners automatically become spectators with consistent UI.

**Private Card System:** Each player's secret coordinate is sent only to them via targeted WebSocket messages.

**State Management:** Pydantic models for type safety and robust player state tracking.

## 🏗️ Phase 4.1 Integration

Cross Clue now follows the standardized Modux platform lifecycle:

- **Portal → Lobby → Setup → Arena → Recap**: Universal entry through shared Portal
- **ModuxLayout Shell**: Persistent platform UI with player sidebar and session management
- **Universal Components**: Uses shared LobbyStage, SetupStage, ArenaStage, RecapStage components
- **Spectator Support**: Centralized spectator components usable across all games

## 🧩 Component Architecture

**Main Container:**
- `CrossClue.jsx` - Orchestrates stage transitions and WebSocket management

**Stage Components:**
- `CrossClueSetup.jsx` - Handles game initialization and word selection
- `CrossClueArena.jsx` - Manages cooperative gameplay and clue interface
- `CrossClueRecap.jsx` - Post-game results display with individual action buttons

**Shared Components:**
- `SpectatorView.jsx` - Centralized spectator UI component
- `useSpectator.js` - Reusable spectator detection hook

## 🗺️ Application Execution Plan

- [x] **Phase 1: Game Logic & State Management**
  - Define Pydantic models for the Cross Clue game state
  - Implement WebSocket actions: 'join_game', 'draw_card', 'submit_clue', 'guess_coordinate'
  - Add turn-based progression and grid state management
  - Add spectator support and individual player stages

- [x] **Phase 2: UI Components**
  - Build React components for game board and clue interface
  - Implement coordinate grid with visual feedback
  - Add turn indicator and clue submission interface
  - Add spectator mode for late joiners

- [x] **Phase 3: Real-Time Integration**
  - Connect frontend to WebSocket backend
  - Implement private card distribution system
  - Add visual feedback for guesses and results
  - Use centralized spectator components

- [x] **Phase 4.1: Platform Integration**
  - Integrate with standardized Portal → Lobby → Setup → Arena → Recap flow
  - Implement ModuxLayout with player sidebar and status indicators
  - Add centralized spectator components (SpectatorView, useSpectator hook)
  - Support mixed player stages (Lobby/Recap) in same session
  - Ensure consistent UI/UX across all game stages

## 🧪 Testing

To test the Cross Clue module locally:

1. **Multi-Player Simulation:** Open multiple browser tabs and navigate to the same session URL (e.g., `/cross-clue/TEST01`). Each tab generates a unique user ID via UserContext.

2. **Lobby Flow:** Verify players start in Lobby stage, can toggle ready status, and host can start game when all are ready.

3. **Spectator Mode:** Join a game after it has started. Verify spectator UI displays consistently across Setup and Arena stages.

4. **Cooperative Gameplay:** Take turns drawing cards, giving clues, and guessing coordinates. Verify secret cards are sent privately and grid updates are synchronized.

5. **Mixed Player Stages:** Have one player return to lobby from Recap while others remain in Recap. Verify individual stage management works correctly.

6. **Individual Actions:** Test "Return to Lobby" and "Return to Dashboard" buttons. Verify they work correctly for individual players.

7. **Cross-Game Compatibility:** Test with Bingo to ensure shared components work correctly.
