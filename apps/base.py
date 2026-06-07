from typing import Dict, List, Literal, Optional, Any
from pydantic import BaseModel
import abc


class BasePlayer(BaseModel):
    username: str
    is_ready: bool = False
    has_submitted: bool = False
    is_spectator: bool = False
    player_stage: Literal["recap", "lobby"] = "recap"


class BaseGameState(BaseModel):
    session_id: str
    status: Literal["waiting", "setup", "playing", "finished"] = "waiting"
    host_id: str = ""
    turn_order: List[str] = []
    current_turn_index: int = 0
    players: Dict[str, BasePlayer] = {}


class BaseGameManager(abc.ABC):
    @abc.abstractmethod
    def get_session(self, session_id: str) -> BaseGameState:
        pass

    @abc.abstractmethod
    def join_game(self, session_id: str, user_id: str, username: str) -> BaseGameState:
        pass

    @abc.abstractmethod
    def remove_player(self, session_id: str, user_id: str) -> Optional[BaseGameState]:
        """Remove a player and handle any turn/state adjustments. Returns updated state if session still exists."""
        pass

    @abc.abstractmethod
    def handle_action(
        self, session_id: str, user_id: str, action: str, payload: Dict[str, Any]
    ) -> tuple[
        Optional[BaseGameState], Optional[Dict[str, Any]], Optional[Dict[str, Any]]
    ]:
        """
        Handle a game-specific action.
        Returns a tuple: (
            updated_game_state: Optional[BaseGameState] (if state changed and should be broadcast),
            broadcast_message: Optional[Dict] (any specific message to broadcast to all),
            personal_message: Optional[Dict] (any specific message to send to the acting user)
        )
        """
        pass
