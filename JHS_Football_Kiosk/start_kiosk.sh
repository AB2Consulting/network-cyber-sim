#!/bin/bash
# JHS Football Kiosk Startup Script
# This starts a local web server and opens Chromium in kiosk mode.
# Using a local server avoids Chromium's file:// security restrictions
# that prevent images and scripts from loading properly.

KIOSK_DIR="/home/jhs/JHS_Football_Kiosk"
PORT=8080

# Kill any leftover Chromium or Python server from a previous session
pkill -f "python3 -m http.server" 2>/dev/null
pkill chromium 2>/dev/null

# Wait a moment to ensure clean state
sleep 2

# Start a local Python HTTP server in the background
cd "$KIOSK_DIR"
python3 -m http.server $PORT &

# Wait for the server to be ready
sleep 3

# Launch Chromium in kiosk mode pointing to localhost
chromium-browser \
  --kiosk \
  --start-fullscreen \
  --disable-restore-session-state \
  --disable-infobars \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  --disable-background-timer-throttling \
  http://localhost:$PORT/index.html
