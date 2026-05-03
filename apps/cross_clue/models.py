from typing import Dict, List, Optional, Literal
from pydantic import BaseModel


class CrossCluePlayer(BaseModel):
    username: str
    is_ready: bool = False
    has_submitted: bool = False
    is_spectator: bool = False
    player_stage: Literal['recap', 'lobby'] = 'recap'  # Individual player stage


class CrossClueGameState(BaseModel):
    session_id: str
    status: Literal['waiting', 'setup', 'playing', 'finished'] = 'waiting'
    host_id: str = ""
    turn_order: List[str] = []
    current_turn_index: int = 0
    
    # Cross Clue specific fields
    row_words: List[str] = []
    col_words: List[str] = []
    deck: List[str] = []
    grid_state: Dict[str, str] = {}  # coordinate -> 'empty' | 'success' | 'fail'
    active_turn: Optional[Dict] = None  # {user_id, secret_coordinate, clue}
    
    # Players
    players: Dict[str, CrossCluePlayer] = {}
