# app.py
# --------------------------
# TodoList 后端主程序
# 提供任务的增删改查 RESTful API
# --------------------------

from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)  # 允许前端跨域请求

# --------------------------
# 模拟任务数据库（内存列表）
# --------------------------
tasks = [
    {
        "id": str(uuid.uuid4()),
        "title": "写实验报告",
        "category": "学习",
        "priority": "高",
        "completed": False
    },
    {
        "id": str(uuid.uuid4()),
        "title": "买菜做饭",
        "category": "生活",
        "priority": "中",
        "completed": False
    }
]


# --------------------------
# 工具函数
# --------------------------
def find_task(task_id):
    """根据ID查找任务"""
    return next((t for t in tasks if t["id"] == task_id), None)


# --------------------------
# 1. 获取任务列表 (支持筛选)
# --------------------------
@app.route("/tasks", methods=["GET"])
def get_tasks():
    """获取全部任务，可按category或priority筛选"""
    category = request.args.get("category")
    priority = request.args.get("priority")

    filtered_tasks = tasks
    if category:
        filtered_tasks = [t for t in filtered_tasks if t["category"] == category]
    if priority:
        filtered_tasks = [t for t in filtered_tasks if t["priority"] == priority]

    return jsonify({
        "status": "success",
        "data": filtered_tasks,
        "message": "获取任务成功"
    })


# --------------------------
# 2. 新增任务
# --------------------------
@app.route("/tasks", methods=["POST"])
def add_task():
    """新增一个任务"""
    data = request.get_json()

    # 参数校验
    required_fields = ["title", "category", "priority"]
    if not all(field in data for field in required_fields):
        return jsonify({
            "status": "error",
            "message": "缺少必要字段 title/category/priority"
        }), 400

    new_task = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "category": data["category"],
        "priority": data["priority"],
        "completed": False
    }
    tasks.append(new_task)

    return jsonify({
        "status": "success",
        "data": new_task,
        "message": "新增成功"
    }), 201


# --------------------------
# 3. 修改任务状态（完成/未完成）
# --------------------------
@app.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    """切换任务完成状态"""
    task = find_task(task_id)
    if not task:
        return jsonify({"status": "error", "message": "任务不存在"}), 404

    data = request.get_json()
    if "completed" in data:
        task["completed"] = data["completed"]

    return jsonify({
        "status": "success",
        "data": task,
        "message": "更新成功"
    })


# --------------------------
# 4. 删除任务
# --------------------------
@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    """根据ID删除任务"""
    task = find_task(task_id)
    if not task:
        return jsonify({"status": "error", "message": "任务不存在"}), 404

    tasks.remove(task)

    return jsonify({
        "status": "success",
        "data": task_id,
        "message": "删除成功"
    })


# --------------------------
# 主函数入口
# --------------------------
if __name__ == "__main__":
    app.run(debug=True)
