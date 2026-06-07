import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
import json


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "modux-backend"}


@pytest.mark.asyncio
async def test_websocket_connection():
    client = TestClient(app)
    # Connect to a fresh session
    with client.websocket_connect("/ws/bingo/test_session_1") as websocket:
        # Send a join_game action
        websocket.send_json(
            {"action": "join_game", "user_id": "player1", "username": "Player One"}
        )

        # We should receive another state update via broadcast
        data = websocket.receive_json()
        assert data["type"] == "state_update"
        assert "player1" in data["data"]["players"]
        assert data["data"]["players"]["player1"]["username"] == "Player One"


@pytest.mark.asyncio
async def test_concurrent_connections():
    client = TestClient(app)

    with client.websocket_connect("/ws/bingo/test_session_2") as ws1:
        with client.websocket_connect("/ws/bingo/test_session_2") as ws2:
            # Player 1 joins
            ws1.send_json(
                {"action": "join_game", "user_id": "player1", "username": "Player One"}
            )

            # Both should receive the update
            update1 = ws1.receive_json()
            update2 = ws2.receive_json()

            assert "player1" in update1["data"]["players"]
            assert "player1" in update2["data"]["players"]

            # Player 2 joins
            ws2.send_json(
                {"action": "join_game", "user_id": "player2", "username": "Player Two"}
            )

            # Both should receive the update
            update3 = ws1.receive_json()
            update4 = ws2.receive_json()

            assert "player2" in update3["data"]["players"]
            assert "player2" in update4["data"]["players"]
