# 🛠️ Backend Rules for Creating a New Game

Modux is designed to be highly modular. To add a new game to the backend, you must follow these strict architectural rules to ensure seamless integration with the global WebSocket router.

## Rule 1: Directory Structure
1. Create a new directory under `apps/your_app_name/`.
2. This directory must contain an `__init__.py` and a `game.py`.
3. You must define your strict Pydantic models in `models.py` by inheriting from the platform's base models.

## Rule 2: Utilize Pydantic Base Models
Your `models.py` must extend `BaseGameState` and `BasePlayer` from `apps.base` to ensure the platform router can uniformly track connection status, player readiness, and the 4-stage pipeline.

```python
# apps/your_app_name/models.py
from apps.base import BasePlayer, BaseGameState
from typing import Dict, List

class YourAppPlayer(BasePlayer):
    # BasePlayer already provides: username, is_ready, is_spectator, player_stage, has_submitted, etc.
    score: int = 0

class YourAppGameState(BaseGameState):
    # BaseGameState already provides: session_id, status, host_id, turn_order, etc.
    players: Dict[str, YourAppPlayer] = {}
    custom_game_data: List[str] = []
```

## Rule 3: The BaseGameManager Interface
Your `game.py` must define a class that inherits from `BaseGameManager`. The global WebSocket connection manager handles all I/O and simply passes the payload to your class via a single required method: `handle_action`.

```python
# apps/your_app_name/game.py
from typing import Dict, Tuple, Optional, Any
from apps.base import BaseGameManager
from .models import YourAppGameState

class YourAppManager(BaseGameManager):
    def __init__(self):
        self.game_states: Dict[str, YourAppGameState] = {}

    def get_session(self, session_id: str) -> YourAppGameState:
        if session_id not in self.game_states:
            self.game_states[session_id] = YourAppGameState(session_id=session_id)
        return self.game_states[session_id]

    def handle_action(
        self, session_id: str, user_id: str, action: str, payload: Dict[str, Any]
    ) -> Tuple[Optional[YourAppGameState], Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        
        if action == "join_game":
            # Handle user join...
            state = self.get_session(session_id)
            return state, None, None
            
        elif action == "custom_move":
            # Handle gameplay...
            state = self.get_session(session_id)
            return state, {"type": "move_result", "status": "success"}, None
            
        return None, None, None
```

## Rule 4: Enforce the 4-Stage State Machine
Your returned `GameState` will inherently possess a `status` key inherited from `BaseGameState`. You must transition this status to drive the React frontend through the standard pipeline:
1. `"waiting"`: The initial lobby phase.
2. `"setup"`: (Optional) Configuration or board generation.
3. `"playing"`: The active gameplay arena.
4. `"finished"`: The post-game recap.

## Rule 5: Global App Registry
Once your Manager is built, you must register it in `main.py` so the router knows where to direct traffic for `ws:///app/your_app_name/...`:

```python
# main.py
from apps.cross_clue.game import CrossClueGameManager
from apps.bingo.game import BingoGameManager
from apps.your_app_name.game import YourAppManager

apps = {
    "cross_clue": CrossClueGameManager(),
    "bingo": BingoGameManager(),
    "tic_tac_toe": TicTacToeGameManager(),
    "your_app_name": YourAppManager(),
}
```
