## 🛠️ Backend Rules for Creating a New Game

Modux is designed to be highly modular. To add a new game to the backend, you must follow these strict architectural rules to ensure seamless integration with the global WebSocket router.

### Rule 1: Directory Structure
1. Create a new directory under `apps/your_app_name/`.
2. This directory must contain `__init__.py` and `game.py`.
3. (Optional) Define Pydantic models in `models.py` for rigid state typing.

### Rule 2: The GameStateManager Interface
Your `game.py` must define a `GameStateManager` class. The global WebSocket connection manager handles all I/O and simply passes the payload to your class via a single required method:

```python
async def handle_action(self, user_id: str, action: str, data: dict, session: dict) -> dict:
    # Handle the action and return the mutated session state
    return session
```

### Rule 3: Enforce the 4-Stage State Machine
The returned `session` dictionary must possess a `status` key dictating the current phase of the game. You must utilize the standardized pipeline:
1. `"waiting"`: The initial lobby phase.
2. `"setup"`: (Optional) Configuration or board generation.
3. `"playing"`: The active gameplay arena.
4. `"finished"`: The post-game recap.

### Rule 4: Global App Registry
Once your `GameStateManager` is built, you must register it in `main.py` so the router knows where to direct traffic for `ws:///app/your_app_name/...`:

```python
from apps.your_app_name.game import GameStateManager as YourAppManager

apps = {
    "cross_clue": CrossClueManager(),
    "bingo": BingoManager(),
    "your_app_name": YourAppManager(),
}
```
