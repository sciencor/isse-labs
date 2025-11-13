from flask import Flask, request, jsonify
app = Flask(__name__)


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

todo_list = TodoList()

@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todo_list.get_items())

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.json
    if 'task' not in data:
        return jsonify({"error": "Task is required"}), 400
    return jsonify(todo_list.add_item(data['task']))

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    removed = todo_list.remove_item(id)
    if removed:
        return jsonify({"message": "Item removed", "task": removed})
    return jsonify({"error": "Item not found"}), 404

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.json
    if 'task' not in data:
        return jsonify({"error": "Task is required"}), 400
    updated = todo_list.update_item(id, data['task'])
    if updated:
        return jsonify(updated)
    return jsonify({"error": "Item not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
# curl -X POST http://127.0.0.1:5000/hello -H "Content-Type:application/json"
# curl -X POST http://127.0.0.1:5000/add -H "Content-Type:application/json" -d "{\"a\":3,\"b\":5}"