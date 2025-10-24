"""
Flask ToDo List Application
A minimal REST API server that manages todos with JSON persistence
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder="static")
CORS(app)

# Path to the JSON file for persistence
TODOS_FILE = "todos.json"

# In-memory todo list
todos = []
next_id = 1


def load_todos():
    """Load todos from JSON file on startup"""
    global todos, next_id

    if os.path.exists(TODOS_FILE):
        try:
            with open(TODOS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                todos = data.get("todos", [])
                next_id = data.get("next_id", 1)
                print(f"✓ Loaded {len(todos)} todos from {TODOS_FILE}")
        except Exception as e:
            print(f"✗ Error loading todos: {e}")
            todos = []
            next_id = 1
    else:
        print(f"ℹ No existing {TODOS_FILE} found. Starting fresh.")


def save_todos():
    """Save todos to JSON file"""
    try:
        with open(TODOS_FILE, "w", encoding="utf-8") as f:
            json.dump(
                {"todos": todos, "next_id": next_id}, f, indent=2, ensure_ascii=False
            )
        print(f"✓ Saved {len(todos)} todos to {TODOS_FILE}")
    except Exception as e:
        print(f"✗ Error saving todos: {e}")


@app.route("/")
def index():
    """Serve the main HTML page"""
    return send_from_directory("static", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    """Serve static files"""
    return send_from_directory("static", path)


@app.route("/api/todos", methods=["GET"])
def get_todos():
    """Get all todos"""
    return jsonify(todos), 200


@app.route("/api/todos", methods=["POST"])
def add_todo():
    """Add a new todo"""
    global next_id

    data = request.get_json()

    # Validate required fields
    if not data or "description" not in data:
        return jsonify({"error": "Description is required"}), 400

    # Create new todo
    new_todo = {
        "id": next_id,
        "description": data["description"],
        "priority": data.get("priority", "Medium"),
        "due_date": data.get("due_date", ""),
        "completed": False,
        "created_at": datetime.now().isoformat(),
    }

    todos.append(new_todo)
    next_id += 1

    # Save to file
    save_todos()

    return jsonify(new_todo), 201


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    """Update a todo (mark complete or edit fields)"""
    data = request.get_json()

    # Find the todo
    todo = next((t for t in todos if t["id"] == todo_id), None)

    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    # Update fields if provided
    if "description" in data:
        todo["description"] = data["description"]
    if "priority" in data:
        todo["priority"] = data["priority"]
    if "due_date" in data:
        todo["due_date"] = data["due_date"]
    if "completed" in data:
        todo["completed"] = data["completed"]

    # Save to file
    save_todos()

    return jsonify(todo), 200


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    """Delete a todo"""
    global todos

    # Find and remove the todo
    todo = next((t for t in todos if t["id"] == todo_id), None)

    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    todos = [t for t in todos if t["id"] != todo_id]

    # Save to file
    save_todos()

    return jsonify({"message": "Todo deleted successfully"}), 200


if __name__ == "__main__":
    # Load existing todos on startup
    load_todos()

    print("\n" + "=" * 50)
    print("🚀 ToDo List App Starting...")
    print("=" * 50)
    print("📝 Access the app at: http://localhost:5000")
    print("=" * 50 + "\n")

    # Run the Flask app
    app.run(debug=True, host="0.0.0.0", port=5000)
