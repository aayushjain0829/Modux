# 🎨 Frontend Rules for Creating a New Game

This directory contains the React/Vite frontend for the Modux platform.

Modux is designed as a highly modular platform. To add a new game to the frontend, you must strictly follow the architectural pipeline. By adhering to these rules, your game will automatically inherit the global session state, identity persistence, spectator mode, real-time messaging, and mobile-responsive shell.

---

## Rule 1: Access Global Identity via UserContext
Before connecting to a game session, you must access the persistent identity of the local user via the `UserContext`. The platform guarantees that the user has a globally selected `username` and `userId` before they can enter a session.

```javascript
import { useUser } from '../../context/UserContext';

const MyGame = () => {
  const { userId, username } = useUser();
  // ...
};
```

## Rule 2: Utilize the `useGameSocket` Hook
Establish a WebSocket connection to the Render backend by utilizing the custom `useGameSocket` hook.

```javascript
import { useGameSocket } from '../../hooks/useGameSocket';

const MyGame = () => {
  const { userId, username } = useUser();
  const { sessionId } = useParams();

  const { gameState, isConnected, sendMessage } = useGameSocket(
    'your_app_name', // Must exactly match your backend apps folder name
    sessionId, 
    userId, 
    username
  );
  // ...
};
```

Pass the `sendMessage` function down to your child components to allow them to dispatch actions (e.g., `sendMessage({ action: 'submit_move', data: ... })`).

## Rule 3: Wrap Your Game in the `ModuxLayout` Shell
Every game must be wrapped in the `<ModuxLayout>` component. This injects your game into the standard platform UI, providing the top navigation bar (Room Code, App Name, Leave Button) and the persistent Sidebar displaying real-time connected players and their statuses.

```javascript
import ModuxLayout from '../../components/layout/ModuxLayout';

return (
  <ModuxLayout 
    appName="Your App Name" 
    gameState={gameState} 
    userId={userId} 
    sendMessage={sendMessage}
  >
    {/* Dynamic stage components go here */}
  </ModuxLayout>
);
```

## Rule 4: Respect the 4-Stage Lifecycle Pipeline
Your main game component (e.g., `MyGame.jsx`) must dynamically orchestrate its rendering based entirely on `gameState.status` synced from the backend. You must utilize the shared platform Stage components where applicable:

1. **LobbyStage (`"waiting"`)**: Render the shared `<LobbyStage>` component. It handles the "Ready" toggles and "Start Game" host controls automatically.
2. **SetupStage (`"setup"`)**: (Optional) Render your custom `<SetupStage>` when players need to configure their board/loadout before the chaotic action begins (e.g., Bingo Board Generation).
3. **ArenaStage (`"playing"`)**: Render your custom `<ArenaStage>`. This is where your core game logic and real-time interaction lives.
4. **RecapStage (`"finished"`)**: Render the `<RecapStage>` to show the final results and provide unified buttons to play again or return to the lobby.

## Rule 5: Implement Spectator Mode
Late-joiners to a game in progress automatically become spectators. You must utilize the `useSpectator` hook inside your Arena component to render the `<SpectatorView>` instead of interactive gameplay elements.

```javascript
import { useSpectator } from '../../hooks/useSpectator';
import SpectatorView from '../../components/common/SpectatorView';

const MyGameArena = ({ gameState, userId, sendMessage }) => {
  const { isSpectator } = useSpectator(gameState, userId);
  
  if (isSpectator) {
    return <SpectatorView />;
  }
  
  // Render normal interactive game for active players...
}
```

## Rule 6: Platform Routing
Expose your new app to the platform by updating `App.jsx`:
1. Add a landing page route: `/your_app_name`
2. Add the dynamic session route: `/your_app_name/:sessionId` (This should render your main `MyGame.jsx` orchestrator).
