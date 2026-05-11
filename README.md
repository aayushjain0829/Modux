# Modux

Modux is a modular, session-based local web server designed to host interactive, real-time multiplayer applications. It is engineered to run locally and be accessible across a local Wi-Fi network, allowing users to join ephemeral sessions via their mobile browsers.

## ⚡ Quickstart

Get Modux running locally in minutes with these terminal commands:

**Terminal 1 (Backend):**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Expose via Cloudflare Tunnel:**
```bash
cloudflared tunnel --url http://localhost:8000
```

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
│   ├── cross_clue/        # Cross Clue game module
│   │   ├── __init__.py
│   │   ├── game.py        # Game state management
│   │   └── README.md      # App-specific documentation
│   └── bingo/             # Bingo game module
│       ├── __init__.py
│       ├── game.py        # Game state management
│       ├── models.py      # Pydantic models for game state
│       └── README.md      # App-specific documentation
├── frontend/              # React frontend
│   └── src/
│       ├── apps/
│       │   ├── cross_clue/  # Cross Clue React components
│       │   └── bingo/       # Bingo React components
│       ├── components/      # Shared platform components
│       │   ├── common/      # Cross-game reusable components
│       │   ├── layout/      # Layout and shell components
│       │   └── stages/      # Universal stage components
│       └── hooks/           # Reusable React hooks
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

### 🌐 Cloudflare Tunnel Setup

For easy public access without port forwarding, Modux includes automatic Cloudflare tunnel hosting:

1. **Install cloudflared** (included in requirements.txt):
```bash
pip install cloudflared
```

2. **Install xclip** for auto-copy functionality:
```bash
sudo apt-get install xclip
```

3. **Use the provided startup script**:
```bash
./HostModux.sh
```

**Features:**
- 🚀 Automatic backend startup (port 8000)
- 🎨 Automatic frontend dev server (port 5173)  
- 🌐 Automatic Cloudflare tunnel (public URL)
- 📋 Auto-copy tunnel URL to clipboard
- 🔄 Smart process management (Ctrl+C to stop)

**Manual tunnel creation** (if needed):
```bash
cloudflared tunnel --url http://localhost:8000
```

The tunnel provides a public `*.trycloudflare.com` URL that forwards to your local backend, making it accessible from anywhere without port forwarding or firewall configuration.

The production build is served automatically by the FastAPI backend on port **8000**.

### 🔒 Security & Network

Modux uses Cloudflare Tunnels to enable internet multiplayer without complex network configuration. This provides secure, encrypted tunneling through Cloudflare's global network.

**Upcoming Security Feature:**
To prevent unauthorized access via public tunnel URLs, game lobbies will require a Host-generated 4-digit PIN to join.

### Mobile Access

To access the platform from a mobile device on the same Wi-Fi network:

1. Start the backend server with `python main.py`
2. Note the local IP address displayed in the terminal (e.g., `192.168.1.100`)
3. On your mobile device, open a browser and navigate to: `http://YOUR_IP:8000`

## 🎮 Supported Apps

- **[Cross Clue](./apps/cross_clue/README.md)** - A cooperative word-association party game (Phase 1: Game Logic & State Management complete)
- **[Bingo (1-25 Variant)](./apps/bingo/README.md)** - A turn-based 5x5 number grid game with real-time multiplayer sync (All Phases including Phase 4.1 Complete)

## �️ Standardized UI Lifecycle

| Stage | Former Name | Description |
|-------|-------------|-------------|
| **Dashboard** | Home | The primary landing page for game selection and user profile management. |
| **Portal** | Create / Join | The entry gate where users input session IDs or initialize new game rooms. |
| **Lobby** | - | The universal gathering point where players sync and signal readiness. |
| **Setup** | Prepare | Optional game-specific configuration (e.g., Bingo board generation). |
| **Arena** | Action | The core gameplay container and real-time interface. |
| **Recap** | Result | The post-game summary with unified routing back to the Lobby or Dashboard. |

## � Adding a New App

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

### Phase 4: Global Multiplayer Staging System (Complete)
- [x] Add global username configuration to main Modux Dashboard
- [x] Persist user identities via localStorage across all apps
- [x] Develop reusable Lobby.jsx component for pre-game grouping
- [x] Implement UserContext for centralized identity management
- [x] Create standardized routing through lobby for session generation
- [x] Implement seamless handoff from lobby to app state engine
- [x] Refactor all apps to consume global UserContext and remove isolated lobby logic

### Phase 4.1: The Modux Platform Shell & Game Lifecycle (Complete)
- [x] Develop `<ModuxLayout>` persistent platform shell to standardize UI rendering across all apps
- [x] Implement persistent Left-Sidebar Player List (tracks real-time connections, readiness, and active turns)
- [x] Standardize platform header (Room Code, App Name, and 'Copy Invite Link' utility)
- [x] Build **Lobby** stage: Universal gathering point with Host-controlled, transparent game configurations
- [x] Implement visual 'Ready' toggle mechanics and Host-exclusive privileges ('Start Game')
- [x] Build **Setup** stage: Optional dynamic routing for game-specific loadouts (e.g., Bingo boards)
- [x] Build **Arena** stage: Core gameplay container with global Spectator Mode for late-joiners
- [x] Build **Recap** stage: Shared post-game screen with unified "Next Game" and "Return to Lobby" routing
- [x] Add centralized spectator components (`SpectatorView`, `useSpectator` hook)
- [x] Implement individual player stages for mixed game state scenarios
- [x] Add individual "Return to Lobby" action for Recap stage
- [x] Refactor existing apps (Cross Clue, Bingo) to consume the unified 4-stage pipeline
- [x] Ensure consistent UI/UX across all game stages with standardized status indicators

### Phase 5: Platform Portability & Mobile Encapsulation (Planned)

**Pathway A: Cloud-Native Evolution (Client-Server)**
- [ ] Transition FastAPI backend to scalable cloud host (Render/Railway)
- [ ] Deploy Vite/React frontend via Vercel or Netlify
- [ ] Utilize Capacitor to encapsulate web application into standalone Android APK
- [ ] Maintain cloud WebSockets for real-time sync

**Pathway B: WebRTC Peer-to-Peer Architecture (Decentralized)**
- [ ] Develop lightweight matchmaking server for SDP handshakes
- [ ] Port Python game logic entirely to React frontend
- [ ] Implement session creator as 'Host Node' for state management
- [ ] Replace WebSockets with WebRTC for direct device-to-device communication
- [ ] Ensure ultra-low latency and true offline local network play

**Continuous Integration & Deployment**
- [ ] Implement lightweight GitHub Actions to verify Python syntax and successful Vite frontend builds
- [ ] Create docker-compose.yml for unified, single-command deployment of the entire stack

