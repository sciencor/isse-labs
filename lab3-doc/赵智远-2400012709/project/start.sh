#!/bin/bash

# ToDo App Startup Script
# This script checks for dependencies and starts the Flask server

echo "======================================"
echo "🚀 ToDo App Startup Script"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if Flask is installed
if ! python3 -c "import flask" &> /dev/null; then
    echo "⚠️  Flask not found. Installing dependencies..."
    pip install flask flask-cors
else
    echo "✓ Flask is installed"
fi

# Check if flask-cors is installed
if ! python3 -c "import flask_cors" &> /dev/null; then
    echo "⚠️  Flask-CORS not found. Installing..."
    pip install flask-cors
else
    echo "✓ Flask-CORS is installed"
fi

echo ""
echo "======================================"
echo "🎉 Starting ToDo App..."
echo "======================================"
echo ""

# Start the Flask app
python3 app.py
