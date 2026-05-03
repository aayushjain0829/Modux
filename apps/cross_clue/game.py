import random
from typing import Dict, Optional, List
from .models import CrossClueGameState, CrossCluePlayer

# Word bank for Cross Clue game
WORD_BANK = [
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
    "Goat", "Hen", "Ink", "Jar", "Kite", "Leaf", "Milk", "Nest",
    "Owl", "Pen", "Quill", "Rat", "Sun", "Tea", "Urn", "Vase",
    "Wolf", "Yak", "Zinc"
]


class CrossClueGameManager:
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
            player = CrossCluePlayer(username=username)
            
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

    def toggle_ready(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Toggle player ready status"""
        game_state = self.get_session(session_id)
        
        if user_id in game_state.players:
            game_state.players[user_id].is_ready = not game_state.players[user_id].is_ready
        
        return game_state

    def start_game(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Start the game"""
        game_state = self.get_session(session_id)
        
        # Only host can start game
        if len(game_state.turn_order) > 0 and user_id != game_state.turn_order[0]:
            return game_state
        
        # Allow starting game if global status is waiting OR if host is in lobby stage
        can_start = (
            game_state.status == 'waiting' or 
            (game_state.status == 'finished' and game_state.players[user_id].player_stage == 'lobby')
        )
        
        if can_start:
            game_state.status = 'playing'  # CrossClue goes directly to playing (no setup needed)
            # Initialize game content
            self.init_game(session_id)
            # Reset all players to recap stage
            for player_id in game_state.players:
                game_state.players[player_id].is_ready = False
                game_state.players[player_id].player_stage = 'recap'
        
        return game_state

    def draw_card(self, session_id: str, user_id: str) -> Optional[str]:
        """Draw a card from the deck for a user"""
        game_state = self.get_session(session_id)
        if not game_state or not game_state.deck:
            return None
        
        coordinate = game_state.deck.pop()
        game_state.active_turn = {
            'user_id': user_id,
            'secret_coordinate': coordinate,
            'clue': None
        }
        return coordinate

    def submit_clue(self, session_id: str, clue: str) -> bool:
        """Submit a clue from the active player"""
        game_state = self.get_session(session_id)
        if not game_state or not game_state.active_turn:
            return False
        
        game_state.active_turn['clue'] = clue
        return True

    def guess_coordinate(self, session_id: str, guess: str) -> Optional[Dict]:
        """Process a coordinate guess and return result"""
        game_state = self.get_session(session_id)
        if not game_state or not game_state.active_turn:
            return None
        
        secret = game_state.active_turn['secret_coordinate']
        is_correct = guess == secret
        
        # Update grid state
        game_state.grid_state[secret] = 'success' if is_correct else 'fail'
        
        result = {
            'guess': guess,
            'secret': secret,
            'is_correct': is_correct,
            'grid_state': game_state.grid_state
        }
        
        # Clear active turn
        game_state.active_turn = None
        
        return result

    def return_to_lobby(self, session_id: str, user_id: str) -> CrossClueGameState:
        """Individual player returns to lobby"""
        game_state = self.get_session(session_id)
        
        if user_id in game_state.players:
            # If game is finished, move player to individual lobby stage
            if game_state.status == 'finished':
                game_state.players[user_id].player_stage = 'lobby'
                game_state.players[user_id].is_spectator = False  # Reset spectator status
                
                # Add back to turn order if they were a spectator
                if user_id not in game_state.turn_order:
                    game_state.turn_order.append(user_id)
        
        return game_state

    def leave_game(self, session_id: str, user_id: str) -> CrossClueGameState:
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
        
        return game_state
