# Cross Clue

A digital adaptation of the cooperative party game "Cross Clue", hosted on the Modux platform.

## 🎮 Game Mechanics

- **The Board:** A 4x4 grid. Rows are labeled A-D, columns are labeled 1-4.
- **The Words:** 8 unique nouns are assigned to the axes (4 for rows, 4 for columns).
- **The Goal:** Players cooperate to guess all 16 coordinates.
- **The Flow:**
  1. The active player draws a coordinate card (e.g., `B3`). This is kept secret.
  2. The active player broadcasts a 1-word clue that connects the word for Row B and the word for Column 3.
  3. The rest of the team discusses and selects a coordinate on the shared grid.
  4. The system validates the guess, marks the grid (Success/Fail), and updates the shared state.

## � Technical Breakdown

**Real-Time Engine:** FastAPI WebSockets with session-based state management and targeted private messaging. The backend maintains separate public and private state channels to protect secret information (coordinates, active turn details) while broadcasting shared state to all players.

**Grid-Based Coordinate Mapping:** 4x4 matrix with A-D row labels and 1-4 column labels. The system validates all coordinate guesses against the active secret card and updates the shared grid state in real-time.

**State Synchronization:** Dual-channel architecture where public game state (grid markings, active clues, remaining deck) is broadcast to all players, while secret cards are delivered only to the requesting player via targeted WebSocket messages.

**Scalable Sessions:** Support for dynamic, multi-user rooms with persistent session state. The game engine handles concurrent actions and maintains session integrity across multiple WebSocket connections.

## 🗺️ Application Execution Plan

### Phase 1: Application Game Logic & State Management
- [x] Implement GameStateManager class with session-based state storage
- [x] Create hardcoded word bank of 100 nouns for word-association gameplay
- [x] Build session initialization logic (4x4 grid generation, word assignment, coordinate deck shuffling)
- [x] Implement backend WebSocket event handlers (`init_game`, `draw_card`, `submit_clue`, `guess_coordinate`, `get_state`)
- [x] Establish public state filtering to protect secret information (coordinates, active turn details)
- [x] Implement user_id to WebSocket mapping for targeted private messaging
- [x] Debug and validate game state synchronization across multiple WebSocket clients
- [x] Test edge cases (empty deck, invalid guesses, concurrent actions)

### Phase 2: Interactive Real-time Interface (In Progress)
- [x] Build 4x4 interactive grid component with coordinate selection
- [x] Implement active player view (draw card button, secret coordinate display, clue input field)
- [x] Implement team view (incoming clue display, grid clicking for coordinate guesses)
- [x] Add dynamic styling for grid states (empty, success, fail visual indicators)
- [x] Integrate real-time state updates via WebSocket message parsing
- [x] Implement player role detection and UI state management
- [x] Add responsive design for mobile device compatibility
- [ ] Refine visual polish and animations
- [ ] Add loading states and error handling

### Phase 3: Advanced Game State Loop (Planned)
- [ ] Implement complete game cycle: Draw → Clue → Guess → Reset
- [ ] Handle edge cases: empty deck, all coordinates guessed, game completion
- [ ] Add turn rotation logic for multiple players
- [ ] Implement score tracking and win conditions
- [ ] Add game reset/restart functionality
- [ ] Handle disconnection and reconnection scenarios

### Phase 4: Game Configurations & Extensibility (Planned)
- [ ] Support for 5x5 grid configuration
- [ ] Add in-game timer for clue submission
- [ ] Implement custom word list support
- [ ] Add preset word bank selection (categories: animals, food, technology, etc.)
- [ ] Create game settings panel for configuration
- [ ] Add game history and replay functionality

## 🧪 Testing

To test the Cross Clue module locally:

1. **Multi-Player Simulation:** Open two browser tabs and navigate to the same session URL (e.g., `/cross-clue/TEST01`). Each tab will generate a unique user ID via the global UserContext, simulating multiple players.
2. **Game Initialization:** In one tab, click "Start Game" to initialize the grid with words and shuffle the coordinate deck. Verify both tabs receive the public game state with row and column words.
3. **Card Drawing:** Click "Draw Card" to receive a secret coordinate. Verify the secret coordinate displays only in the active player's view.
4. **Clue Submission:** Enter a 1-word clue and submit. Verify the clue appears in both tabs as the "Current Clue".
5. **Coordinate Guessing:** In the second tab, click a coordinate on the grid to submit a guess. Verify the grid updates with success (green) or fail (red) indicators in both tabs.
6. **Responsive Testing:** Resize the browser window or use mobile device emulation to verify the grid and UI adapt correctly to different screen sizes.
