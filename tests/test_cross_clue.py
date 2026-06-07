import pytest
from apps.cross_clue.game import CrossClueGameManager

@pytest.fixture
def manager():
    return CrossClueGameManager()

@pytest.fixture
def session_id():
    return "test_cc_session"

def test_join_game(manager, session_id):
    state = manager.join_game(session_id, "user1", "Alice")
    assert state.status == "waiting"
    assert "user1" in state.players
    assert state.players["user1"].is_ready is True  # CC players start ready
    assert state.host_id == "user1"

def test_generate_role_queue(manager):
    players = ["user1", "user2", "user3", "user4"]
    
    # Run it multiple times to ensure the rejection sampling works flawlessly
    for _ in range(50):
        queue = manager._generate_role_queue(players)
        
        # Should generate pairs for exactly the number of players
        assert len(queue) == len(players)
        
        # Verify perfect derangement (giver != guesser)
        for giver, guesser in queue:
            assert giver != guesser
            assert giver in players
            assert guesser in players
            
        # Verify everyone is giver exactly once
        givers = [pair[0] for pair in queue]
        assert set(givers) == set(players)
        assert len(givers) == len(players)
        
        # Verify everyone is guesser exactly once
        guessers = [pair[1] for pair in queue]
        assert set(guessers) == set(players)
        assert len(guessers) == len(players)

def test_generate_role_queue_two_players(manager):
    players = ["user1", "user2"]
    queue = manager._generate_role_queue(players)
    assert len(queue) == 2
    for giver, guesser in queue:
        assert giver != guesser
    
    # The only valid derangements for 2 players are (user1->user2) and (user2->user1)
    pairs = set(tuple(p) for p in queue)
    assert pairs == {("user1", "user2"), ("user2", "user1")}

def test_start_game_and_turns(manager, session_id):
    manager.join_game(session_id, "user1", "Alice")
    manager.join_game(session_id, "user2", "Bob")
    manager.join_game(session_id, "user3", "Charlie")
    
    state = manager.start_game(session_id, "user1")
    assert state.status == "setup"
    
    # Submit setup
    manager.submit_setup(session_id, "user1")
    manager.submit_setup(session_id, "user2")
    manager.submit_setup(session_id, "user3")
    
    assert state.status == "playing"
    
    # Verify a turn was popped
    assert state.active_giver_id is not None
    assert state.active_guesser_id is not None
    assert state.active_giver_id != state.active_guesser_id
    
    # Queue should have len(players) - 1 turns left
    assert len(state.role_queue) == 2
