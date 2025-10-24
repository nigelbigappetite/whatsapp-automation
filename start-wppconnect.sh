#!/bin/bash

echo "🚀 Starting WPPConnect for WhatsApp Automation"
echo "=============================================="
echo ""

# Check if WPPConnect is already running
if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  Port 8080 is already in use. Stopping existing process..."
    lsof -ti :8080 | xargs kill -9
    sleep 2
fi

echo "📱 Starting WPPConnect server..."
echo "🌐 Web interface will be available at: http://localhost:8080"
echo "🔑 Secret: wefixico_secret_2024"
echo ""

# Start WPPConnect
node wpp-server.mjs
