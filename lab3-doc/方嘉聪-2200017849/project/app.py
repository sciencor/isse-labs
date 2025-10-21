"""Flask backend for a simple TodoList application."""

from typing import Dict, List, Optional
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# In-memory storage for tasks; replace with persistent storage in production.
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


def validate_task_payload(payload: Dict) -> Optional[str]:
    """Validates an incoming task payload and returns an error message if invalid."""
    title = payload.get("title", "").strip()
    category = payload.get("category")
    priority = payload.get("priority")

    if not title:
        return "任务标题不能为空"
    if category not in VALID_CATEGORIES:
        return "任务分类无效"
    if priority not in VALID_PRIORITIES:
        return "任务优先级无效"
    return None


@app.route("/tasks", methods=["GET"])
def get_tasks():
    """Returns the list of tasks, optionally filtered by category or priority."""
    category = request.args.get("category")
    priority = request.args.get("priority")

    filtered_tasks = tasks
    if category:
        filtered_tasks = [
            task for task in filtered_tasks if task["category"] == category
        ]
    if priority:
        filtered_tasks = [
            task for task in filtered_tasks if task["priority"] == priority
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
    }
    tasks.append(task)
    next_id += 1

    return format_response("success", tasks, "新增任务成功"), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id: int):
    """Updates the completion status of a task."""
    payload = request.get_json(silent=True) or {}
    if "completed" not in payload:
        return format_response("error", message="请求体缺少 completed 字段"), 400

    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = bool(payload["completed"])
            return format_response("success", tasks, "更新任务状态成功")

    return format_response("error", message="未找到指定任务"), 404


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    """Deletes a task from the in-memory store."""
    global tasks
    filtered_tasks = [task for task in tasks if task["id"] != task_id]
    if len(filtered_tasks) == len(tasks):
        return format_response("error", message="未找到指定任务"), 404

    tasks = filtered_tasks
    return format_response("success", tasks, "删除任务成功")


@app.route("/")
def index():
    """Serves the main frontend page for the TodoList application."""
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
