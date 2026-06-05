import random
import time
from typing import Dict, Optional, List, Tuple, Any
from .models import CrossClueGameState, CrossCluePlayer
from apps.base import BaseGameManager


def get_current_timestamp() -> float:
    """Get current Unix timestamp"""
    return time.time()

# Word bank for Cross Clue game
WORD_BANK = list(set([
    "Apple", "Bear", "Cloud", "Dream", "Eagle", "Fire", "Ghost", "House",
    "Ice", "Jungle", "Key", "Light", "Moon", "Night", "Ocean", "Piano",
    "Queen", "Rain", "Star", "Tree", "Umbrella", "Volcano", "Water", "X-ray",
    "Yellow", "Zebra", "Bridge", "Castle", "Dragon", "Elephant", "Flower", "Garden",
    "Hammer", "Island", "Jewel", "Kite", "Lemon", "Mountain", "Notebook", "Orange",
    "Pencil", "Quilt", "Robot", "Snake", "Tiger", "Urn", "Violin", "Window",
    "Yacht", "Zoo", "Anchor", "Balloon", "Candle", "Diamond", "Engine", "Feather",
    "Guitar", "Helmet", "Igloo", "Jacket", "Kangaroo", "Lamp", "Mirror", "Needle",
    "Owl", "Pearl", "Question", "Rocket", "Sword", "Train", "Uniform", "Video",
    "Whale", "Yogurt", "Zero", "Ant", "Bee", "Cat", "Dog", "Egg", "Fish",
    "Goat", "Hen", "Ink", "Jar", "Leaf", "Milk", "Nest",
    "Pen", "Quill", "Rat", "Sun", "Tea", "Vase",
    "Wolf", "Yak", "Zinc"
]))


