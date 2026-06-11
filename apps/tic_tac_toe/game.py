import random
from typing import Dict, List, Set, Any, Optional, Tuple
from .models import TicTacToeGameState, TicTacToePlayer
from apps.base import BaseGameManager

class TicTacToeGameManager(BaseGameManager):
    def __init__(self):
        self.sessions: Dict[str, TicTacToeGameState] = {}

    def get_session(self, session_id: str) -> TicTacToeGameState:
        if session_id not in self.sessions:
            self.sessions[session_id] = TicTacToeGameState(session_id=session_id)
        return self.sessions[session_id]

    def clear_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

    def join_game(self, session_id: str, user_id: str, username: str) -> TicTacToeGameState:
        game_state = self.get_session(session_id)

        if len(game_state.turn_order) == 0 or game_state.status not in [
            "waiting", "setup", "playing", "finished"
        ]:
            game_state.status = "waiting"
            game_state.board = []
            game_state.winner = None
            game_state.current_turn_index = 0
            game_state.players = {}
            game_state.turn_order = []
            game_state.last_move = None

        if user_id not in game_state.players:
            is_spectator = game_state.status != "waiting"
            game_state.players[user_id] = TicTacToePlayer(
                username=username,
                is_ready=False,
                has_submitted=False,
                is_spectator=is_spectator,
                player_stage="lobby" if game_state.status == "waiting" else "recap",
            )
            if not is_spectator:
                game_state.turn_order.append(user_id)
                if len(game_state.turn_order) == 1:
                    game_state.host_id = user_id

        return game_state

    def remove_player(self, session_id: str, user_id: str) -> Optional[TicTacToeGameState]:
        game_state = self.get_session(session_id)
        if user_id in game_state.players:
            del game_state.players[user_id]

        if user_id in game_state.turn_order:
            player_index = game_state.turn_order.index(user_id)
            game_state.turn_order.remove(user_id)
            if player_index == game_state.current_turn_index and game_state.turn_order:
                game_state.current_turn_index = game_state.current_turn_index % len(game_state.turn_order)

        if len(game_state.turn_order) == 0:
            if session_id in self.sessions:
                del self.sessions[session_id]
            return None

        return game_state

    def handle_action(
        self, session_id: str, user_id: str, action: str, payload: Dict[str, Any]
    ) -> Tuple[Optional[TicTacToeGameState], Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        if action == "update_username":
            new_name = payload.get("username")
            state = self.get_session(session_id)
            if user_id in state.players and new_name:
                state.players[user_id].username = new_name
            return state, None, None

        if action == "join_game":
            username = payload.get("username", f"Player_{user_id[:4]}")
            state = self.join_game(session_id, user_id, username)
            return state, None, None

        elif action == "toggle_ready":
            state = self.get_session(session_id)
            if user_id in state.players:
                state.players[user_id].is_ready = not state.players[user_id].is_ready
            return state, None, None

        elif action == "update_config":
            state = self.get_session(session_id)
            if len(state.turn_order) > 0 and user_id == state.turn_order[0]:
                config = payload.get("config")
                if config:
                    state.config = config
                    return state, None, None

        elif action == "start_game":
            state = self.start_game(session_id, user_id)
            return state, None, None

        elif action == "play_again":
            state = self.play_again(session_id, user_id)
            return state, None, None

        elif action == "return_to_lobby":
            state = self.return_to_lobby(session_id, user_id)
            return state, None, None

        elif action == "leave_game":
            state = self.remove_player(session_id, user_id)
            return state, None, None

        elif action == "place_mark":
            row = payload.get("row")
            col = payload.get("col")
            if row is not None and col is not None:
                state = self.place_mark(session_id, user_id, row, col)
                return state, None, None

        elif action == "get_state":
            state = self.get_session(session_id)
            return None, None, {"type": "state_update", "data": state.model_dump()}

        return None, None, None

    def start_game(self, session_id: str, user_id: str) -> TicTacToeGameState:
        game_state = self.get_session(session_id)
        if len(game_state.turn_order) > 0 and user_id != game_state.turn_order[0]:
            return game_state

        active_players = [p_id for p_id, p in game_state.players.items() if not p.is_spectator]
        if len(active_players) < 2:
            return game_state

        can_start = game_state.status == "waiting" or (
            game_state.status == "finished" and game_state.players[user_id].player_stage == "lobby"
        )

        if can_start:
            # Artificially skip setup stage and go straight to playing
            game_state.status = "playing"
            game_state.winner = None
            game_state.last_move = None
            
            # Opponent selection logic
            host_id = game_state.turn_order[0]
            opponent_id = game_state.config.get("opponent_id")
            
            # If no opponent is explicitly configured but we have active players, just pick the second one.
            if not opponent_id or opponent_id not in game_state.players:
                for p_id in active_players:
                    if p_id != host_id:
                        opponent_id = p_id
                        break
            
            # Setup turn order based on first_player_rule
            first_player_rule = game_state.config.get("first_player_rule", "random")
            if first_player_rule == "host":
                game_state.turn_order = [host_id, opponent_id]
            elif first_player_rule == opponent_id:
                game_state.turn_order = [opponent_id, host_id]
            else:
                # Default to random
                game_state.turn_order = [host_id, opponent_id] if random.choice([True, False]) else [opponent_id, host_id]
            
            # Enforce spectators
            for p_id, player in game_state.players.items():
                if p_id not in (host_id, opponent_id):
                    player.is_spectator = True
                else:
                    player.is_spectator = False
                player.is_ready = False
                player.player_stage = "playing"

            # Initialize game state
            game_state.current_turn_index = 0
            game_state.current_turn_index = 0
            
            game_state.board = [[None for _ in range(3)] for _ in range(3)]

        return game_state

    def play_again(self, session_id: str, user_id: str) -> TicTacToeGameState:
        game_state = self.get_session(session_id)
        if len(game_state.turn_order) > 0 and user_id != game_state.turn_order[0]:
            return game_state

        game_state.status = "waiting"
        game_state.winner = None
        game_state.last_move = None
        game_state.board = []
        game_state.current_turn_index = 0

        for player_id in game_state.players:
            game_state.players[player_id].is_ready = False
            game_state.players[player_id].is_spectator = False
            game_state.players[player_id].player_stage = "lobby"
            # Add them all back to turn order to let them be selected again
            if player_id not in game_state.turn_order:
                game_state.turn_order.append(player_id)

        # Remove duplicates from turn order while preserving order
        seen = set()
        new_turn_order = []
        for p in game_state.turn_order:
            if p not in seen:
                seen.add(p)
                new_turn_order.append(p)
        game_state.turn_order = new_turn_order

        return game_state

    def return_to_lobby(self, session_id: str, user_id: str) -> TicTacToeGameState:
        game_state = self.get_session(session_id)
        if user_id in game_state.players:
            if game_state.status == "finished":
                game_state.players[user_id].player_stage = "lobby"
                game_state.players[user_id].is_ready = False
                game_state.players[user_id].is_spectator = False
                if user_id not in game_state.turn_order:
                    game_state.turn_order.append(user_id)
        return game_state

    def place_mark(self, session_id: str, user_id: str, row: int, col: int) -> TicTacToeGameState:
        game_state = self.get_session(session_id)

        if game_state.status != "playing":
            return game_state

        if user_id != game_state.turn_order[game_state.current_turn_index]:
            return game_state

        if row < 0 or row >= 3 or col < 0 or col >= 3:
            return game_state

        if game_state.board[row][col] is not None:
            return game_state

        game_state.board[row][col] = user_id
        game_state.last_move = {"row": row, "col": col}

        # Check win condition (3 in a row)
        if self._check_win(game_state.board, user_id):
            game_state.status = "finished"
            game_state.winner = user_id
            return game_state

        # Check draw condition
        if self._check_draw(game_state.board):
            game_state.status = "finished"
            game_state.winner = "tie"
            return game_state

        game_state.current_turn_index = (game_state.current_turn_index + 1) % len(game_state.turn_order)
        return game_state

    def _check_win(self, board: List[List[Optional[str]]], user_id: str) -> bool:
        # Check rows
        for row in board:
            if all(cell == user_id for cell in row):
                return True
        # Check cols
        for col in range(3):
            if all(board[row][col] == user_id for row in range(3)):
                return True
        # Check diagonals
        if all(board[i][i] == user_id for i in range(3)):
            return True
        if all(board[i][2 - i] == user_id for i in range(3)):
            return True
        return False

    def _check_draw(self, board: List[List[Optional[str]]]) -> bool:
        for row in board:
            for cell in row:
                if cell is None:
                    return False
        return True
