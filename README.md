# Modux

Modux is a modular, session-based local web server designed to host interactive, real-time multiplayer applications. It is engineered to run locally and be accessible across a local Wi-Fi network, allowing users to join ephemeral sessions via their mobile browsers.

## 🏗 Architecture & Tech Stack

- **Backend:** Python, FastAPI
- **Real-Time Communication:** WebSockets
- **Frontend:** React, Vite
- **State Management:** In-memory Python dictionaries (ephemeral sessions that clear when the last user disconnects)
- **Deployment Strategy:** Local host binding (`0.0.0.0:8000`) on Ubuntu

## 🔌 Core Infrastructure Features

1. **Dynamic Session Routing:** Users can generate and share unique alphanumeric URLs (e.g., `/app/{app_name}/session/{session_id}`).
2. **WebSocket Manager:** A robust connection manager to handle active connections, broadcast messages to specific session rooms, and handle graceful disconnections.
3. **Local IP Broadcast:** On startup, the server programmatically logs the local network IP for quick mobile access.
4. **Modular App Architecture:** Each application is isolated in its own directory with dedicated game state logic, making it easy to add new apps to the platform.

## 📁 Project Structure

```
Modux/
├── main.py                 # Core FastAPI server with WebSocket routing
├── apps/                   # Modular app directory (backend logic)
│   └── cross_clue/        # Cross Clue game module
│       ├── __init__.py
│       ├── game.py        # Game state management
│       └── README.md      # App-specific documentation
├── frontend/              # React frontend
│   └── src/
│       ├── apps/
│       │   └── cross_clue/  # Cross Clue React components
│       └── components/      # Shared platform components
└── requirements.txt
```

## 🚀 Getting Started

### Backend Setup

1. Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python main.py
```

The server will display your local Wi-Fi IP address for mobile access on port **8000**.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. For development (runs on port **5173**):
```bash
npm run dev
```

4. For production build:
```bash
npm run build
```

The production build is served automatically by the FastAPI backend on port **8000**.

### Mobile Access

To access the platform from a mobile device on the same Wi-Fi network:

1. Start the backend server with `python main.py`
2. Note the local IP address displayed in the terminal (e.g., `192.168.1.100`)
3. On your mobile device, open a browser and navigate to: `http://YOUR_IP:8000`

## 🎮 Supported Apps

- **[Cross Clue](./apps/cross_clue/README.md)** - A cooperative word-association party game (Phase 1: Game Logic & State Management complete)

## 🔌 Adding a New App

1. Create a new directory in `apps/your_app_name/`
2. Add `__init__.py` and `game.py` with your app's GameStateManager
3. Import and handle your app in the WebSocket endpoint in `main.py`
4. Create corresponding React components in `frontend/src/apps/your_app_name/`
5. Add routing in `frontend/src/App.jsx`

## 🗺️ Platform Execution Plan

### Phase 1: Core Infrastructure & Backend Foundation
- [x] Initialize FastAPI project with Uvicorn server
- [x] Configure network binding to `0.0.0.0:8000` for local network accessibility
- [x] Implement local IP detection on startup for mobile device access
- [x] Build WebSocket Connection Manager (connect, disconnect, broadcast)
- [x] Set up static file serving for frontend production builds
- [x] Establish modular app architecture with dynamic app loading

### Phase 2: Frontend Architecture & Network Accessibility
- [x] Initialize Vite + React project with modern build tooling
- [x] Configure React Router for dynamic session-based routing
- [x] Implement platform-level Dashboard component
- [x] Establish session ID generation for unique game sessions
- [x] Implement WebSocket connection logic with React hooks
- [x] Validate cross-device real-time messaging across local network
- [x] Configure CORS middleware for development environment

### Phase 3: Modular Platform Routing & UI Flow
- [x] Implement app-specific landing pages architecture
- [x] Separate platform navigation from app-specific session management
- [x] Create dedicated Cross Clue landing page with session joining logic
- [x] Update routing hierarchy: `/cross-clue` → landing, `/cross-clue/:sessionId` → game
- [x] Isolate all app-specific UI components in `frontend/src/apps/`
- [x] Update platform documentation to reflect multi-app architecture

### Phase 4: Global Multiplayer Staging System (Planned)
- [ ] Add global username configuration to main Modux Dashboard
- [ ] Persist user identities via sessionStorage across all apps
- [ ] Develop reusable MultiplayerLobby.jsx component for pre-game grouping
- [ ] Implement WebSocket broadcasting for player joins/leaves
- [ ] Display live list of connected users in staging area
- [ ] Create standardized 'Start Game' trigger for lobby-to-app transition
- [ ] Implement seamless handoff from lobby to app state engine

## 🎯 Milestones & Testing

- **April 25, 2026**: Successfully validated core WebSocket ConnectionManager and local network IP accessibility (0.0.0.0 binding) across multiple mobile devices. Cross-device real-time messaging confirmed working.
- **April 26, 2026**: Vite/React frontend successfully connects to FastAPI WebSockets dynamically across the local network. Fixed routing order issue (WebSocket routes before static files mount) and added CORS middleware for development.
- **April 26, 2026**: Refactored architecture to isolate Cross Clue as a modular app, enabling true multi-app platform capability.
- **April 26, 2026**: Implemented UI flow refactor with dedicated landing pages for each app, separating platform-level navigation from app-specific session management.