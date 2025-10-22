from flask import Flask, request, send_from_directory
from models import TodoList
import os
import json

app = Flask(__name__, static_folder="static", static_url_path="/static")
# 尝试关闭 jsonify 的 ascii 转义（有时需配合自定义返回）
app.config['JSON_AS_ASCII'] = False
todo_list = TodoList()

# 统一 JSON 响应，确保中文不被 \u 转义，且带 charset=utf-8
def json_response(obj, status=200):
    body = json.dumps(obj, ensure_ascii=False)
    return app.response_class(body, status=status, mimetype='application/json; charset=utf-8')

@app.after_request
def ensure_utf8(response):
    ct = response.headers.get('Content-Type', '')
    if 'charset' not in ct.lower():
        if ct:
            response.headers['Content-Type'] = f"{ct}; charset=utf-8"
        else:
            response.headers['Content-Type'] = "application/json; charset=utf-8"
    return response

@app.route("/", methods=["GET"])
def index():
    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(app.static_folder, "index.html")
    return json_response({"message": "TodoList API running"}, 200)

# 列表（支持筛选）
@app.route("/todos", methods=["GET"])
def list_todos():
    priority = request.args.get("priority")
    category = request.args.get("category")
    completed = request.args.get("completed")
    if completed is not None:
        completed = True if completed.lower() in ("1", "true", "yes") else False
    items = todo_list.get_items(priority=priority, category=category, completed=completed)
    return json_response(items, 200)

# 新增
@app.route("/todos", methods=["POST"])
def create_todo():
    data = request.get_json()
    if not data or "task" not in data:
        return json_response({"error": "Missing 'task' in request body"}, 400)
    priority = data.get("priority", "normal")
    category = data.get("category", "default")
    item = todo_list.add_item(data["task"], priority=priority, category=category)
    return json_response(item, 201)

# 获取单条
@app.route("/todos/<int:todo_id>", methods=["GET"])
def get_todo(todo_id):
    item = todo_list.get_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

# 全量更新（或部分字段可用）
@app.route("/todos/<int:todo_id>", methods=["PUT", "PATCH"])
def update_todo(todo_id):
    data = request.get_json()
    if not data:
        return json_response({"error": "Missing JSON body"}, 400)
    item = todo_list.update_item(
        todo_id,
        task=data.get("task"),
        priority=data.get("priority"),
        category=data.get("category"),
        completed=data.get("completed")
    )
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

# 切换完成状态
@app.route("/todos/<int:todo_id>/toggle", methods=["PATCH"])
def toggle_todo(todo_id):
    item = todo_list.toggle_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

# 删除
@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    item = todo_list.remove_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response({"deleted": todo_id}, 200)

# 完成进度
@app.route("/todos/progress", methods=["GET"])
def todos_progress():
    return json_response(todo_list.progress(), 200)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)