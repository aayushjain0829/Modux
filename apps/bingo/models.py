from pydantic import BaseModel
from typing import List, Dict, Optional, Literal, Any
from apps.base import BasePlayer, BaseGameState


class BingoPlayer(BasePlayer):
    board: List[List[int]] = []
    lines_completed: int = 0


class BingoGameState(BaseGameState):
    called_numbers: List[int] = []
    winner: Optional[str] = None
    players: Dict[str, BingoPlayer] = {}
    config: Dict[str, Any] = {'grid_size': 5, 'first_player_rule': 'random'}
    last_called_number: Optional[int] = None
