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

todo_manager = TodoList()

@app.route('/')
def home():
    return jsonify({"message": "TodoList API started!"})

@app.route('/todos', methods=['POST'])
def add_item():
    data = request.json
    if "task" not in data:  # 改成检查 'task'
        return jsonify({"error": "Task is needed!"}), 400
    new_task = data['task']
    new_item = todo_manager.add_item(new_task)
    return jsonify({"message": "New todo added!", "item": new_item}), 201

@app.route('/todos/<int:id>', methods=['DELETE'])
def remove_item(id):
    result = todo_manager.remove_item(id)
    if result:
        return jsonify({"message": "A todo removed!"})
    return jsonify({"error": "Did not find this todo item."}), 404

@app.route('/todos', methods=['GET'])
def get_items():
    return jsonify({"todos": todo_manager.get_items()}), 200

@app.route('/todos/<int:id>', methods=['PUT'])
def update_item(id):
    data = request.json
    if "task" not in data:  # 改成检查 'task'
        return jsonify({"error": "Task is needed!"}), 400
    new_task = data['task']
    result = todo_manager.update_item(id, new_task)
    if result:
        return jsonify({"message": "Updated!", "updated_item": result})
    return jsonify({"error": "Did not find this todo item."}), 404

if __name__ == '__main__':
    app.run(debug=True)