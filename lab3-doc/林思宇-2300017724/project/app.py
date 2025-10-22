from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# 可选分类和优先级枚举
VALID_CATEGORIES = {"学习", "工作", "生活"}
VALID_PRIORITIES = {"高", "中", "低"}

taskStore = []  # 内存中的任务列表
nextTaskId = 1  # 自增任务 ID 记录器


def buildResponse(status, message="", data=None):
    """生成统一格式的 JSON 响应。"""
    payload = {"status": status, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload)


def findTask(taskId):
    """在任务列表中查找指定 ID 的任务。"""
    return next((task for task in taskStore if task["id"] == taskId), None)


@app.route("/")
def index():
    """渲染前端首页。"""
    return render_template("index.html")


@app.route("/tasks", methods=["GET"])
def getTasks():
    """获取任务列表，支持分类或优先级筛选。"""
    categoryFilter = request.args.get("category")
    priorityFilter = request.args.get("priority")

    if categoryFilter and categoryFilter not in VALID_CATEGORIES:
        return buildResponse("error", "无效的分类筛选"), 400
    if priorityFilter and priorityFilter not in VALID_PRIORITIES:
        return buildResponse("error", "无效的优先级筛选"), 400

    filteredTasks = [
        task
        for task in taskStore
        if (not categoryFilter or task["category"] == categoryFilter)
        and (not priorityFilter or task["priority"] == priorityFilter)
    ]

    return buildResponse("success", "获取成功", filteredTasks), 200


@app.route("/tasks", methods=["POST"])
def addTask():
    """新增一条任务记录。"""
    global nextTaskId
    payload = request.get_json(silent=True)

    if payload is None:
        return buildResponse("error", "请求体必须是 JSON"), 400

    title = (payload.get("title") or "").strip()
    category = payload.get("category")
    priority = payload.get("priority")

    if not title:
        return buildResponse("error", "任务标题不能为空"), 400
    if category not in VALID_CATEGORIES:
        return buildResponse("error", "分类必须是 学习 / 工作 / 生活"), 400
    if priority not in VALID_PRIORITIES:
        return buildResponse("error", "优先级必须是 高 / 中 / 低"), 400

    task = {
        "id": nextTaskId,
        "title": title,
        "category": category,
        "priority": priority,
        "completed": False,
    }
    taskStore.append(task)
    nextTaskId += 1

    return buildResponse("success", "新增成功", task), 201


@app.route("/tasks/<int:taskId>", methods=["PUT"])
def updateTask(taskId):
    """更新指定任务的完成状态。"""
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
    return buildResponse("success", "更新成功", task), 200


@app.route("/tasks/<int:taskId>", methods=["DELETE"])
def deleteTask(taskId):
    """删除指定任务。"""
    task = findTask(taskId)
    if task is None:
        return buildResponse("error", "任务不存在"), 404

    taskStore.remove(task)
    return buildResponse("success", "删除成功", {"id": taskId}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
