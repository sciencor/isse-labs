"""Flask backend for a simple TodoList application."""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_FILE = DATA_DIR / "tasks.json"

# In-memory storage for tasks populated from persistent JSON.
tasks: List[Dict] = []
next_id: int = 1

VALID_CATEGORIES = {"学习", "工作", "生活"}
VALID_PRIORITIES = {"高", "中", "低"}


def format_response(status: str, data: Optional[List[Dict]] = None, message: str = ""):
    """Builds a standardized JSON response envelope."""
    payload = {"status": status, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload)


def ensure_data_dir():
    """Ensures the data directory exists for persistent storage."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_tasks_from_file() -> List[Dict]:
    """Loads tasks from the JSON file if it exists."""
    ensure_data_dir()
    if not DATA_FILE.exists():
        return []
    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            content = json.load(file)
            if isinstance(content, dict):
                return content.get("tasks", [])
            if isinstance(content, list):
                return content
    except json.JSONDecodeError:
        return []
    return []


def save_tasks_to_file() -> None:
    """Persists the in-memory task list to the JSON file."""
    ensure_data_dir()
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump({"tasks": tasks}, file, ensure_ascii=False, indent=2)


def normalize_due_date(raw_due_date: str) -> str:
    """Normalizes incoming due date strings to ISO format."""
    try:
        due_dt = datetime.fromisoformat(raw_due_date.strip())
    except ValueError as exc:  # Provide clearer error message on invalid format.
        raise ValueError(
            "任务截止时间格式无效，应为 YYYY-MM-DDTHH:MM 或 YYYY-MM-DDTHH:MM:SS"
        ) from exc
    return due_dt.isoformat(timespec="seconds")


def validate_task_payload(payload: Dict, partial: bool = False) -> Optional[str]:
    """Validates task payloads, supporting both full and partial updates."""
    if not partial:
        title = payload.get("title", "").strip()
        category = payload.get("category")
        priority = payload.get("priority")
        due_date = payload.get("due_date")

        if not title:
            return "任务标题不能为空"
        if category not in VALID_CATEGORIES:
            return "任务分类无效"
        if priority not in VALID_PRIORITIES:
            return "任务优先级无效"
        if not due_date:
            return "任务截止时间不能为空"
    else:
        if "title" in payload and not payload["title"].strip():
            return "任务标题不能为空"
        if "category" in payload and payload["category"] not in VALID_CATEGORIES:
            return "任务分类无效"
        if "priority" in payload and payload["priority"] not in VALID_PRIORITIES:
            return "任务优先级无效"
    if "due_date" in payload and payload.get("due_date"):
        try:
            payload["due_date"] = normalize_due_date(payload["due_date"])
        except ValueError as error:
            return str(error)
    return None


def initialize_store():
    """Initializes in-memory tasks from persistent storage and updates next_id."""
    global tasks, next_id
    tasks = load_tasks_from_file()
    for task in tasks:
        task.setdefault("completed", False)
        if task.get("due_date"):
            try:
                task["due_date"] = normalize_due_date(task["due_date"])
            except ValueError:
                task["due_date"] = datetime.now().isoformat(timespec="seconds")
        else:
            task["due_date"] = datetime.now().isoformat(timespec="seconds")
    next_id = (max((task.get("id", 0) for task in tasks), default=0) + 1) or 1


initialize_store()


@app.route("/tasks", methods=["GET"])
def get_tasks():
    """Returns the list of tasks, supporting optional category, priority, and keyword filters."""
    category = request.args.get("category")
    priority = request.args.get("priority")
    keyword = request.args.get("search", "").strip().lower()

    filtered_tasks = tasks
    if category:
        filtered_tasks = [
            task for task in filtered_tasks if task["category"] == category
        ]
    if priority:
        filtered_tasks = [
            task for task in filtered_tasks if task["priority"] == priority
        ]
    if keyword:
        filtered_tasks = [
            task for task in filtered_tasks if keyword in task.get("title", "").lower()
        ]

    return format_response("success", filtered_tasks, "获取任务列表成功")


@app.route("/tasks", methods=["POST"])
def add_task():
    """Adds a new task to the in-memory store."""
    global next_id
    payload = request.get_json(silent=True) or {}
    error = validate_task_payload(payload)
    if error:
        return format_response("error", message=error), 400

    task = {
        "id": next_id,
        "title": payload["title"].strip(),
        "category": payload["category"],
        "priority": payload["priority"],
        "completed": False,
        "due_date": payload["due_date"],
    }
    tasks.append(task)
    next_id += 1
    save_tasks_to_file()

    return format_response("success", tasks, "新增任务成功"), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id: int):
    """Updates fields of a given task based on payload content."""
    payload = request.get_json(silent=True) or {}
    if not payload:
        return format_response("error", message="请求体不能为空"), 400

    error = validate_task_payload(payload, partial=True)
    if error:
        return format_response("error", message=error), 400

    for task in tasks:
        if task["id"] == task_id:
            for field in {"title", "category", "priority", "completed", "due_date"}:
                if field in payload:
                    if field == "title":
                        task[field] = payload[field].strip()
                    elif field == "completed":
                        task[field] = bool(payload[field])
                    else:
                        task[field] = payload[field]
            save_tasks_to_file()
            return format_response("success", tasks, "更新任务成功")

    return format_response("error", message="未找到指定任务"), 404


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    """Deletes a task from the in-memory store."""
    global tasks
    filtered_tasks = [task for task in tasks if task["id"] != task_id]
    if len(filtered_tasks) == len(tasks):
        return format_response("error", message="未找到指定任务"), 404

    tasks = filtered_tasks
    save_tasks_to_file()
    return format_response("success", tasks, "删除任务成功")


@app.route("/tasks/batch", methods=["POST"])
def batch_update_tasks():
    """Processes batch operations such as deleting tasks or marking them complete."""
    global tasks
    payload = request.get_json(silent=True) or {}
    action = payload.get("action")
    ids = payload.get("ids")

    if action not in {"delete", "complete"}:
        return format_response("error", message="不支持的批量操作"), 400
    if not isinstance(ids, list) or not ids:
        return format_response("error", message="任务 ID 列表不能为空"), 400
    try:
        id_set = {int(task_id) for task_id in ids}
    except (TypeError, ValueError):
        return format_response("error", message="任务 ID 无效"), 400

    if action == "delete":
        new_tasks = [task for task in tasks if task["id"] not in id_set]
        if len(new_tasks) == len(tasks):
            return format_response("error", message="未找到选中的任务"), 404
        tasks = new_tasks
        save_tasks_to_file()
        return format_response("success", tasks, "批量删除任务成功")

    completed_state = bool(payload.get("completed", True))
    updated = 0
    for task in tasks:
        if task["id"] in id_set:
            task["completed"] = completed_state
            updated += 1
    if not updated:
        return format_response("error", message="未找到选中的任务"), 404

    save_tasks_to_file()
    message = "批量标记完成成功" if completed_state else "批量更新任务成功"
    return format_response("success", tasks, message)


@app.route("/")
def index():
    """Serves the main frontend page for the TodoList application."""
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
