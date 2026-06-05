import socket
import json
import logging
import traceback
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, List, Set, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://aayushjain0829.github.io").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
            to_remove = [uid for uid, ws in self.user_connections[session_id].items() if ws == websocket]
            for uid in to_remove:
                del self.user_connections[session_id][uid]
            if not self.user_connections[session_id]:
                del self.user_connections[session_id]

    async def broadcast(self, message: str, app_name: str, session_id: str):
        if session_id in self.sessions and app_name in self.sessions[session_id]:
            connections = list(self.sessions[session_id][app_name])
            for connection in connections:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting message: {e}")
                    self.disconnect(connection, app_name, session_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def send_personal_message_by_user_id(self, data: Dict, session_id: str, user_id: str):
        if session_id in self.user_connections and user_id in self.user_connections[session_id]:
            websocket = self.user_connections[session_id][user_id]
            try:
                await websocket.send_text(json.dumps(data))
                return True
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                return False
        return False

    async def broadcast_state(self, app_name: str, session_id: str, state: Dict):
        message = json.dumps({"type": "state_update", "data": state})
        await self.broadcast(message, app_name, session_id)

    async def send_personal_json(self, data: Dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(data))
        except Exception as e:
            logger.error(f"Error sending personal JSON: {e}")


manager = ConnectionManager()

# Singleton game managers for each app
_game_managers = {}

def get_game_manager(app_name: str):
    if app_name not in _game_managers:
        if app_name == "cross-clue":
            from apps.cross_clue.game import CrossClueGameManager
            _game_managers[app_name] = CrossClueGameManager()
        elif app_name == "bingo":
            from apps.bingo.game import BingoGameManager
            _game_managers[app_name] = BingoGameManager()
    return _game_managers.get(app_name)


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
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
    
    game_manager = get_game_manager(app_name)
    user_id = None
    
    if game_manager:
        try:
            game_state = game_manager.get_session(session_id)
            if game_state and getattr(game_state, 'players', None):
                await manager.send_personal_json({"type": "state_update", "data": game_state.model_dump()}, websocket)
        except Exception as e:
            logger.error(f"Error sending initial state: {e}")
    
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                action = message.get("action")
                user_id = message.get("user_id", "anonymous")
                
                manager.register_user(websocket, session_id, user_id)
                
                if game_manager and action:
                    updated_state, broadcast_msg, personal_msg = game_manager.handle_action(
                        session_id, user_id, action, message
                    )
                    
                    if broadcast_msg:
                        await manager.broadcast(json.dumps(broadcast_msg), app_name, session_id)
                        
                    if personal_msg:
                        if "user_id" in personal_msg:
                            # if we want to send to specific user
                            await manager.send_personal_message_by_user_id(personal_msg, session_id, personal_msg["user_id"])
                        else:
                            await manager.send_personal_json(personal_msg, websocket)
                    
                    if updated_state:
                        await manager.broadcast_state(app_name, session_id, updated_state.model_dump())
                        
                    if action == "leave_game":
                        manager.disconnect(websocket, app_name, session_id)
                        
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
            except Exception as e:
                logger.error(f"Error processing message: {e}\n{traceback.format_exc()}")
                
    except WebSocketDisconnect:
        if game_manager and user_id:
            try:
                updated_state = game_manager.remove_player(session_id, user_id)
                if updated_state:
                    await manager.broadcast_state(app_name, session_id, updated_state.model_dump())
            except Exception as e:
                logger.error(f"Error during disconnect cleanup: {e}")
        
        manager.disconnect(websocket, app_name, session_id)
    except Exception as e:
        logger.error(f"Unexpected websocket error: {e}")
        manager.disconnect(websocket, app_name, session_id)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "modux-backend"}

@app.get("/")
async def root():
    return {"message": "Modux Backend API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
