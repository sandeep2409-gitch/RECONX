#!/bin/bash
# MR.CYPHER AI One-Click Launch Script for Mac & Tablet Access

MAC_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "127.0.0.1")

echo "===================================================="
echo "⚡ Starting MR.CYPHER AI (Local Network Mode)"
echo "===================================================="
echo "Mac Local IP: $MAC_IP"
echo "Tablet Link:  http://$MAC_IP:5173"
echo "===================================================="

# Kill any existing server on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start Ollama with network access if not running
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "[*] Starting Ollama server with network access..."
    OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS="*" ollama serve > /dev/null 2>&1 &
    sleep 2
fi

# Start Vite dev server on 0.0.0.0:5173
echo "[*] Launching MR.CYPHER AI Web Application..."
exec npm run dev -- --host 0.0.0.0 --port 5173
