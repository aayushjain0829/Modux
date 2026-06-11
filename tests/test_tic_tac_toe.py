import pytest
from apps.tic_tac_toe.game import TicTacToeGameManager
from apps.tic_tac_toe.models import TicTacToeGameState

@pytest.fixture
def manager():
    return TicTacToeGameManager()

@pytest.fixture
def session_id():
    return "test_ttt_session"

def test_join_and_start_game(manager, session_id):
    state = manager.join_game(session_id, "u1", "Host")
    state = manager.join_game(session_id, "u2", "Opponent")
    state = manager.join_game(session_id, "u3", "Spec")

    assert len(state.players) == 3
    assert state.host_id == "u1"
    
    state = manager.start_game(session_id, "u1")
    
    assert state.status == "playing"
    assert "u3" in [p for p, data in state.players.items() if data.is_spectator]
    assert state.turn_order == ["u1", "u2"] or state.turn_order == ["u2", "u1"]
    
def test_win_condition(manager, session_id):
    state = manager.join_game(session_id, "u1", "Host")
    state = manager.join_game(session_id, "u2", "Opponent")
    
    # Configure u1 to go first
    state.config["first_player_rule"] = "host"
    state = manager.start_game(session_id, "u1")
    
    assert state.turn_order[0] == "u1"
    
    # u1 top left
    state = manager.place_mark(session_id, "u1", 0, 0)
    assert state.board[0][0] == "u1"
    
    # u2 middle left
    state = manager.place_mark(session_id, "u2", 1, 0)
    
    # u1 top middle
    state = manager.place_mark(session_id, "u1", 0, 1)
    
    # u2 middle
    state = manager.place_mark(session_id, "u2", 1, 1)
    
    # u1 top right (WIN)
    state = manager.place_mark(session_id, "u1", 0, 2)
    
    assert state.status == "finished"
    assert state.winner == "u1"

def test_draw_condition(manager, session_id):
    state = manager.join_game(session_id, "u1", "Host")
    state = manager.join_game(session_id, "u2", "Opponent")
    state.config["first_player_rule"] = "host"
    state = manager.start_game(session_id, "u1")
    
    # Fill the board for a draw
    # X O X
    # X O O
    # O X X
    
    moves = [
        ("u1", 0, 0), ("u2", 0, 1), ("u1", 0, 2),
        ("u2", 1, 1), ("u1", 1, 0), ("u2", 1, 2),
        ("u1", 2, 1), ("u2", 2, 0), ("u1", 2, 2)
    ]
    
    for user, row, col in moves:
        state = manager.place_mark(session_id, user, row, col)
        
    assert state.status == "finished"
    assert state.winner == "tie"

def test_update_config_and_opponent_selection(manager, session_id):
    manager.join_game(session_id, "u1", "Host")
    manager.join_game(session_id, "u2", "Player2")
    manager.join_game(session_id, "u3", "Player3")
    
    # Update config to set u3 as opponent and u3 to go first
    config_payload = {
        "config": {
            "opponent_id": "u3",
            "first_player_rule": "u3"
        }
    }
    state, _, _ = manager.handle_action(session_id, "u1", "update_config", config_payload)
    
    assert state.config["opponent_id"] == "u3"
    assert state.config["first_player_rule"] == "u3"
    
    # Start game
    state = manager.start_game(session_id, "u1")
    
    # Check turn order and spectators
    assert state.turn_order == ["u3", "u1"]
    assert state.players["u2"].is_spectator == True
    assert state.players["u1"].is_spectator == False
    assert state.players["u3"].is_spectator == False
