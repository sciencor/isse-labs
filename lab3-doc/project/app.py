from flask import Flask, request, send_from_directory
from models import TodoList
import os, json

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.config['JSON_AS_ASCII'] = False
todo_list = TodoList()

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

@app.route("/todos", methods=["GET"])
def list_todos():
    priority = request.args.get("priority")
    category = request.args.get("category")
    completed = request.args.get("completed")
    sort = request.args.get("sort")
    if completed is not None and completed != 'all':
        completed = True if completed.lower() in ("1", "true", "yes", "completed") else False
    else:
        completed = None
    items = todo_list.get_items(priority=priority, category=category, completed=completed, sort=sort)
    return json_response(items, 200)

@app.route("/todos", methods=["POST"])
def create_todo():
    data = request.get_json()
    if not data or "task" not in data:
        return json_response({"error": "Missing 'task' in request body"}, 400)
    priority = data.get("priority", "normal")
    category = data.get("category", "默认")
    due = data.get("due", "暂无")
    item = todo_list.add_item(data["task"], priority=priority, category=category, due=due)
    return json_response(item, 201)

@app.route("/todos/<int:todo_id>", methods=["GET"])
def get_todo(todo_id):
    item = todo_list.get_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

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
        completed=data.get("completed"),
        due=data.get("due")
    )
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

@app.route("/todos/<int:todo_id>/toggle", methods=["PATCH"])
def toggle_todo(todo_id):
    item = todo_list.toggle_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response(item, 200)

@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    item = todo_list.remove_item(todo_id)
    if not item:
        return json_response({"error": "Not found"}, 404)
    return json_response({"deleted": todo_id}, 200)

@app.route("/todos/progress", methods=["GET"])
def todos_progress():
    return json_response(todo_list.progress(), 200)

@app.route("/categories", methods=["GET"])
def categories():
    return json_response(todo_list.get_categories(), 200)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)