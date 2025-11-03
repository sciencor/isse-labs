#这里是将TodoList类函数改为api服务的脚本文件
from flask import Flask, jsonify, request


class TodoList:
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task):
        self.todos[self.counter] = task
        self.counter += 1
        return {"id": self.counter - 1, "task": task}

    def remove_item(self, id):
        if id in self.todos:
            task = self.todos.pop(id)
            return {"id": id, "task": task}
        return None

    def get_items(self):
        return [{"id": id, "task": task} for id, task in self.todos.items()]

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {"id": id, "task": task}
        return None


todo_list = TodoList()
app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False


@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json(silent=True) or {}
    task = data.get("task")
    if not task:
        return jsonify({"error": "Missing 'task' field"}), 400
    result = todo_list.add_item(task)
    return jsonify(result), 201


@app.route("/todos", methods=["GET"])
def list_todos():
    return jsonify(todo_list.get_items()), 200


@app.route("/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    data = request.get_json(silent=True) or {}
    task = data.get("task")
    if not task:
        return jsonify({"error": "Missing 'task' field"}), 400
    updated = todo_list.update_item(todo_id, task)
    if not updated:
        return jsonify({"error": f"Task with ID {todo_id} not found"}), 404
    return jsonify(updated), 200


@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def remove_todo(todo_id):
    removed = todo_list.remove_item(todo_id)
    if not removed:
        return jsonify({"error": f"Task with ID {todo_id} not found"}), 404
    return jsonify(removed), 200


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='TodoList API')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='主机地址')
    parser.add_argument('--port', type=int, default=5000, help='端口号')
    parser.add_argument('--debug', type=bool, default=True, help='是否开启调试模式')
    args = parser.parse_args()
    app.run(host=args.host, port=args.port, debug=args.debug)