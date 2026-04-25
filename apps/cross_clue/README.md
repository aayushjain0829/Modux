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

## 🔌 WebSocket API

### Client → Server Events

- **init_game**: Initializes the grid, words, and deck for the session
  ```json
  {"action": "init_game", "user_id": "player1"}
  ```

- **draw_card**: Draws a coordinate card from the deck (sent only to the requesting player)
  ```json
  {"action": "draw_card", "user_id": "player1"}
  ```

- **submit_clue**: Submits a 1-word clue from the active player
  ```json
  {"action": "submit_clue", "clue": "bridge", "user_id": "player1"}
  ```

- **guess_coordinate**: Submits a coordinate guess from the team
  ```json
  {"action": "guess_coordinate", "guess": "B3", "user_id": "player2"}
  ```

- **get_state**: Requests the current game state
  ```json
  {"action": "get_state", "user_id": "player1"}
  ```

### Server → Client Events

- **state_update**: Broadcasts the public game state to all players
  ```json
  {"type": "state_update", "data": {"row_words": [...], "col_words": [...], "grid_state": {...}, "active_clue": "...", "deck_remaining": 12}}
  ```

- **card_drawn**: Sends the secret coordinate only to the player who drew it
  ```json
  {"type": "card_drawn", "data": {"coordinate": "B3"}}
  ```

- **guess_result**: Broadcasts the result of a coordinate guess
  ```json
  {"type": "guess_result", "data": {"guess": "B3", "secret": "B3", "is_correct": true, "grid_state": {...}}}
  ```

## 🗺️ Application Execution Plan

### Phase 1: Application Game Logic & State Management
- [x] Implement GameStateManager class with session-based state storage
- [x] Create hardcoded word bank of 100 nouns for word-association gameplay
- [x] Build session initialization logic (4x4 grid generation, word assignment, coordinate deck shuffling)
- [x] Implement backend WebSocket event handlers (`init_game`, `draw_card`, `submit_clue`, `guess_coordinate`, `get_state`)
- [x] Establish public state filtering to protect secret information (coordinates, active turn details)
- [ ] Debug and validate game state synchronization across multiple WebSocket clients
- [ ] Test edge cases (empty deck, invalid guesses, concurrent actions)

### Phase 2: Interactive Real-time Interface
- [ ] Build 4x4 interactive grid component with coordinate selection
- [ ] Implement active player view (draw card button, secret coordinate display, clue input field)
- [ ] Implement team view (incoming clue display, grid clicking for coordinate guesses)
- [ ] Add dynamic styling for grid states (empty, success, fail visual indicators)
- [ ] Integrate real-time state updates via WebSocket message parsing
- [ ] Implement player role detection and UI state management
- [ ] Add responsive design for mobile device compatibility
