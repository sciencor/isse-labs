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
@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task content cannot be empty"}), 400
    
    result = todo_list.add_item(data['task'])
    return jsonify(result), 201

@app.route('/todos', methods=['GET'])
def get_todos():
    items = todo_list.get_items()
    # 转换为更友好的格式
    formatted_items = [{"id": id, "task": task} for id, task in items.items()]
    return jsonify({"todos": formatted_items}), 200

@app.route('/todos/<int:id>', methods=['GET'])
def get_todo(id):
    items = todo_list.get_items()
    if id in items:
        return jsonify({"id": id, "task": items[id]}), 200
    return jsonify({"error": "Job not found"}), 404

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task content cannot be empty"}), 400
    
    result = todo_list.update_item(id, data['task'])
    if result:
        return jsonify({"id": id, "task": data['task']}), 200
    return jsonify({"error": "Job not found"}), 404

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    result = todo_list.remove_item(id)
    if result:
        return jsonify({"message": "Job deleted", "task": result}), 200
    return jsonify({"error": "Job not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
    