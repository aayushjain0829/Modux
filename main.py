import socket
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, List, Set, Optional

app = FastAPI()

# Add CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        # Dictionary to store sessions: {session_id: {app_name: set_of_websockets}}
        self.sessions: Dict[str, Dict[str, Set[WebSocket]]] = {}
        # Dictionary to store user_id to websocket mapping: {session_id: {user_id: websocket}}
        self.user_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, app_name: str, session_id: str):
        await websocket.accept()
        if session_id not in self.sessions:
            self.sessions[session_id] = {}
        if app_name not in self.sessions[session_id]:
            self.sessions[session_id][app_name] = set()
        self.sessions[session_id][app_name].add(websocket)
        
        # Initialize user connections for this session
        if session_id not in self.user_connections:
            self.user_connections[session_id] = {}

    def register_user(self, websocket: WebSocket, session_id: str, user_id: str):
        """Register a user_id to websocket mapping"""
        if session_id in self.user_connections:
            self.user_connections[session_id][user_id] = websocket

    def disconnect(self, websocket: WebSocket, app_name: str, session_id: str):
        if session_id in self.sessions and app_name in self.sessions[session_id]:
            self.sessions[session_id][app_name].discard(websocket)
            # Clean up app_name if no connections left
            if not self.sessions[session_id][app_name]:
                del self.sessions[session_id][app_name]
            # Clean up session_id if no apps left
            if not self.sessions[session_id]:
                del self.sessions[session_id]
        
        # Remove user mapping
        if session_id in self.user_connections:
            # Find and remove the user_id that maps to this websocket
            to_remove = [uid for uid, ws in self.user_connections[session_id].items() if ws == websocket]
            for uid in to_remove:
                del self.user_connections[session_id][uid]
            if not self.user_connections[session_id]:
                del self.user_connections[session_id]

    async def broadcast(self, message: str, app_name: str, session_id: str):
        if session_id in self.sessions and app_name in self.sessions[session_id]:
            for connection in self.sessions[session_id][app_name]:
                try:
                    await connection.send_text(message)
                except Exception:
                    # Remove dead connections
                    self.disconnect(connection, app_name, session_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception:
            pass

    async def send_personal_message_by_user_id(self, data: Dict, session_id: str, user_id: str):
        """Send JSON data to a specific user by user_id"""
        if session_id in self.user_connections and user_id in self.user_connections[session_id]:
            websocket = self.user_connections[session_id][user_id]
            try:
                await websocket.send_text(json.dumps(data))
                return True
            except Exception:
                return False
        return False

    async def broadcast_state(self, app_name: str, session_id: str, state: Dict):
        """Broadcast game state to all users in a session"""
        message = json.dumps({"type": "state_update", "data": state})
        await self.broadcast(message, app_name, session_id)

    async def send_personal_json(self, data: Dict, websocket: WebSocket):
        """Send JSON data to a specific user"""
        try:
            await websocket.send_text(json.dumps(data))
        except Exception:
            pass


manager = ConnectionManager()

# Singleton game managers for each app (persistent across connections)
_game_managers = {}

def get_game_manager(app_name: str):
    """Get or create a singleton game manager for an app"""
    if app_name not in _game_managers:
        if app_name == "cross-clue":
            from apps.cross_clue import GameStateManager
            _game_managers[app_name] = GameStateManager()
        elif app_name == "bingo":
            from apps.bingo.game import BingoGameManager
            _game_managers[app_name] = BingoGameManager()
    return _game_managers.get(app_name)


def get_local_ip():
    try:
        # Create a socket to connect to an external server
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a non-routable address (doesn't actually send data)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"


@app.on_event("startup")
async def startup_event():
    local_ip = get_local_ip()
    print("\n" + "=" * 60)
    print(f"🚀 Modux server is running!")
    print(f"📱 Access from mobile: http://{local_ip}:8000")
    print(f"💻 Local access:       http://127.0.0.1:8000")
    print("=" * 60 + "\n")


@app.websocket("/ws/{app_name}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, app_name: str, session_id: str):
    await manager.connect(websocket, app_name, session_id)
    
    # Get singleton game manager for this app
    game_manager = get_game_manager(app_name)
    
    # Send current game state if it exists
    if game_manager:
        try:
            public_state = game_manager.get_public_state(session_id)
            if public_state:
                await manager.send_personal_json({"type": "state_update", "data": public_state}, websocket)
        except Exception:
            # If get_public_state fails, continue without sending initial state
            pass
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                action = message.get("action")
                user_id = message.get("user_id", "anonymous")
                
                # Register user_id to websocket mapping
                manager.register_user(websocket, session_id, user_id)
                
                if app_name == "cross-clue" and game_manager:
                    if action == "init_game":
                        game_state = game_manager.init_game(session_id)
                        public_state = game_manager.get_public_state(session_id)
                        await manager.broadcast_state(app_name, session_id, public_state)
                    
                    elif action == "draw_card":
                        coordinate = game_manager.draw_card(session_id, user_id)
                        if coordinate:
                            # Send private secret card only to the requesting user
                            await manager.send_personal_message_by_user_id({
                                "type": "secret_update",
                                "secret_card": coordinate
                            }, session_id, user_id)
                            # Broadcast public state update to everyone
                            public_state = game_manager.get_public_state(session_id)
                            await manager.broadcast_state(app_name, session_id, public_state)
                    
                    elif action == "submit_clue":
                        clue = message.get("clue")
                        if clue and game_manager.submit_clue(session_id, clue):
                            public_state = game_manager.get_public_state(session_id)
                            await manager.broadcast_state(app_name, session_id, public_state)
                    
                    elif action == "guess_coordinate":
                        # Support both "guess" and "coordinate" keys
                        guess = message.get("guess") or message.get("coordinate")
                        if guess:
                            result = game_manager.guess_coordinate(session_id, guess)
                            if result:
                                await manager.broadcast(json.dumps({
                                    "type": "guess_result",
                                    "data": result
                                }), app_name, session_id)
                                # Broadcast updated state
                                public_state = game_manager.get_public_state(session_id)
                                await manager.broadcast_state(app_name, session_id, public_state)
                    
                    elif action == "get_state":
                        public_state = game_manager.get_public_state(session_id)
                        if public_state:
                            await manager.send_personal_json({"type": "state_update", "data": public_state}, websocket)
                
                elif app_name == "bingo" and game_manager:
                    if action == "join_game":
                        username = message.get("username", f"Player_{user_id[:4]}")
                        game_state = game_manager.join_game(session_id, user_id, username)
                        await manager.broadcast_state(app_name, session_id, game_state.model_dump())
                    
                    elif action == "submit_board":
                        board = message.get("board")
                        if board:
                            game_state = game_manager.submit_board(session_id, user_id, board)
                            await manager.broadcast_state(app_name, session_id, game_state.model_dump())
                    
                    elif action == "call_number":
                        number = message.get("number")
                        if number is not None:
                            game_state = game_manager.call_number(session_id, user_id, number)
                            await manager.broadcast_state(app_name, session_id, game_state.model_dump())
                    
                    elif action == "get_state":
                        game_state = game_manager.get_session(session_id)
                        await manager.send_personal_json({"type": "state_update", "data": game_state.model_dump()}, websocket)
                
            except json.JSONDecodeError:
                pass
            except Exception:
                pass
                
    except WebSocketDisconnect:
        # Handle player disconnect - remove from game state and advance turn if needed
        if game_manager and app_name == "bingo":
            game_state = game_manager.get_session(session_id)
            
            # Remove player from game state
            if user_id in game_state.players:
                del game_state.players[user_id]
            
            # Remove from turn order
            if user_id in game_state.turn_order:
                player_index = game_state.turn_order.index(user_id)
                game_state.turn_order.remove(user_id)
                
                # If it was their turn, advance to next player
                if player_index == game_state.current_turn_index and game_state.turn_order:
                    game_state.current_turn_index = game_state.current_turn_index % len(game_state.turn_order)
            
            # Broadcast updated state to remaining players
            await manager.broadcast_state(app_name, session_id, game_state.model_dump())
        
        manager.disconnect(websocket, app_name, session_id)
    except Exception:
        manager.disconnect(websocket, app_name, session_id)


# Serve static files from frontend build (must be after WebSocket routes)
# Use a more specific path to avoid intercepting WebSocket connections
app.mount("/static", StaticFiles(directory="frontend/dist", html=True), name="static")

# Also mount at root for SPA routing, but with a check to avoid WebSocket interception
@app.get("/{path:path}")
async def serve_spa(path: str):
    return FileResponse(f"frontend/dist/{path}" if path else "frontend/dist/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
