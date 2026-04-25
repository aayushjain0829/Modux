# Modux

Modux is a modular, session-based local web server designed to host interactive, real-time multiplayer applications. It is engineered to run locally and be accessible across a local Wi-Fi network, allowing users to join ephemeral sessions via their mobile browsers.

## 🏗 Architecture & Tech Stack

- **Backend:** Python, FastAPI
- **Real-Time Communication:** WebSockets
- **Frontend:** React, Vite, Tailwind CSS (optional but recommended for rapid UI)
- **State Management:** In-memory Python dictionaries (ephemeral sessions that clear when the last user disconnects)
- **Deployment Strategy:** Local host binding (`0.0.0.0:8000`) on Ubuntu

## 🔌 Core Infrastructure Features

1. **Dynamic Session Routing:** Users can generate and share unique alphanumeric URLs (e.g., `/app/{app_name}/session/{session_id}`).
2. **WebSocket Manager:** A robust connection manager to handle active connections, broadcast messages to specific session rooms, and handle graceful disconnections.
3. **Local IP Broadcast:** On startup, the server programmatically logs the local network IP for quick mobile access.

---

## 🎮 Module 1: Cross Clue

The first application hosted on Modux is a digital adaptation of the cooperative party game "Cross Clue". 

### Game Mechanics
- **The Board:** A 4x4 grid. Rows are labeled A-D, columns are labeled 1-4.
- **The Words:** 8 unique nouns are assigned to the axes (4 for rows, 4 for columns).
- **The Goal:** Players cooperate to guess all 16 coordinates.
- **The Flow:**
  1. The active player draws a coordinate card (e.g., `B3`). This is kept secret.
  2. The active player broadcasts a 1-word clue that connects the word for Row B and the word for Column 3.
  3. The rest of the team discusses and selects a coordinate on the shared grid.
  4. The system validates the guess, marks the grid (Success/Fail), and updates the shared state.

---

## 🗺️ Project Execution Plan

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
- [ ] Create a hardcoded list of 100 nouns on the backend.
- [ ] Build session initialization logic (generate 4x4 grid, assign words, shuffle 16 coordinate cards).
- [ ] Implement backend WebSocket event listeners (`get_state`, `draw_card`, `submit_clue`, `guess_coordinate`).

### Phase 4: Cross Clue UI Interface
- [ ] Build the 4x4 interactive grid component.
- [ ] Implement the active player view (draw card, secret coordinate display, clue input).
- [ ] Implement the team view (display incoming clue, enable grid clicking).
- [ ] Add dynamic styling for grid states (Success/Fail).

---

## 🎯 Milestones & Testing

- **April 25, 2026**: Successfully validated core WebSocket ConnectionManager and local network IP accessibility (0.0.0.0 binding) across multiple mobile devices. Cross-device real-time messaging confirmed working.
- **April 26, 2026**: Vite/React frontend successfully connects to FastAPI WebSockets dynamically across the local network. Fixed routing order issue (WebSocket routes before static files mount) and added CORS middleware for development.