# -*- coding: utf-8 -*-
import json
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

VALID_CATEGORIES = {"学习", "工作", "生活"}
VALID_PRIORITIES = {"高", "中", "低"}
DATE_FORMAT = "%Y-%m-%d"
DATA_FILE = Path(__file__).resolve().parent / "tasks.json"

taskStore = []
nextTaskId = 1


def loadTaskData():
    """Read tasks from disk into memory."""
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except json.JSONDecodeError:
        pass
    return []


def saveTaskData():
    """Persist in-memory tasks to disk."""
    DATA_FILE.write_text(
        json.dumps(taskStore, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def initializeStore():
    """Prepare the task store and ID counter."""
    global taskStore, nextTaskId
    taskStore = loadTaskData()
    for task in taskStore:
        task.setdefault("completed", False)
        task.setdefault("dueDate", "")
    nextTaskId = max((task.get("id", 0) for task in taskStore), default=0) + 1


def buildResponse(status, message="", data=None):
    """Generate a unified JSON response payload."""
    payload = {"status": status, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload)


def findTask(taskId):
    """Locate a task by ID."""
    return next((task for task in taskStore if task.get("id") == taskId), None)


def parseDueDate(value):
    """Convert a due date string to datetime for sorting."""
    try:
        return datetime.strptime(value, DATE_FORMAT)
    except (TypeError, ValueError):
        return None


def validateDueDate(value):
    """Ensure the due date matches YYYY-MM-DD format."""
    return parseDueDate(value) is not None


def dueDateSortKey(task):
    """Provide a sortable key based on due date."""
    parsed = parseDueDate(task.get("dueDate"))
    return parsed if parsed else datetime.max


initializeStore()


@app.route("/")
def index():
    """Render the front-end page."""
    return render_template("index.html")


@app.route("/tasks", methods=["GET"])
def getTasks():
    """Return tasks with optional filters, search, and sorting."""
    categoryFilter = request.args.get("category")
    priorityFilter = request.args.get("priority")
    searchTerm = request.args.get("search")
    sortOption = request.args.get("sort")

    if categoryFilter and categoryFilter not in VALID_CATEGORIES:
        return buildResponse("error", "无效的分类筛选"), 400
    if priorityFilter and priorityFilter not in VALID_PRIORITIES:
        return buildResponse("error", "无效的优先级筛选"), 400
    if sortOption and sortOption not in {"dueDate", "dueDateDesc"}:
        return buildResponse("error", "不支持的排序方式"), 400

    filteredTasks = [
        task
        for task in taskStore
        if (not categoryFilter or task.get("category") == categoryFilter)
        and (not priorityFilter or task.get("priority") == priorityFilter)
    ]

    if searchTerm:
        keyword = searchTerm.lower()
        filteredTasks = [
            task for task in filteredTasks if keyword in task.get("title", "").lower()
        ]

    if sortOption:
        reverse = sortOption == "dueDateDesc"
        filteredTasks.sort(key=dueDateSortKey, reverse=reverse)

    return buildResponse("success", "获取成功", filteredTasks), 200


@app.route("/tasks", methods=["POST"])
def addTask():
    """Insert a new task record."""
    global nextTaskId
    payload = request.get_json(silent=True)

    if payload is None:
        return buildResponse("error", "请求体必须是 JSON"), 400

    title = (payload.get("title") or "").strip()
    category = payload.get("category")
    priority = payload.get("priority")
    dueDate = payload.get("dueDate")

    if not title:
        return buildResponse("error", "任务标题不能为空"), 400
    if category not in VALID_CATEGORIES:
        return buildResponse("error", "分类必须是 学习 / 工作 / 生活"), 400
    if priority not in VALID_PRIORITIES:
        return buildResponse("error", "优先级必须是 高 / 中 / 低"), 400
    if not dueDate or not validateDueDate(dueDate):
        return buildResponse("error", "截止日期格式需为 YYYY-MM-DD"), 400

    task = {
        "id": nextTaskId,
        "title": title,
        "category": category,
        "priority": priority,
        "dueDate": dueDate,
        "completed": False,
    }
    taskStore.append(task)
    nextTaskId += 1
    saveTaskData()

    return buildResponse("success", "新增成功", task), 201


@app.route("/tasks/<int:taskId>", methods=["PUT"])
def updateTask(taskId):
    """Update completion status of a task."""
    task = findTask(taskId)
    if task is None:
        return buildResponse("error", "任务不存在"), 404

    payload = request.get_json(silent=True)
    if payload is None:
        return buildResponse("error", "请求体必须是 JSON"), 400

    if "completed" not in payload:
        return buildResponse("error", "缺少 completed 字段"), 400

    completed = payload.get("completed")
    if not isinstance(completed, bool):
        return buildResponse("error", "completed 必须是布尔值"), 400

    task["completed"] = completed
    saveTaskData()
    return buildResponse("success", "更新成功", task), 200


@app.route("/tasks/<int:taskId>", methods=["DELETE"])
def deleteTask(taskId):
    """Delete a task by ID."""
    task = findTask(taskId)
    if task is None:
        return buildResponse("error", "任务不存在"), 404

    taskStore.remove(task)
    saveTaskData()
    return buildResponse("success", "删除成功", {"id": taskId}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
