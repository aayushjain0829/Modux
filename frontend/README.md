# Modux Frontend

This directory contains the React/Vite frontend for the Modux platform.

## 🏗 Architecture Rules for Creating a New Game

Modux is designed as a modular platform. To add a new game, you must strictly follow the architectural pipeline. By following these rules, your game will automatically inherit the global session state, spectator mode, real-time messaging, and mobile-responsive UI.

### Rule 1: Use the `ModuxLayout` Shell
Every game must be wrapped in the `<ModuxLayout>` component. This provides the standard top navigation bar (Room Code, App Name, Leave Button) and the responsive Sidebar showing the connected players' statuses.

### Rule 2: Follow the 4-Stage Lifecycle Pipeline
Your main game component (e.g., `MyGame.jsx`) must orchestrate its rendering based on the `gameState.status` from the backend. You must utilize the shared platform Stage components:

1. **LobbyStage (`waiting`)**: Render the shared `<LobbyStage>` component. It handles the "Ready" toggles and "Start Game" host controls automatically.
2. **SetupStage (`setup`)**: (Optional) Render the `<SetupStage>` when players need to configure their board/loadout before the chaotic action begins.
3. **ArenaStage (`playing`)**: Render the `<ArenaStage>`. This is where your custom game logic lives.
4. **RecapStage (`finished`)**: Render the `<RecapStage>` to show the final results and provide buttons to play again or return to the lobby.

### Rule 3: Use the `useGameSocket` Hook
You must use the custom `useGameSocket` hook to establish communication with the backend.

```javascript
const { gameState, isConnected, sendMessage } = useGameSocket(
  'your_app_name', // Must match backend folder name
  sessionId, 
  userId, 
  username
);
```

Pass the `sendMessage` function down to your child components to allow them to dispatch actions (e.g., `sendMessage({ action: 'submit_move', data: ... })`).

### Rule 4: Handle Spectators
Late-joiners to a game in progress automatically become spectators. You must utilize the `useSpectator` hook inside your Arena component to render the `<SpectatorView>` instead of the interactive gameplay elements.

```javascript
import { useSpectator } from '../../hooks/useSpectator';
import SpectatorView from '../../components/common/SpectatorView';

const MyGameArena = ({ gameState, userId, sendMessage }) => {
  const { isSpectator } = useSpectator(gameState, userId);
  
  if (isSpectator) {
    return <SpectatorView />;
  }
  
  // Render normal game...
}
```

### Rule 5: Routing
Add your new app to `App.jsx`:
1. Add a landing page route: `/your_app_name`
2. Add the dynamic session route: `/your_app_name/:sessionId` (This should render your main game component).
