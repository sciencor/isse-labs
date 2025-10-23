from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import json
import os
import uuid

app = Flask(__name__)
CORS(app)

TASKS_FILE = "吴亮宇-2200017855/project/tasks.json"

# -------------------------------
# 工具函数：加载与保存
# -------------------------------
def load_tasks():
    """从 tasks.json 文件加载任务列表"""
    if not os.path.exists(TASKS_FILE):
        return []
    with open(TASKS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_tasks():
    """保存当前任务列表到 tasks.json"""
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=4)

# 初始化任务数据
tasks = load_tasks()

# -------------------------------
# 路由 1: 主页面
# -------------------------------
@app.route("/")
def index():
    """渲染主页面"""
    return render_template("index.html")

# -------------------------------
# 路由 2: 获取任务列表
# -------------------------------
@app.route("/tasks", methods=["GET"])
def get_tasks():
    """获取全部任务或筛选任务"""
    category = request.args.get("category")
    priority = request.args.get("priority")

    filtered = tasks
    if category:
        filtered = [t for t in filtered if t["category"] == category]
    if priority:
        filtered = [t for t in filtered if t["priority"] == priority]

    return jsonify({
        "status": "success",
        "data": filtered,
        "message": "获取任务成功"
    })

# -------------------------------
# 路由 3: 新增任务
# -------------------------------
@app.route("/tasks", methods=["POST"])
def add_task():
    """新增任务"""
    data = request.json
    required_fields = ["title", "category", "priority"]
    if not all(field in data for field in required_fields):
        return jsonify({
            "status": "error",
            "message": "缺少必要字段（title, category, priority）"
        }), 400

    new_task = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "category": data["category"],
        "priority": data["priority"],
        "completed": False
    }
    tasks.append(new_task)
    save_tasks()

    return jsonify({
        "status": "success",
        "data": new_task,
        "message": "新增成功"
    }), 201

# -------------------------------
# 路由 4: 修改任务状态、名称、类别或优先级
# -------------------------------
@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    """更新任务，可以修改 completed/title/category/priority"""
    data = request.get_json() or {}
    for task in tasks:
        if task["id"] == task_id:
            # 更新允许的字段（如果客户端提供）
            if "completed" in data:
                task["completed"] = bool(data["completed"])
            if "title" in data:
                task["title"] = data["title"]
            if "category" in data:
                task["category"] = data["category"]
            if "priority" in data:
                task["priority"] = data["priority"]
            save_tasks()
            return jsonify({
                "status": "success",
                "data": task,
                "message": "任务已更新"
            })
    return jsonify({"status": "error", "message": "任务未找到"}), 404

# -------------------------------
# 路由 5: 删除任务
# -------------------------------
@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    """删除指定任务"""
    global tasks
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) == len(tasks):
        return jsonify({
            "status": "error",
            "message": "任务未找到"
        }), 404

    tasks[:] = new_tasks
    save_tasks()
    return jsonify({
        "status": "success",
        "message": "任务已删除"
    }), 200

# -------------------------------
# 主函数
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)
