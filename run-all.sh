#!/bin/bash

# Quick start script for Civic Issue System
# Opens 3 terminal windows to run all services

echo "🚀 Starting Civic Issue System"
echo "================================"
echo ""
echo "This will start:"
echo "  1. ML Service (Python/FastAPI) on port 8000"
echo "  2. Backend (Node.js/Express) on port 9000"
echo "  3. Frontend (React/Vite) on port 5173"
echo ""
echo "Press Ctrl+C in each terminal to stop services"
echo ""

# Check if running in VS Code terminal
if [ -n "$VSCODE_PID" ]; then
    echo "✅ Running in VS Code"
    echo "📝 Open 3 separate terminals and run:"
    echo ""
    echo "Terminal 1 (ML Service):"
    echo "  cd ml-service && source venv/bin/activate && python train.py && cd app && python main.py"
    echo ""
    echo "Terminal 2 (Backend):"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Terminal 3 (Frontend):"
    echo "  cd frontend && npm run dev"
    echo ""
else
    # Try to open in separate terminal windows (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Opening services in separate Terminal windows..."
        
        # ML Service
        osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/ml-service && source venv/bin/activate && python train.py && cd app && python main.py"'
        
        sleep 2
        
        # Backend
        osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"'
        
        sleep 2
        
        # Frontend
        osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"'
        
        echo "✅ All services started in separate terminals!"
    else
        echo "⚠️  Please open 3 terminals manually and run the commands above"
    fi
fi
