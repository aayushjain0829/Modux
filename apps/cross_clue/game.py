import random
from typing import Dict, Optional

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


class GameStateManager:
    def __init__(self):
        # Store game states: {session_id: game_state}
        self.game_states: Dict[str, Dict] = {}

    def init_game(self, session_id: str) -> Dict:
        """Initialize a new game state for a session"""
        # Select 8 unique words from word bank
        selected_words = random.sample(WORD_BANK, 8)
        row_words = selected_words[:4]  # For rows A, B, C, D
        col_words = selected_words[4:]  # For columns 1, 2, 3, 4
        
        # Generate all 16 coordinates
        rows = ['A', 'B', 'C', 'D']
        cols = ['1', '2', '3', '4']
        deck = [f"{row}{col}" for row in rows for col in cols]
        random.shuffle(deck)
        
        # Initialize grid state
        grid_state = {coord: 'empty' for coord in deck}
        
        game_state = {
            'row_words': row_words,
            'col_words': col_words,
            'deck': deck,
            'grid_state': grid_state,
            'active_turn': None  # {user_id, secret_coordinate, clue}
        }
        
        self.game_states[session_id] = game_state
        return game_state

    def get_game_state(self, session_id: str) -> Optional[Dict]:
        """Get the current game state for a session"""
        return self.game_states.get(session_id)

    def draw_card(self, session_id: str, user_id: str) -> Optional[str]:
        """Draw a card from the deck for a user"""
        game_state = self.get_game_state(session_id)
        if not game_state or not game_state['deck']:
            return None
        
        coordinate = game_state['deck'].pop()
        game_state['active_turn'] = {
            'user_id': user_id,
            'secret_coordinate': coordinate,
            'clue': None
        }
        return coordinate

    def submit_clue(self, session_id: str, clue: str) -> bool:
        """Submit a clue from the active player"""
        game_state = self.get_game_state(session_id)
        if not game_state or not game_state['active_turn']:
            return False
        
        game_state['active_turn']['clue'] = clue
        return True

    def guess_coordinate(self, session_id: str, guess: str) -> Optional[Dict]:
        """Process a coordinate guess and return result"""
        game_state = self.get_game_state(session_id)
        if not game_state or not game_state['active_turn']:
            return None
        
        secret = game_state['active_turn']['secret_coordinate']
        is_correct = guess == secret
        
        # Update grid state
        game_state['grid_state'][secret] = 'success' if is_correct else 'fail'
        
        result = {
            'guess': guess,
            'secret': secret,
            'is_correct': is_correct,
            'grid_state': game_state['grid_state']
        }
        
        # Clear active turn
        game_state['active_turn'] = None
        
        return result

    def get_public_state(self, session_id: str) -> Optional[Dict]:
        """Get the public game state (without secret information)"""
        game_state = self.get_game_state(session_id)
        if not game_state:
            return None
        
        return {
            'row_words': game_state['row_words'],
            'col_words': game_state['col_words'],
            'grid_state': game_state['grid_state'],
            'active_clue': game_state['active_turn']['clue'] if game_state['active_turn'] else None,
            'deck_remaining': len(game_state['deck'])
        }
