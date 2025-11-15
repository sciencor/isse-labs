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
            return self.todos.pop(id)
        return None

    def get_items(self):
        return self.todos

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {"id": id, "task": task}
        return None


todo_service = TodoList()
app = Flask(__name__)


@app.route("/todos", methods=["POST"])
def create_todo():
    payload = request.json
    task = payload.get("task")
    if not task:
        return (
            jsonify(
                {
                    "error": "Bad Request",
                    "message": "Missing required field 'task'",
                }
            ),
            400,
        )
    created = todo_service.add_item(task)
    return jsonify({"message": "Created Successful", "todo": created}), 201


@app.route("/todos", methods=["GET"])
def list_todos():
    return jsonify(
        {"message": "Got Successful", "todos": todo_service.get_items()}
    )


@app.route("/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id: int):
    payload = request.get_json(silent=True) or {}
    task = payload.get("task")
    if not task:
        return (
            jsonify(
                {
                    "error": "Bad Request",
                    "message": "Missing required field 'task'",
                }
            ),
            400,
        )
    updated = todo_service.update_item(todo_id, task)
    if not updated:
        return (
            jsonify({"error": "Not Found", "message": "Todo not found"}),
            404,
        )
    return jsonify({"message": "Updated Successful", "todo": updated})


@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id: int):
    removed_task = todo_service.remove_item(todo_id)
    if removed_task is None:
        return (
            jsonify({"error": "Not Found", "message": "Todo not found"}),
            404,
        )
    return jsonify(
        {
            "message": "Delete Successful",
            "todo": {"id": todo_id, "task": removed_task},
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
