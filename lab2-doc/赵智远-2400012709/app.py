from flask import Flask, request, jsonify


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
            return self.todos.pop(id)
        return None

    def get_items(self):
        return self.todos

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None


app = Flask(__name__)
todo_list = TodoList()


@app.route("/todos", methods=["GET"])
def get_todos():
    return jsonify(todo_list.get_items())


@app.route("/add_item", methods=["POST"])
def add_item():
    data = request.get_json()
    task = data.get("task")
    if not task:
        return jsonify({"error": "missing 'task'"}), 400
    new_item = todo_list.add_item(task)
    return jsonify(new_item), 201


@app.route("/todos/<int:id>", methods=["PUT"])
def update_todo(id):
    data = request.get_json()
    task = data.get("task")
    updated = todo_list.update_item(id, task)
    if updated is None:
        return jsonify({"error": "task not found"}), 404
    return jsonify(updated)


@app.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    removed = todo_list.remove_item(id)
    if removed is None:
        return jsonify({"error": "task not found"}), 404
    return jsonify({"message": f"task {id} deleted"})


if __name__ == "__main__":
    app.run(debug=True)
