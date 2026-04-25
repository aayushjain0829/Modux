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

## 🔌 WebSocket Events

### Client → Server

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

### Server → Client

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

## 🗺️ Cross Clue Execution Plan

### Phase 1: Backend Foundation
- [x] Initialize FastAPI project.
- [x] Configure Uvicorn to bind to `0.0.0.0:8000`.
- [x] Implement local IP detection on startup.
- [x] Build the WebSocket Connection Manager (connect, disconnect, broadcast).
- [x] Set up static file serving for the frontend build.

### Phase 2: App Shell (Frontend)
- [x] Initialize Vite + React project.
- [x] Set up React Router for dynamic session URLs.
- [x] Create a landing dashboard with a "Start Cross Clue Session" button.
- [x] Implement an ID generator for session URLs.
- [x] Establish standard WebSocket connection logic in the React app.

### Phase 3: Cross Clue Game State Logic
- [x] Create a hardcoded list of 100 nouns on the backend.
- [x] Build session initialization logic (generate 4x4 grid, assign words, shuffle 16 coordinate cards).
- [x] Implement backend WebSocket event listeners (`get_state`, `draw_card`, `submit_clue`, `guess_coordinate`).

### Phase 4: Cross Clue UI Interface
- [ ] Build the 4x4 interactive grid component.
- [ ] Implement the active player view (draw card, secret coordinate display, clue input).
- [ ] Implement the team view (display incoming clue, enable grid clicking).
- [ ] Add dynamic styling for grid states (Success/Fail).
