import socket
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from typing import Dict, List, Set

app = FastAPI()


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


# Serve static files from frontend build
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")


@app.websocket("/ws/{app_name}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, app_name: str, session_id: str):
    await manager.connect(websocket, app_name, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the received message to all users in the same session
            await manager.broadcast(data, app_name, session_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, app_name, session_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
