import socket
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
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

    async def connect(self, websocket: WebSocket, app_name: str, session_id: str):
        await websocket.accept()
        if session_id not in self.sessions:
            self.sessions[session_id] = {}
        if app_name not in self.sessions[session_id]:
            self.sessions[session_id][app_name] = set()
        self.sessions[session_id][app_name].add(websocket)

    def disconnect(self, websocket: WebSocket, app_name: str, session_id: str):
        if session_id in self.sessions and app_name in self.sessions[session_id]:
            self.sessions[session_id][app_name].discard(websocket)
            # Clean up app_name if no connections left
            if not self.sessions[session_id][app_name]:
                del self.sessions[session_id][app_name]
            # Clean up session_id if no apps left
            if not self.sessions[session_id]:
                del self.sessions[session_id]

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
    print(f"🔗 New WebSocket connection attempt: app_name={app_name}, session_id={session_id}")
    await manager.connect(websocket, app_name, session_id)
    print(f"✅ WebSocket connected: app_name={app_name}, session_id={session_id}")
    
    # Dynamically load app-specific game manager
    game_manager = None
    if app_name == "cross-clue":
        from apps.cross_clue import GameStateManager
        game_manager = GameStateManager()
        
        # Send current game state if it exists
        public_state = game_manager.get_public_state(session_id)
        if public_state:
            await manager.send_personal_json({"type": "state_update", "data": public_state}, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 Message received from {session_id}: {data}")
            
            try:
                message = json.loads(data)
                action = message.get("action")
                user_id = message.get("user_id", "anonymous")
                
                if app_name == "cross-clue" and game_manager:
                    if action == "init_game":
                        game_state = game_manager.init_game(session_id)
                        public_state = game_manager.get_public_state(session_id)
                        await manager.broadcast_state(app_name, session_id, public_state)
                        print(f"🎮 Game initialized for session {session_id}")
                    
                    elif action == "draw_card":
                        coordinate = game_manager.draw_card(session_id, user_id)
                        if coordinate:
                            await manager.send_personal_json({
                                "type": "card_drawn",
                                "data": {"coordinate": coordinate}
                            }, websocket)
                            # Broadcast updated state
                            public_state = game_manager.get_public_state(session_id)
                            await manager.broadcast_state(app_name, session_id, public_state)
                            print(f"🃏 Card drawn for user {user_id}: {coordinate}")
                    
                    elif action == "submit_clue":
                        clue = message.get("clue")
                        if clue and game_manager.submit_clue(session_id, clue):
                            public_state = game_manager.get_public_state(session_id)
                            await manager.broadcast_state(app_name, session_id, public_state)
                            print(f"💬 Clue submitted: {clue}")
                    
                    elif action == "guess_coordinate":
                        guess = message.get("guess")
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
                                print(f"🎯 Guess: {guess}, Correct: {result['is_correct']}")
                    
                    elif action == "get_state":
                        public_state = game_manager.get_public_state(session_id)
                        if public_state:
                            await manager.send_personal_json({"type": "state_update", "data": public_state}, websocket)
                
            except json.JSONDecodeError:
                print(f"⚠️ Invalid JSON received: {data}")
            except Exception as e:
                print(f"⚠️ Error processing message: {e}")
                
    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected: app_name={app_name}, session_id={session_id}")
        manager.disconnect(websocket, app_name, session_id)
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
        manager.disconnect(websocket, app_name, session_id)


# Serve static files from frontend build (must be after WebSocket routes)
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
