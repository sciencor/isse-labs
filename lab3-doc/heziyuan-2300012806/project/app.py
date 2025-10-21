from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_FILE = os.path.join(BASE_DIR, "todo.db")
LOG_FILE = os.path.join(BASE_DIR, "tasks.json")


def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT,
                    level TEXT,
                    ddl TEXT,
                    completed INTEGER DEFAULT 0
                )''')
    conn.commit()
    
    # Ensure 'ddl' column exists (for older DBs that lack the column)
    try:
        c.execute("PRAGMA table_info(todos)")
        cols = [r[1] for r in c.fetchall()]
        if 'ddl' not in cols:
            c.execute("ALTER TABLE todos ADD COLUMN ddl TEXT")
            conn.commit()
    except Exception:
        # ignore migration errors
        pass
    
    # If tasks.json doesn't exist, export current todos to it for initial sync
    if not os.path.exists(LOG_FILE):
        try:
            c.execute("SELECT id, title, category, level, ddl, completed FROM todos")
            rows = c.fetchall()
            tasks = [
                {"id": r[0], "title": r[1], "category": r[2], "level": r[3], "ddl": r[4], "completed": bool(r[5])}
                for r in rows
            ]
            save_tasks(tasks)
        except Exception:
            pass
    
    conn.close()


def load_task_log():
    """Load tasks from LOG_FILE.

    This function is resilient:
    - If the file contains a simple list of task dicts, return it.
    - If the file contains an append-only action log (entries with 'action' and 'task'),
      replay the log to produce the current task list (handles 'add' and 'delete').
    Returns an empty list on error or if the file doesn't exist.
    """
    if not os.path.exists(LOG_FILE):
        return []
    try:
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        return []

    if not isinstance(data, list):
        return []

    if not data:
        return []

    # detect action-log format: list of entries with 'action' and 'task'
    first = data[0]
    if isinstance(first, dict) and 'action' in first and 'task' in first:
        tasks_by_id = {}
        for entry in data:
            action = entry.get('action')
            task = entry.get('task')
            if not isinstance(task, dict):
                continue
            tid = task.get('id')
            if tid is None:
                continue
            if action == 'add' or action == 'update':
                tasks_by_id[tid] = task
            elif action == 'delete':
                tasks_by_id.pop(tid, None)
        return list(tasks_by_id.values())

    # otherwise assume it's already a list of task dicts
    return data


def save_tasks(tasks):
    """Save the given list of task dicts to LOG_FILE (overwrites)."""
    try:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
    except Exception:
        # best-effort: don't raise to the client
        pass


def append_task_log(action, task):
    """Append an action record to the JSON log file.

    action: str e.g. 'add' or 'delete'
    task: dict with task details to record
    """
    # Legacy helper retained for backwards compatibility but implemented
    # by saving the current task list (i.e. treating the JSON file as task store).
    # For an 'add' action we will append the task; for 'delete' we remove it.
    tasks = load_task_log()
    if action == 'add':
        tasks.append(task)
    elif action == 'delete':
        tasks = [t for t in tasks if t.get('id') != task.get('id')]
    else:
        # treat other actions as upsert
        tasks = [t for t in tasks if t.get('id') != task.get('id')]
        tasks.append(task)
    try:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


@app.route("/todos", methods=["GET"])
def get_todos():
    category = request.args.get("category")
    level = request.args.get("level")

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()


    query = "SELECT id, title, category, level, ddl, completed FROM todos WHERE 1=1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if level:
        query += " AND level = ?"
        params.append(level)

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    todos = [
        {"id": r[0], "title": r[1], "category": r[2], "level": r[3], "ddl": r[4], "completed": bool(r[5])}
        for r in rows
    ]
    return jsonify(todos)


@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    title = data.get("title")
    category = data.get("category", "未分类")
    level = data.get("level", "中")
    ddl = data.get("ddl", "")

    if not title:
        return jsonify({"error": "title is required"}), 400

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO todos (title, category, level, ddl) VALUES (?, ?, ?, ?)", (title, category, level, ddl))
    conn.commit()
    # get the id of the inserted row
    todo_id = c.lastrowid
    conn.close()

    # record to tasks.json (best-effort)
    try:
        append_task_log('add', { 'id': todo_id, 'title': title, 'category': category, 'level': level, 'ddl': ddl })
    except Exception:
        pass

    return jsonify({"message": "todo added successfully", "id": todo_id}), 201


@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    # read the todo before deleting so we can log it
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, title, category, level, ddl, completed FROM todos WHERE id=?", (todo_id,))
    row = c.fetchone()
    c.execute("DELETE FROM todos WHERE id=?", (todo_id,))
    conn.commit()
    conn.close()

    if row:
        task = { 'id': row[0], 'title': row[1], 'category': row[2], 'level': row[3], 'ddl': row[4], 'completed': bool(row[5]) }
        try:
            # load current tasks, remove the one with this id, then save
            tasks = load_task_log()
            tasks = [t for t in tasks if t.get('id') != task.get('id')]
            save_tasks(tasks)
        except Exception:
            pass

    return jsonify({"message": "todo deleted"})


@app.route("/todos/<int:todo_id>/complete", methods=["PUT"])
def complete_todo(todo_id):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("UPDATE todos SET completed=1 WHERE id=?", (todo_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "todo marked as complete"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
