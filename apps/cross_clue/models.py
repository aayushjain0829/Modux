from typing import Dict, List, Optional, Literal
from apps.base import BasePlayer, BaseGameState


class CrossCluePlayer(BasePlayer):
    pass


class CrossClueGameState(BaseGameState):
    # Cross Clue specific fields
    row_words: List[str] = []
    col_words: List[str] = []
    deck: List[str] = []
    grid_state: Dict[str, str] = {}  # coordinate -> 'empty' | 'success' | 'fail'
    active_turn: Optional[Dict] = None  # {user_id, secret_coordinate, clue}
    current_clue: Optional[str] = None  # Current clue visible to all players
    votes: Optional[Dict[str, str]] = None  # {user_id: coordinate}
    guess_history: Optional[Dict[str, str]] = None  # {coordinate: user_id} - who guessed what
    
    # Game configuration
    turn_timer: int = 60  # seconds for entire turn (clue + guess)
    game_timer: int = 300  # total game time in seconds
    game_start_time: Optional[float] = None  # Unix timestamp when game started
    game_end_time: Optional[float] = None  # Unix timestamp when game ended
    
    # Turn-based game variables
    score: int = 0
    misses: int = 0
    active_giver_id: Optional[str] = None
    active_guesser_id: Optional[str] = None
    turn_phase: Literal['giving_clue', 'guessing'] = 'giving_clue'
    action_deadline: Optional[float] = None  # Unix timestamp
    
    # Players
    players: Dict[str, CrossCluePlayer] = {}