class CrossClueGameManager(BaseGameManager):
    def __init__(self):
        # Store game states: {session_id: game_state}
        self.game_states: Dict[str, CrossClueGameState] = {}

    def get_session(self, session_id: str) -> CrossClueGameState:
        """Get or create a game session"""
        if session_id not in self.game_states:
            self.game_states[session_id] = CrossClueGameState(session_id=session_id)
        return self.game_states[session_id]

    def init_game(self, session_id: str) -> CrossClueGameState:
        """Initialize a new game state for a session"""
        game_state = self.get_session(session_id)
        
        # Select 8 unique words from word bank
        selected_words = random.sample(WORD_BANK, 8)
        game_state.row_words = selected_words[:4]  # For rows A, B, C, D
        game_state.col_words = selected_words[4:]  # For columns 1, 2, 3, 4
        
        # Generate all 16 coordinates
        rows = ['A', 'B', 'C', 'D']
        cols = ['1', '2', '3', '4']
        game_state.deck = [f"{row}{col}" for row in rows for col in cols]
        random.shuffle(game_state.deck)
        
        # Initialize grid state
        game_state.grid_state = {coord: 'empty' for coord in game_state.deck}
        game_state.active_turn = None
        
        return game_state

    def join_game(self, session_id: str, user_id: str, username: str) -> CrossClueGameState:
        """Join a game session"""
        game_state = self.get_session(session_id)
        
        # Add player if not already in game
        if user_id not in game_state.players:
            # Create player and set as ready by default (cooperative game)
            player = CrossCluePlayer(username=username)
            player.is_ready = True  # Explicitly set ready status
            
            # Mark as spectator if game not in waiting status
            if game_state.status != 'waiting':
                player.is_spectator = True
            else:
                # Add to turn order if in waiting stage
                if user_id not in game_state.turn_order:
                    game_state.turn_order.append(user_id)
                    # Set first player as host
                    if len(game_state.turn_order) == 1:
                        game_state.host_id = user_id
            
            game_state.players[user_id] = player
        
        return game_state

    def remove_player(self, session_id: str, user_id: str) -> Optional[CrossClueGameState]:
        """Remove player from game"""
        game_state = self.get_session(session_id)
        
        # Remove player from game
        if user_id in game_state.players:
            del game_state.players[user_id]
        
        # Remove from turn order
        if user_id in game_state.turn_order:
            game_state.turn_order.remove(user_id)
            # Adjust current turn index if needed
            if game_state.current_turn_index >= len(game_state.turn_order) and game_state.turn_order:
                game_state.current_turn_index = 0
                
        # If no players left, clean up session
        if len(game_state.turn_order) == 0:
            if session_id in self.game_states:
                del self.game_states[session_id]
            return None
        
        return game_state

    def handle_action(self, session_id: str, user_id: str, action: str, payload: Dict[str, Any]) -> Tuple[Optional[CrossClueGameState], Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        if action == "join_game":
            username = payload.get("username", f"Player_{user_id[:4]}")
            state = self.join_game(session_id, user_id, username)
            return state, None, None
            
        elif action == "toggle_ready":
            state = self.toggle_ready(session_id, user_id)
            return state, None, None
            
        elif action == "update_config":
            state = self.get_session(session_id)
            if len(state.turn_order) > 0 and user_id == state.turn_order[0]:
                config = payload.get("config", {})
                state = self.update_config(
                    session_id, 
                    turn_timer=config.get("turn_timer", 60),
                    game_timer=config.get("game_timer", 300)
                )
                return state, None, None
                
        elif action == "start_game":
            state = self.start_game(session_id, user_id)
            return state, None, None
            
        elif action == "return_to_lobby":
            state = self.return_to_lobby(session_id, user_id)
            return state, None, None
            
        elif action == "leave_game":
            state = self.remove_player(session_id, user_id)
            return state, None, None
            
        elif action == "submit_setup":
            state = self.submit_setup(session_id, user_id)
            return state, None, None
            
        elif action == "draw_card":
            coordinate = self.draw_card(session_id, user_id)
            if coordinate:
                personal_msg = {
                    "type": "secret_update",
                    "data": {"coordinate": coordinate}
                }
                state = self.get_session(session_id)
                return state, None, personal_msg
            
        elif action == "submit_clue":
            clue = payload.get("clue")
            if clue and self.submit_clue(session_id, user_id, clue):
                state = self.get_session(session_id)
                return state, None, None
                
        elif action == "guess_coordinate":
            guess = payload.get("guess")
            if guess:
                result = self.guess_coordinate(session_id, user_id, guess)
                if result:
                    result["type"] = "guess_result"
                    state = self.get_session(session_id)
                    return state, result, None
                    
        elif action == "action_timeout":
            result = self.action_timeout(session_id)
            if result:
                result["type"] = "action_timeout_result"
                state = self.get_session(session_id)
                return state, result, None
                
        elif action == "game_timeout":
            result = self.game_timeout(session_id)
            if result:
                state = self.get_session(session_id)
                return state, result, None
                
        elif action == "submit_vote":
            coordinate = payload.get("coordinate")
            if coordinate:
                result = self.submit_vote(session_id, user_id, coordinate)
                if result:
                    state = self.get_session(session_id)
                    return state, result, None
                    
        elif action == "get_state":
            state = self.get_session(session_id)
            return None, None, {"type": "state_update", "data": state.model_dump()}
            
        return None, None, None

    def toggle_ready(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Toggle player ready status"""
        game_state = self.get_session(session_id)
        
        if user_id in game_state.players:
            game_state.players[user_id].is_ready = not game_state.players[user_id].is_ready
        
        return game_state

    def update_config(self, session_id: str, turn_timer: int = 60, game_timer: int = 300) -> CrossClueGameState:
        """Update game configuration (host only, in waiting or finished stage)"""
        game_state = self.get_session(session_id)
        
        if game_state.status not in ['waiting', 'finished']:
            return game_state
        
        # Update timers if provided
        if turn_timer is not None:
            game_state.turn_timer = turn_timer
        if game_timer is not None:
            game_state.game_timer = game_timer
        
        return game_state

    def start_game(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Start the game"""
        game_state = self.get_session(session_id)
        
        # Only host can start game
        if len(game_state.turn_order) > 0 and user_id != game_state.turn_order[0]:
            return game_state
        
        # Need at least 2 active players
        active_players = [p for p in game_state.players.values() if not p.is_spectator]
        if len(active_players) < 2:
            return game_state

        # Allow starting game if global status is waiting OR if host is in lobby stage
        can_start = (
            game_state.status == 'waiting' or 
            (game_state.status == 'finished' and game_state.players[user_id].player_stage == 'lobby')
        )
        
        if can_start:
            # Initialize game content
            self.init_game(session_id)
            
            # Set initial roles (need at least 2 players)
            if len(game_state.turn_order) >= 2:
                # Set initial turn
                game_state.active_giver_id = game_state.turn_order[0]
                game_state.active_guesser_id = game_state.turn_order[1] if len(game_state.turn_order) > 1 else game_state.turn_order[0]
                game_state.turn_phase = 'giving_clue'
                
                game_state.turn_phase = 'giving_clue'
            
            # Reset game variables
            game_state.score = 0
            game_state.misses = 0
            
            # Transition to setup instead of playing
            game_state.status = 'setup'
            
            # Move all players to setup stage and reset submission status
            for player_id in game_state.players:
                game_state.players[player_id].player_stage = 'setup'
                game_state.players[player_id].has_submitted = False
        
        return game_state

    def submit_setup(self, session_id: str, user_id: str) -> Optional[CrossClueGameState]:
        """Submit setup (ready to play)"""
        game_state = self.get_session(session_id)
        
        if game_state.status != 'setup' or user_id not in game_state.players:
            return None
            
        # Set player as submitted
        game_state.players[user_id].has_submitted = True
        
        # Check if all active players have submitted
        active_players = [p for p in game_state.players.values() if not p.is_spectator]
        if all(p.has_submitted for p in active_players):
            # Set game start time and action deadline now
            game_state.game_start_time = get_current_timestamp()
            if game_state.turn_timer:
                game_state.action_deadline = get_current_timestamp() + game_state.turn_timer
            
            # Transition to playing
            game_state.status = 'playing'
            for player_id in game_state.players:
                game_state.players[player_id].player_stage = 'playing'
                
        return game_state

    def draw_card(self, session_id: str, user_id: str) -> Optional[str]:
        """Draw a card from the deck for a user"""
        game_state = self.get_session(session_id)
        
        if not game_state or not game_state.deck:
            return None
        
        # Only allow active giver to draw card
        if game_state.active_giver_id != user_id:
            return None
        
        # Allow drawing a new card even if active_turn exists (for new turns)
        coordinate = game_state.deck.pop()
        game_state.active_turn = {
            'user_id': user_id,
            'secret_coordinate': coordinate,
            'clue': None
        }
        return coordinate

    def submit_clue(self, session_id: str, user_id: str, clue: str) -> bool:
        """Submit a clue (optional for local games)"""
        game_state = self.get_session(session_id)
        
        # Check if it's the clue giver's turn
        if (game_state.status != 'playing' or 
            game_state.active_giver_id != user_id or 
            not game_state.active_turn):
            return False
        
        # Store the clue (optional, for reference)
        game_state.active_turn['clue'] = clue
        game_state.current_clue = clue  # Make visible to all players
        
        # Don't transition to guessing phase - let players communicate vocally
        # The turn continues with the same timer
        
        return True

    def guess_coordinate(self, session_id: str, user_id: str, guess: str) -> Optional[Dict]:
        """Process a coordinate guess and rotate turns"""
        game_state = self.get_session(session_id)
        
        # Check if it's the guesser's turn (no phase restriction for local games)
        if (game_state.status != 'playing' or 
            game_state.active_guesser_id != user_id or 
            not game_state.active_turn):
            return None
        
        secret = game_state.active_turn['secret_coordinate']
        is_correct = guess == secret
        
        # Update grid state
        game_state.grid_state[secret] = 'success' if is_correct else 'fail'
        
        # Track guess history
        if game_state.guess_history is None:
            game_state.guess_history = {}
        game_state.guess_history[secret] = user_id
        
        # Update score and misses
        if is_correct:
            game_state.score += 1
        else:
            game_state.misses += 1
        
        # Prepare result
        result = {
            'coordinate': secret,
            'is_correct': is_correct,
            'score': game_state.score,
            'misses': game_state.misses,
            'grid_state': game_state.grid_state
        }
        
        # Check if game is complete
        if self._is_game_complete(game_state):
            game_state.status = 'finished'
            game_state.game_end_time = get_current_timestamp()
            # Move all players to recap stage
            for player_id in game_state.players:
                game_state.players[player_id].player_stage = 'recap'
            result['game_complete'] = True
        else:
            # Rotate roles for next turn
            self._rotate_turns(game_state)
        
        return result

    def _is_game_complete(self, game_state: CrossClueGameState) -> bool:
        """Check if all coordinates have been guessed"""
        # Game is complete if all 16 coordinates are revealed
        revealed_count = len([coord for coord, state in game_state.grid_state.items() 
                            if state in ['success', 'fail']])
        return revealed_count >= 16

    def game_timeout(self, session_id: str) -> Optional[Dict]:
        """Handle game timeout - end game and move to recap"""
        game_state = self.get_session(session_id)
        
        if not game_state or game_state.status != 'playing':
            return None
        
        # Mark any remaining secret coordinate as failed
        if game_state.active_turn and 'secret_coordinate' in game_state.active_turn:
            secret = game_state.active_turn['secret_coordinate']
            if secret not in game_state.grid_state:
                game_state.grid_state[secret] = 'fail'
                game_state.misses += 1
                
                # Track guess history (nobody guessed it correctly)
                if game_state.guess_history is None:
                    game_state.guess_history = {}
                game_state.guess_history[secret] = game_state.active_guesser_id  # Current guesser gets credit for attempt
        
        # End the game
        game_state.status = 'finished'
        game_state.game_end_time = get_current_timestamp()
        
        # Move all players to recap stage
        for player_id in game_state.players:
            game_state.players[player_id].player_stage = 'recap'
        
        return {
            'type': 'game_timeout',
            'reason': 'game_timer_expired',
            'score': game_state.score,
            'misses': game_state.misses,
            'grid_state': game_state.grid_state,
            'message': 'Game time expired! Moving to recap stage.'
        }

    def _rotate_turns(self, game_state: CrossClueGameState):
        """Rotate roles and set up next turn"""
        turn_order = game_state.turn_order
        
        # Find current giver index and move to next giver
        current_giver_index = turn_order.index(game_state.active_giver_id)
        next_giver_index = (current_giver_index + 1) % len(turn_order)
        
        # Set next giver
        game_state.active_giver_id = turn_order[next_giver_index]
        
        # Set guesser as the next player after giver (skip the giver themselves)
        next_guesser_index = (next_giver_index + 1) % len(turn_order)
        game_state.active_guesser_id = turn_order[next_guesser_index]
        
        game_state.turn_phase = 'giving_clue'
        
        # Set new action deadline for entire turn
        game_state.action_deadline = get_current_timestamp() + game_state.turn_timer
        
        # Clear active turn, current clue, and votes for new turn
        game_state.active_turn = None
        game_state.current_clue = None
        game_state.votes = None

    def submit_vote(self, session_id: str, user_id: str, coordinate: str) -> Optional[Dict]:
        """Submit a vote from a voter"""
        game_state = self.get_session(session_id)
        
        if not game_state or game_state.status != 'playing':
            return None
        
        # Check if user is a voter (not giver or guesser)
        if (user_id == game_state.active_giver_id or 
            user_id == game_state.active_guesser_id):
            return None
        
        # Initialize votes dict if not exists
        if game_state.votes is None:
            game_state.votes = {}
        
        # Add or update vote
        game_state.votes[user_id] = coordinate
        
        return {
            'type': 'vote',
            'voter_id': user_id,
            'coordinate': coordinate,
            'total_votes': len(game_state.votes)
        }

    def action_timeout(self, session_id: str) -> Optional[Dict]:
        """Handle action timeout - skip current phase and rotate turns"""
        game_state = self.get_session(session_id)
        
        if game_state.status != 'playing' or not game_state.action_deadline:
            return None
        
        current_time = get_current_timestamp()
        if current_time < game_state.action_deadline:
            return None  # Not timed out yet
        
        # Handle timeout for entire turn
        result = {
            'timeout': True,
            'phase': 'turn',
            'score': game_state.score,
            'misses': game_state.misses,
            'reason': 'turn_timeout'
        }
        
        # Mark the secret coordinate as failed since it wasn't guessed
        if game_state.active_turn and 'secret_coordinate' in game_state.active_turn:
            secret = game_state.active_turn['secret_coordinate']
            game_state.grid_state[secret] = 'fail'
            result['grid_state'] = game_state.grid_state
            game_state.misses += 1
            
            # Track guess history (timeout - current guesser gets credit)
            if game_state.guess_history is None:
                game_state.guess_history = {}
            game_state.guess_history[secret] = game_state.active_guesser_id
        
        # Rotate turns
        self._rotate_turns(game_state)
        
        return result

    def return_to_lobby(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Individual player returns to lobby"""
        game_state = self.get_session(session_id)
        
        if user_id in game_state.players:
            # If game is finished, move player to individual lobby stage
            if game_state.status == 'finished':
                game_state.players[user_id].player_stage = 'lobby'
                game_state.players[user_id].is_spectator = False  # Reset spectator status
                game_state.players[user_id].has_submitted = False # Reset submission status
                
                # Add back to turn order if they were a spectator
                if user_id not in game_state.turn_order:
                    game_state.turn_order.append(user_id)
        
        return game_state
