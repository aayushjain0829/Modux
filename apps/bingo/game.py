from typing import Dict, List, Set
from .models import BingoGameState, BingoPlayer


class BingoGameManager:
    def __init__(self):
        self.sessions: Dict[str, BingoGameState] = {}

    def get_session(self, session_id: str) -> BingoGameState:
        if session_id not in self.sessions:
            self.sessions[session_id] = BingoGameState(session_id=session_id)
        return self.sessions[session_id]
    
    def clear_session(self, session_id: str) -> None:
        """Completely remove a session - useful for testing"""
        if session_id in self.sessions:
            del self.sessions[session_id]

    def get_public_state(self, session_id: str) -> Dict:
        """Return the public game state for broadcasting"""
        game_state = self.get_session(session_id)
        return game_state.model_dump()

    def join_game(self, session_id: str, user_id: str, username: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # If this is the first player joining, ensure we start in waiting state
        # Also reset if session is in an unexpected state
        if len(game_state.turn_order) == 0 or game_state.status not in ['waiting', 'setup', 'playing', 'finished']:
            game_state.status = 'waiting'
            game_state.called_numbers = []
            game_state.winner = None
            game_state.current_turn_index = 0
            game_state.players = {}
            game_state.turn_order = []
        
        if user_id not in game_state.players:
            # New players are spectators if game is not in waiting status
            is_spectator = game_state.status != 'waiting'
            
            game_state.players[user_id] = BingoPlayer(
                username=username,
                is_ready=False,
                has_submitted=False,
                is_spectator=is_spectator,
                board=[],
                lines_completed=0
            )
            
            # Only add to turn order if not a spectator
            if not is_spectator:
                game_state.turn_order.append(user_id)
        
        return game_state

    def submit_board(self, session_id: str, user_id: str, board: List[List[int]]) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Spectators cannot submit boards
        if user_id in game_state.players and game_state.players[user_id].is_spectator:
            return game_state
        
        # Validate board: must be 5x5 and contain exactly numbers 1-25 with no duplicates
        if not self._validate_board(board):
            return game_state
        
        if user_id in game_state.players:
            game_state.players[user_id].board = board
            game_state.players[user_id].has_submitted = True
        
        # Check if all players have submitted boards (only non-spectators)
        if self._all_players_submitted(game_state):
            game_state.status = 'playing'
        
        return game_state

    def toggle_ready(self, session_id: str, user_id: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        if user_id in game_state.players:
            game_state.players[user_id].is_ready = not game_state.players[user_id].is_ready
        
        return game_state

    def start_game(self, session_id: str, user_id: str) -> BingoGameState:
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
            game_state.status = 'setup'
            
            # Reset game state for new game
            game_state.called_numbers = []
            game_state.winner = None
            game_state.current_turn_index = 0
            
            # Reset all players' game state
            for player_id in game_state.players:
                game_state.players[player_id].is_ready = False
                game_state.players[player_id].has_submitted = False
                game_state.players[player_id].board = []
                game_state.players[player_id].lines_completed = 0
                # Reset all players to setup stage for new game
                game_state.players[player_id].player_stage = 'setup'
        
        return game_state

    def play_again(self, session_id: str, user_id: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Only host can play again (reset entire game for everyone)
        if len(game_state.turn_order) > 0 and user_id != game_state.turn_order[0]:
            return game_state
        
        # Reset game state but keep players
        game_state.status = 'waiting'
        game_state.called_numbers = []
        game_state.winner = None
        game_state.current_turn_index = 0
        
        # Reset player boards and statuses
        for player_id in game_state.players:
            game_state.players[player_id].board = []
            game_state.players[player_id].is_ready = False
            game_state.players[player_id].has_submitted = False
            game_state.players[player_id].is_spectator = False
            game_state.players[player_id].lines_completed = 0
        
        return game_state

    def return_to_lobby(self, session_id: str, user_id: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Individual player returns to lobby
        if user_id in game_state.players:
            # If game is finished, move player to individual lobby stage
            if game_state.status == 'finished':
                game_state.players[user_id].player_stage = 'lobby'
                game_state.players[user_id].board = []
                game_state.players[user_id].is_ready = False
                game_state.players[user_id].has_submitted = False
                game_state.players[user_id].is_spectator = False  # Reset spectator status
                game_state.players[user_id].lines_completed = 0
                
                # Add back to turn order if they were a spectator
                if user_id not in game_state.turn_order:
                    game_state.turn_order.append(user_id)
        
        return game_state

    def leave_game(self, session_id: str, user_id: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Remove player from game
        if user_id in game_state.players:
            del game_state.players[user_id]
        
        # Remove from turn order
        if user_id in game_state.turn_order:
            player_index = game_state.turn_order.index(user_id)
            game_state.turn_order.remove(user_id)
            
            # If it was their turn, advance to next player
            if player_index == game_state.current_turn_index and game_state.turn_order:
                game_state.current_turn_index = game_state.current_turn_index % len(game_state.turn_order)
        
        # If no players left, clean up session
        if len(game_state.turn_order) == 0:
            if session_id in self.sessions:
                del self.sessions[session_id]
        
        return game_state

    def call_number(self, session_id: str, user_id: str, number: int) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Gatekeeper: verify game is playing and it's the user's turn
        if game_state.status != 'playing':
            return game_state
        
        if user_id != game_state.turn_order[game_state.current_turn_index]:
            return game_state
        
        # Validate number is between 1-25 and not already called
        if number < 1 or number > 25:
            return game_state
        
        if number in game_state.called_numbers:
            return game_state
        
        # Add to called numbers
        game_state.called_numbers.append(number)
        
        # Recalculate lines completed for all players
        called_set: Set[int] = set(game_state.called_numbers)
        potential_winners: List[str] = []
        
        for player_id, player in game_state.players.items():
            if player.board:
                player.lines_completed = self._calculate_lines_completed(player.board, called_set)
                
                # Collect potential winners (5+ lines completed)
                if player.lines_completed >= 5:
                    potential_winners.append(player_id)
        
        # Check win condition with tie-breaker logic
        if len(potential_winners) > 0:
            game_state.status = 'finished'
            
            # Tie-breaker: If multiple winners, prioritize the active player (who called the number)
            if len(potential_winners) > 1:
                if user_id in potential_winners:
                    # Active player wins the tie
                    game_state.winner = user_id
                else:
                    # Fallback: shouldn't happen mathematically, but default to first in list
                    game_state.winner = potential_winners[0]
            else:
                # Single winner
                game_state.winner = potential_winners[0]
            
            return game_state
        
        # Advance turn if game not finished
        if game_state.status == 'playing':
            game_state.current_turn_index = (game_state.current_turn_index + 1) % len(game_state.turn_order)
        
        return game_state

    def _validate_board(self, board: List[List[int]]) -> bool:
        # Check if board is 5x5
        if len(board) != 5:
            return False
        
        for row in board:
            if len(row) != 5:
                return False
        
        # Flatten board and check for exactly numbers 1-25 with no duplicates
        flat_board = [num for row in board for num in row]
        
        if len(flat_board) != 25:
            return False
        
        if set(flat_board) != set(range(1, 26)):
            return False
        
        return True

    def _all_players_ready(self, game_state: BingoGameState) -> bool:
        for player_id in game_state.turn_order:
            if player_id not in game_state.players or not game_state.players[player_id].is_ready:
                return False
        return True

    def _all_players_submitted(self, game_state: BingoGameState) -> bool:
        # Only check non-spectator players in turn order
        for player_id in game_state.turn_order:
            if player_id not in game_state.players:
                return False
            player = game_state.players[player_id]
            if not player.is_spectator and not player.has_submitted:
                return False
        return True

    def _calculate_lines_completed(self, board: List[List[int]], called_numbers: Set[int]) -> int:
        lines_completed = 0
        
        # Check 5 rows
        for row in board:
            if all(num in called_numbers for num in row):
                lines_completed += 1
        
        # Check 5 columns
        for col_idx in range(5):
            column = [board[row_idx][col_idx] for row_idx in range(5)]
            if all(num in called_numbers for num in column):
                lines_completed += 1
        
        # Check 2 major diagonals
        diagonal1 = [board[i][i] for i in range(5)]
        if all(num in called_numbers for num in diagonal1):
            lines_completed += 1
        
        diagonal2 = [board[i][4 - i] for i in range(5)]
        if all(num in called_numbers for num in diagonal2):
            lines_completed += 1
        
        return lines_completed
