#!/bin/bash

echo "========================================"
echo "       Starting Modux Server"
echo "========================================"
echo

# Check if running in correct directory
if [ ! -f "main.py" ]; then
    echo "ERROR: Please run this script from the Modux root directory"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Clear all previous log files safely
echo "Clearing previous log files..."
> logs/backend.log
> logs/frontend.log  
> logs/tunnel.log
echo "Log files cleared."
echo
echo "[1/3] Starting Backend Server..."
# Start backend in background
source venv/bin/activate && python main.py > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo
echo "[2/3] Starting Frontend Development Server..."
# Start frontend in background
cd frontend && npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for backend & frontend to start
echo
echo "Waiting for backend and frontend to start..."
sleep 1

# Start cloudflared and capture URL
echo
echo "[3/3] Starting Cloudflare Tunnel..."
cloudflared tunnel --url http://localhost:8000 > logs/tunnel.log 2>&1 &
CLOUDFLARED_PID=$!

# Wait for tunnel URL and extract it
echo "Waiting for tunnel URL..."
for i in {1..30}; do
    TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.trycloudflare\.com' logs/tunnel.log 2>/dev/null | head -1)
    if [ ! -z "$TUNNEL_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
    echo "WARNING: Could not extract tunnel URL automatically"
    echo "Please check the cloudflared output above for the URL"
else
    echo
    echo "========================================"
    echo "       Cloudflare Tunnel Ready!"
    echo "========================================"
    echo "Tunnel URL: $TUNNEL_URL"
    echo
    
    # Copy to clipboard (requires xclip or xsel)
    if command -v xclip &> /dev/null; then
        echo "$TUNNEL_URL" | xclip -selection clipboard
        echo "[SUCCESS] Tunnel URL copied to clipboard using xclip!"
    fi
fi

echo
echo "Press Ctrl+C to stop all services..."
echo

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $CLOUDFLARED_PID 2>/dev/null
    pkill -f "python main.py" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "cloudflared" 2>/dev/null
    echo "All services stopped. Goodbye!"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running
while true; do
    sleep 1
done
