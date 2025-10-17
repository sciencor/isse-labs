from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Simple in-memory storage; replace with persistent store later.
tasks = []
next_id = 1


def make_response(status: str, data=None, message: str = ""):
	return jsonify({
		"status": status,
		"data": data,
		"message": message
	})


@app.route("/tasks", methods=["GET"])
def get_tasks():
	category = request.args.get("category")
	priority = request.args.get("priority")

	filtered = tasks
	if category:
		filtered = [task for task in filtered if task["category"] == category]
	if priority:
		filtered = [task for task in filtered if task["priority"] == priority]

	return make_response("success", filtered, "获取成功")


@app.route("/tasks", methods=["POST"])
def add_task():
	global next_id

	payload = request.get_json(silent=True) or {}
	title = payload.get("title")
	category = payload.get("category")
	priority = payload.get("priority")
	completed = bool(payload.get("completed", False))

	if not all([title, category, priority]):
		return make_response("error", None, "缺少必要字段"), 400

	task = {
		"id": next_id,
		"title": title,
		"category": category,
		"priority": priority,
		"completed": completed
	}

	tasks.append(task)
	next_id += 1

	return make_response("success", task, "新增成功"), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
	payload = request.get_json(silent=True) or {}
	completed = payload.get("completed")

	if completed is None:
		return make_response("error", None, "缺少completed字段"), 400

	for task in tasks:
		if task["id"] == task_id:
			task["completed"] = bool(completed)
			return make_response("success", task, "状态更新成功")

	return make_response("error", None, "任务不存在"), 404


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
	for index, task in enumerate(tasks):
		if task["id"] == task_id:
			tasks.pop(index)
			return make_response("success", None, "删除成功")

	return make_response("error", None, "任务不存在"), 404


if __name__ == "__main__":
	app.run(debug=True)
