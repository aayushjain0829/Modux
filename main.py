import socket
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Set, Optional

app = FastAPI()

# Word bank for Cross Clue game
WORD_BANK = [
    "Apple", "Bear", "Cloud", "Dream", "Eagle", "Fire", "Ghost", "House",
    "Ice", "Jungle", "Key", "Light", "Moon", "Night", "Ocean", "Piano",
    "Queen", "Rain", "Star", "Tree", "Umbrella", "Volcano", "Water", "X-ray",
    "Yellow", "Zebra", "Bridge", "Castle", "Dragon", "Elephant", "Flower", "Garden",
    "Hammer", "Island", "Jewel", "Kite", "Lemon", "Mountain", "Notebook", "Orange",
    "Pencil", "Quilt", "Robot", "Snake", "Tiger", "Urn", "Violin", "Window",
    "Yacht", "Zoo", "Anchor", "Balloon", "Candle", "Diamond", "Engine", "Feather",
    "Guitar", "Helmet", "Igloo", "Jacket", "Kangaroo", "Lamp", "Mirror", "Needle",
    "Owl", "Pearl", "Question", "Rocket", "Sword", "Train", "Uniform", "Video",
    "Whale", "Yogurt", "Zero", "Ant", "Bee", "Cat", "Dog", "Egg", "Fish",
    "Goat", "Hen", "Ink", "Jar", "Kite", "Leaf", "Milk", "Nest",
    "Owl", "Pen", "Quill", "Rat", "Sun", "Tea", "Urn", "Vase",
    "Wolf", "Yak", "Zinc"
]

# Add CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GameStateManager:
    def __init__(self):
        # Store game states: {session_id: {app_name: game_state}}
        self.game_states: Dict[str, Dict[str, Dict]] = {}

    def init_game(self, session_id: str, app_name: str) -> Dict:
        """Initialize a new game state for a session"""
        if session_id not in self.game_states:
            self.game_states[session_id] = {}
        
        # Select 8 unique words from word bank
        selected_words = random.sample(WORD_BANK, 8)
        row_words = selected_words[:4]  # For rows A, B, C, D
        col_words = selected_words[4:]  # For columns 1, 2, 3, 4
        
        # Generate all 16 coordinates
        rows = ['A', 'B', 'C', 'D']
        cols = ['1', '2', '3', '4']
        deck = [f"{row}{col}" for row in rows for col in cols]
        random.shuffle(deck)
        
        # Initialize grid state
        grid_state = {coord: 'empty' for coord in deck}
        
        game_state = {
            'row_words': row_words,
            'col_words': col_words,
            'deck': deck,
            'grid_state': grid_state,
            'active_turn': None  # {user_id, secret_coordinate, clue}
        }
        
        self.game_states[session_id][app_name] = game_state
        return game_state

    def get_game_state(self, session_id: str, app_name: str) -> Optional[Dict]:
        """Get the current game state for a session"""
        if session_id in self.game_states and app_name in self.game_states[session_id]:
            return self.game_states[session_id][app_name]
        return None

    def draw_card(self, session_id: str, app_name: str, user_id: str) -> Optional[str]:
        """Draw a card from the deck for a user"""
        game_state = self.get_game_state(session_id, app_name)
        if not game_state or not game_state['deck']:
            return None
        
        coordinate = game_state['deck'].pop()
        game_state['active_turn'] = {
            'user_id': user_id,
            'secret_coordinate': coordinate,
            'clue': None
        }
        return coordinate

    def submit_clue(self, session_id: str, app_name: str, clue: str) -> bool:
        """Submit a clue from the active player"""
        game_state = self.get_game_state(session_id, app_name)
        if not game_state or not game_state['active_turn']:
            return False
        
        game_state['active_turn']['clue'] = clue
        return True

    def guess_coordinate(self, session_id: str, app_name: str, guess: str) -> Optional[Dict]:
        """Process a coordinate guess and return result"""
        game_state = self.get_game_state(session_id, app_name)
        if not game_state or not game_state['active_turn']:
            return None
        
        secret = game_state['active_turn']['secret_coordinate']
        is_correct = guess == secret
        
        # Update grid state
        game_state['grid_state'][secret] = 'success' if is_correct else 'fail'
        
        result = {
            'guess': guess,
            'secret': secret,
            'is_correct': is_correct,
            'grid_state': game_state['grid_state']
        }
        
        # Clear active turn
        game_state['active_turn'] = None
        
        return result

    def get_public_state(self, session_id: str, app_name: str) -> Optional[Dict]:
        """Get the public game state (without secret information)"""
        game_state = self.get_game_state(session_id, app_name)
        if not game_state:
            return None
        
        return {
            'row_words': game_state['row_words'],
            'col_words': game_state['col_words'],
            'grid_state': game_state['grid_state'],
            'active_clue': game_state['active_turn']['clue'] if game_state['active_turn'] else None,
            'deck_remaining': len(game_state['deck'])
        }


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
game_manager = GameStateManager()


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
    
    # Send current game state if it exists
    if app_name == "cross-clue":
        public_state = game_manager.get_public_state(session_id, app_name)
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
                
                if app_name == "cross-clue":
                    if action == "init_game":
                        game_state = game_manager.init_game(session_id, app_name)
                        public_state = game_manager.get_public_state(session_id, app_name)
                        await manager.broadcast_state(app_name, session_id, public_state)
                        print(f"🎮 Game initialized for session {session_id}")
                    
                    elif action == "draw_card":
                        coordinate = game_manager.draw_card(session_id, app_name, user_id)
                        if coordinate:
                            await manager.send_personal_json({
                                "type": "card_drawn",
                                "data": {"coordinate": coordinate}
                            }, websocket)
                            # Broadcast updated state
                            public_state = game_manager.get_public_state(session_id, app_name)
                            await manager.broadcast_state(app_name, session_id, public_state)
                            print(f"🃏 Card drawn for user {user_id}: {coordinate}")
                    
                    elif action == "submit_clue":
                        clue = message.get("clue")
                        if clue and game_manager.submit_clue(session_id, app_name, clue):
                            public_state = game_manager.get_public_state(session_id, app_name)
                            await manager.broadcast_state(app_name, session_id, public_state)
                            print(f"💬 Clue submitted: {clue}")
                    
                    elif action == "guess_coordinate":
                        guess = message.get("guess")
                        if guess:
                            result = game_manager.guess_coordinate(session_id, app_name, guess)
                            if result:
                                await manager.broadcast(json.dumps({
                                    "type": "guess_result",
                                    "data": result
                                }), app_name, session_id)
                                # Broadcast updated state
                                public_state = game_manager.get_public_state(session_id, app_name)
                                await manager.broadcast_state(app_name, session_id, public_state)
                                print(f"🎯 Guess: {guess}, Correct: {result['is_correct']}")
                    
                    elif action == "get_state":
                        public_state = game_manager.get_public_state(session_id, app_name)
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
