import pytest
from apps.bingo.game import BingoGameManager
from apps.bingo.models import BingoGameState

@pytest.fixture
def manager():
    return BingoGameManager()

@pytest.fixture
def session_id():
    return "test_bingo_session"

def test_join_game(manager, session_id):
    state = manager.join_game(session_id, "user1", "Alice")
    assert state.status == "waiting"
    assert "user1" in state.players
    assert state.host_id == "user1"

def test_start_game_transitions(manager, session_id):
    manager.join_game(session_id, "user1", "Alice")
    manager.join_game(session_id, "user2", "Bob")
    
    # Only host can start
    state = manager.start_game(session_id, "user2")
    assert state.status == "waiting" # Should not start

    # Host starts
    state = manager.start_game(session_id, "user1")
    assert state.status == "setup"
    for player in state.players.values():
        assert player.player_stage == "setup"

def test_board_validation(manager):
    # Valid 5x5 board
    valid_board = [list(range(i*5 + 1, i*5 + 6)) for i in range(5)]
    assert manager._validate_board(valid_board, 5) is True

    # Invalid board (duplicates)
    invalid_board = [list(range(i*5 + 1, i*5 + 6)) for i in range(5)]
    invalid_board[0][0] = 25 # Duplicate 25, missing 1
    assert manager._validate_board(invalid_board, 5) is False

    # Valid dynamic board (3x3 for example)
    valid_3x3 = [list(range(i*3 + 1, i*3 + 4)) for i in range(3)]
    assert manager._validate_board(valid_3x3, 3) is True

def test_calculate_lines_completed(manager):
    board = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]
    ]

    # No lines
    assert manager._calculate_lines_completed(board, {1, 2, 3, 4}, 5) == 0
    
    # 1 Row
    assert manager._calculate_lines_completed(board, {1, 2, 3, 4, 5}, 5) == 1
    
    # 1 Column
    assert manager._calculate_lines_completed(board, {1, 6, 11, 16, 21}, 5) == 1
    
    # Diagonal
    assert manager._calculate_lines_completed(board, {1, 7, 13, 19, 25}, 5) == 1
    
    # Anti-Diagonal
    assert manager._calculate_lines_completed(board, {5, 9, 13, 17, 21}, 5) == 1
    
    # Intersecting row and col (counts as 2)
    assert manager._calculate_lines_completed(board, {1,2,3,4,5, 6,11,16,21}, 5) == 2

def test_auto_win_detection(manager, session_id):
    manager.join_game(session_id, "user1", "Alice")
    manager.join_game(session_id, "user2", "Bob")
    manager.start_game(session_id, "user1")
    
    board = [list(range(i*5 + 1, i*5 + 6)) for i in range(5)]
    manager.submit_board(session_id, "user1", board)
    manager.submit_board(session_id, "user2", board)
    
    # Simulate a win scenario by calling enough numbers to hit 5 lines
    # For a simple win, we just call the first 25 numbers
    manager.update_config(session_id, {"grid_size": 5})
    
    state = manager.get_session(session_id)
    assert state.status == "playing"
    
    # Call numbers to make user1 win (first row: 1,2,3,4,5)
    # Actually just call random numbers until lines >= 5
    state.current_turn_index = state.turn_order.index("user1")
    manager.call_number(session_id, "user1", 1)
    
    state.current_turn_index = state.turn_order.index("user1")
    manager.call_number(session_id, "user1", 2)
    
    state.current_turn_index = state.turn_order.index("user1")
    manager.call_number(session_id, "user1", 3)
    
    state.current_turn_index = state.turn_order.index("user1")
    manager.call_number(session_id, "user1", 4)
    
    # 5th call completes the row (5 lines)
    # wait, a single row is 1 line. We need 5 lines to win.
    # We can just call 25 numbers...
    for i in range(5, 26):
        state.current_turn_index = state.turn_order.index("user1")
        manager.call_number(session_id, "user1", i)
        if state.status == "finished":
            break
            
    # Should trigger finish
    assert state.status == "finished"
    assert state.winner == "user1"

def test_auto_win_custom_grid_size(manager, session_id):
    manager.join_game(session_id, "user1", "Alice")
    manager.join_game(session_id, "user2", "Bob")
    manager.start_game(session_id, "user1")
    
    # 6x6 grid requires 6 lines to win
    grid_size = 6
    board = [list(range(i*grid_size + 1, i*grid_size + grid_size + 1)) for i in range(grid_size)]
    
    manager.update_config(session_id, {"grid_size": grid_size})
    manager.submit_board(session_id, "user1", board)
    manager.submit_board(session_id, "user2", board)
    
    state = manager.get_session(session_id)
    assert state.status == "playing"
    
    # We need 6 lines to win in a 6x6 grid.
    # By calling the first 36 numbers, we will definitely win.
    for i in range(1, 37):
        # We need to simulate taking turns correctly
        current_turn_player = state.turn_order[state.current_turn_index]
        manager.call_number(session_id, current_turn_player, i)
        if state.status == "finished":
            break
            
    assert state.status == "finished"
    # To hit 6 lines, we would need to complete multiple rows/cols. 
    # With a simple loop, the player who calls the winning number gets the win.
    assert state.winner is not None
