from pydantic import BaseModel
from typing import List, Dict, Optional, Literal, Any


class BingoPlayer(BaseModel):
    username: str
    is_ready: bool = False
    has_submitted: bool = False
    is_spectator: bool = False
    board: List[List[int]] = []
    lines_completed: int = 0
    player_stage: Literal['recap', 'lobby'] = 'recap'  # Individual player stage


class BingoGameState(BaseModel):
    session_id: str
    status: Literal['waiting', 'setup', 'playing', 'finished'] = 'waiting'
    turn_order: List[str] = []
    current_turn_index: int = 0
    called_numbers: List[int] = []
    winner: Optional[str] = None
    players: Dict[str, BingoPlayer] = {}
    config: Dict[str, Any] = {'grid_size': 5, 'first_player_rule': 'random'}
    last_called_number: Optional[int] = None
