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

@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todo_list.get_items())

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    if 'task' in data:
        item = todo_list.add_item(data['task'])
        return jsonify(item), 201
    return jsonify({"error": "Task is required"}), 400

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    item = todo_list.remove_item(id)
    if item:
        return jsonify({"message": "Deleted", "task": item}), 200
    return jsonify({"error": "Item not found"}), 404

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.get_json()
    if 'task' in data:
        item = todo_list.update_item(id, data['task'])
        if item:
            return jsonify(item), 200
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"error": "Task is required"}), 400

if __name__ == '__main__':
    app.run(debug=True)