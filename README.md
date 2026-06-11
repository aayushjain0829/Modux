<div align="center">
  <h1>🎮 Modux</h1>
  <p><strong>A modular, real-time multiplayer platform for interactive party games.</strong></p>
</div>

Modux is a highly modular web application designed to host interactive, real-time multiplayer games. What started as a local-network ephemeral session server has successfully evolved into a fully cloud-native platform, boasting a React frontend deployed on **GitHub Pages** and a robust Python/FastAPI WebSocket backend hosted on **Render**.

---

## 🌐 Live Demo

Play Modux online right now! Simply generate a session code and share the link with your friends on any device.

- **Frontend Application**: `https://aayushjain0829.github.io/`
- **Backend API / WebSocket**: `https://modux.onrender.com/`

> **Note:** The backend is hosted on a free Render instance, which spins down after inactivity. It may take 30-60 seconds for the backend to wake up on your first connection.

---

## 🎮 Supported Apps

Modux currently supports two fully-featured, highly-polished party games. Both games inherit the platform's robust real-time synchronization, mobile-first design, and global lobby system.

### 1. Cross Clue
A fast-paced, cooperative word-association party game. 
- **Dynamic Board**: Auto-generates a 4x4 grid utilizing a randomized word bank.
- **Fair Play**: Features a mathematically-perfect rejection sampling algorithm to evenly distribute "Clue Giver" and "Guesser" roles among all players without back-to-back overlaps.
- **Real-Time Synergy**: Players vote, guess, and communicate in real-time to solve the entire grid before the timer expires.

### 2. Bingo
A highly customizable, turn-based number grid game. Hosts can dynamically adjust the grid size (ranging from classic 5x5 up to a massive 8x8 grid) for quick rounds or extended play.
- **Synchronized Boards**: Generates unique, shuffled number cards for every player during the Setup stage.
- **Live Competitor Tracking**: Visualizes which numbers opponents have struck off in real time.
- **Auto-Win Detection**: The backend seamlessly calculates 5-in-a-row (horizontal, vertical, diagonal) and announces the winner instantly.

### 3. Tic-Tac-Toe
The classic 1v1 grid game, enhanced with spectator support and dynamic opponent selection.
- **1v1 Arena with Spectators**: Exactly two players actively compete, while the rest of the lobby can spectate the match in real-time.
- **Opponent Selection**: The Host can challenge anyone in the lobby directly.
- **First Player Configuration**: The Host has granular control over who gets the first turn (Random, Host, or Opponent).

---

## ✨ Platform Features

- **Host Identification**: The room creator is automatically designated as the host (indicated by a 👑 icon) and has exclusive privileges to manage setups and start games.
- **Dynamic Name Changes**: Players can click the edit icon (✏️) next to their name in the sidebar at any time to update their username. Changes are instantly broadcast to all connected players in the room without dropping the connection.
- **Smart Timers**: Games with active turn timers (like Cross Clue) feature intelligent pausing, ensuring players only lose time when the action is actively occurring.
- **Cross-Device UI**: Handcrafted responsive design ensures the UI looks polished and consistent on both desktop and mobile screens.

---

## 🏗 Architecture & Tech Stack

- **Frontend**: React, Vite, Context API (Hosted on GitHub Pages)
- **Backend**: Python, FastAPI, Uvicorn (Hosted on Render)
- **Real-Time Communication**: Native WebSockets with robust connection managers
- **State Management**: In-memory Python dictionaries utilizing strict Pydantic models for type safety.

---

## ️ Standardized UI Lifecycle

Every game on the Modux platform effortlessly transitions through a strictly enforced 4-stage pipeline:

| Stage | Description |
|-------|-------------|
| **Lobby** | The universal gathering point where players sync, view connected users, and signal readiness. |
| **Setup** | Optional game-specific configuration (e.g., Bingo board generation or Cross Clue grid rerolls). |
| **Arena** | The core gameplay container and real-time interface, featuring built-in Spectator support for late-joiners. |
| **Recap** | The post-game summary with unified routing to either start a "Next Game" or "Return to Lobby". |

---

## 🛠️ Adding a New Game

Modux is designed to be infinitely expandable. If you want to build a new game on this platform, please refer to the specific architectural rules for the frontend and backend:

- **[Backend Architecture Rules](./apps/README.md)**: Guidelines for extending `BaseGameManager` and utilizing the 4-stage pipeline.
- **[Frontend Architecture Rules](./frontend/README.md)**: Guidelines for wrapping your game in the `<ModuxLayout>` shell and integrating `useGameSocket`.
- **[Testing Guide](./tests/README.md)**: Complete guide on how to run and write automated tests for Modux, including CI/CD automation rules.

---

## ⚡ Local Development Quickstart

To run Modux locally for development:

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

*The local server will automatically bind to `0.0.0.0:8000`, printing your local IP address so you can immediately join the session from your smartphone.*

---

## 🔀 Git Branching Strategy & Workflow

To maintain a highly stable, bug-free production environment, Modux enforces a strict **Environment Branching (GitFlow)** model:

1. **`development`**: Feature development + bug fixing + individual testing.
2. **`staging`**: Automated testing + multiple player testing (local hosting).
3. **`main`**: Production ready code + requires PR to merge.

---

## 🚀 Deployment Guide

Modux utilizes a fully automated CI/CD pipeline integrated directly with GitHub Actions.

### Frontend (GitHub Pages)
The Vite/React frontend is automatically built and deployed to GitHub Pages whenever code is merged into the `main` branch. 
- **Action**: `.github/workflows/deploy-frontend.yml` (if configured) or via Render static hosting.
- **Environment**: The frontend expects the backend WebSocket URL to be provided via `VITE_WS_URL` in production (e.g., `wss://modux.onrender.com/ws`).
- **Base URL**: Set to `/` for custom domains or `/<repo-name>/` for standard GitHub Pages in `vite.config.js`.

### Backend (Render)
The FastAPI WebSocket server is hosted on Render as a Web Service.
- **Trigger**: Render automatically triggers a new build and deployment upon detecting a merge to `main`.
- **Environment Variables**: Requires no specific database credentials as state is currently in-memory. 
- **Port**: Binds automatically to the port provided by Render's environment.

> **Note**: Because the backend runs on Render's free tier, the instance will spin down after 15 minutes of inactivity. When a player loads the frontend and attempts to connect, the first WebSocket connection may take 30-60 seconds to wake the server up.
