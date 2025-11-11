#!/bin/bash

echo "🚀 Starting Civic Issue ML Service"
echo "=================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check if models exist
if [ ! -d "models" ] || [ ! -f "models/category_model.pkl" ]; then
    echo "🤖 Training models..."
    python train.py
fi

# Start server
echo "✅ Starting ML service on port 8000..."
cd app && python main.py
