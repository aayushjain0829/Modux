from typing import Dict, List, Set
from .models import BingoGameState, BingoPlayer


class BingoGameManager:
    def __init__(self):
        self.sessions: Dict[str, BingoGameState] = {}

    def get_session(self, session_id: str) -> BingoGameState:
        if session_id not in self.sessions:
            self.sessions[session_id] = BingoGameState(session_id=session_id)
        return self.sessions[session_id]

    def get_public_state(self, session_id: str) -> Dict:
        """Return the public game state for broadcasting"""
        game_state = self.get_session(session_id)
        return game_state.dict()

    def join_game(self, session_id: str, user_id: str, username: str) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        if user_id not in game_state.players:
            game_state.players[user_id] = BingoPlayer(
                username=username,
                is_ready=False,
                board=[],
                lines_completed=0
            )
            game_state.turn_order.append(user_id)
        
        return game_state

    def submit_board(self, session_id: str, user_id: str, board: List[List[int]]) -> BingoGameState:
        game_state = self.get_session(session_id)
        
        # Validate board: must be 5x5 and contain exactly numbers 1-25 with no duplicates
        if not self._validate_board(board):
            return game_state
        
        if user_id in game_state.players:
            game_state.players[user_id].board = board
            game_state.players[user_id].is_ready = True
        
        # Check if all players are ready
        if self._all_players_ready(game_state):
            game_state.status = 'playing'
        
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
        for player_id, player in game_state.players.items():
            if player.board:
                player.lines_completed = self._calculate_lines_completed(player.board, called_set)
                
                # Check win condition
                if player.lines_completed >= 5:
                    game_state.status = 'finished'
                    game_state.winner = player_id
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
