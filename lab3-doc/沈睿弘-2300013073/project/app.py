from flask import Flask, jsonify, request
import json
import os
from datetime import datetime
from flask_cors import CORS


class TodoList:
    STORAGE_PATH = os.path.join(os.path.dirname(__file__), "tasks.json")

    def __init__(self):
        self.tasks = {}
        self.counter = 1
        self._load()

    def _load(self):
        """Load tasks from storage file if present."""
        if os.path.exists(self.STORAGE_PATH):
            try:
                with open(self.STORAGE_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                tasks = data.get("tasks", [])
                for item in tasks:
                    tid = int(item["id"])
                    # ensure legacy keys are compatible
                    if "createdAt" not in item and "created_at" in item:
                        item["createdAt"] = item.pop("created_at")
                    if "dueTime" not in item and "due_time" in item:
                        item["dueTime"] = item.pop("due_time")
                    self.tasks[tid] = item
                    self.counter = max(self.counter, tid + 1)
            except Exception:
                # start fresh on read error
                self.tasks = {}
                self.counter = 1

    def _save(self):
        """Persist current tasks to storage file."""
        data = {"tasks": list(self.tasks.values())}
        with open(self.STORAGE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def listTasks(self, category=None, priority=None, search=None):
        """Return tasks matching optional filters."""
        results = list(self.tasks.values())
        if category:
            results = [t for t in results if t.get("category") == category]
        if priority:
            results = [t for t in results if t.get("priority") == priority]
        if search:
            q = search.lower()
            results = [t for t in results if q in t.get("title", "").lower()]
        return results

    def addTask(self, title, category, priority, dueTimeStr):
        """Create and store a new task."""
        createdAt = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        dueTime = None
        if dueTimeStr:
            try:
                dueTime = datetime.fromisoformat(dueTimeStr)
            except Exception:
                raise ValueError("invalid dueTime format, expected YYYY-MM-DDTHH:MM")
            if dueTime < datetime.fromisoformat(createdAt):
                raise ValueError("dueTime earlier than create time")

        task = {
            "id": self.counter,
            "title": title,
            "category": category,
            "priority": priority,
            "completed": False,
            "createdAt": createdAt,
            "dueTime": dueTimeStr or None,
        }
        self.tasks[self.counter] = task
        self.counter += 1
        self._save()
        return task

    def updateTask(self, task_id, **fields):
        """Update fields for a given task."""
        task_id = int(task_id)
        task = self.tasks.get(task_id)
        if not task:
            return None
        # allow updating completed, title, category, priority, dueTime
        if "dueTime" in fields and fields["dueTime"]:
            try:
                due = datetime.fromisoformat(fields["dueTime"])
            except Exception:
                raise ValueError("invalid dueTime format, expected YYYY-MM-DDTHH:MM")
            created = datetime.fromisoformat(task["createdAt"])
            if due < created:
                raise ValueError("dueTime earlier than create time")
        for k, v in fields.items():
            if k in task and v is not None:
                task[k] = v
        self._save()
        return task

    def deleteTask(self, task_id):
        """Delete a task and persist changes."""
        task_id = int(task_id)
        if task_id in self.tasks:
            task = self.tasks.pop(task_id)
            self._save()
            return task
        return None


todoList = TodoList()
app = Flask(__name__)
CORS(app)
app.config["JSON_AS_ASCII"] = False


def successResponse(data=None, message=""):
    """构造统一的成功响应格式"""
    return {"status": "success", "data": data, "message": message}


def errorResponse(message="", code=400):
    """构造并返回统一的错误响应"""
    return jsonify({"status": "error", "data": None, "message": message}), code


@app.route("/tasks", methods=["POST"])
def addTask():
    """处理创建任务的请求"""
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    category = data.get("category")
    priority = data.get("priority")
    dueTime = data.get("dueTime")

    if not title:
        return errorResponse("Missing 'title' field", 400)
    if category not in ("学习", "工作", "生活"):
        return errorResponse("Invalid or missing 'category' field", 400)
    if priority not in ("高", "中", "低"):
        return errorResponse("Invalid or missing 'priority' field", 400)

    try:
        task = todoList.addTask(title, category, priority, dueTime)
    except ValueError as e:
        return errorResponse(str(e), 400)

    return jsonify(successResponse(data=task, message="新增成功")), 201


@app.route("/tasks", methods=["GET"])
def getTasks():
    """返回任务列表，支持按 category/priority/search 筛选"""
    category = request.args.get("category")
    priority = request.args.get("priority")
    search = request.args.get("search")
    tasks = todoList.listTasks(category=category, priority=priority, search=search)
    return jsonify(successResponse(data=tasks, message="查询成功")), 200


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def updateTask(task_id):
    """更新任务的状态或字段"""
    data = request.get_json(silent=True) or {}
    fields = {}
    # allow toggling completed or updating fields
    if "completed" in data:
        fields["completed"] = bool(data.get("completed"))
    for key in ("title", "category", "priority", "dueTime"):
        if key in data:
            fields[key] = data.get(key)
    try:
        updated = todoList.updateTask(task_id, **fields)
    except ValueError as e:
        return errorResponse(str(e), 400)
    if not updated:
        return errorResponse(f"Task with ID {task_id} not found", 404)
    return jsonify(successResponse(data=updated, message="更新成功")), 200


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def deleteTask(task_id):
    """删除指定任务"""
    removed = todoList.deleteTask(task_id)
    if not removed:
        return errorResponse(f"Task with ID {task_id} not found", 404)
    return jsonify(successResponse(data=removed, message="删除成功")), 200


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='TodoList API')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='主机地址')
    parser.add_argument('--port', type=int, default=5000, help='端口号')
    parser.add_argument('--debug', action='store_true', help='是否开启调试模式')
    args = parser.parse_args()
    app.run(host=args.host, port=args.port, debug=args.debug)