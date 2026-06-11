from pydantic import BaseModel
from typing import List, Dict, Optional, Literal, Any
from apps.base import BasePlayer, BaseGameState

class TicTacToePlayer(BasePlayer):
    pass

class TicTacToeGameState(BaseGameState):
    board: List[List[Optional[str]]] = []
    winner: Optional[str] = None
    players: Dict[str, TicTacToePlayer] = {}
    config: Dict[str, Any] = {"opponent_id": None, "first_player_rule": "random"}
    last_move: Optional[Dict[str, int]] = None
