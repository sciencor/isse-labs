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
    """查询所有任务"""
    return jsonify(todo_list.get_items())

@app.route('/todos', methods=['POST'])
def add_todo():
    """新增任务"""
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({'error': 'Missing task field'}), 400
    result = todo_list.add_item(data['task'])
    return jsonify(result), 201

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    """删除任务"""
    result = todo_list.remove_item(id)
    if result is None:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({'deleted': result})

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    """更新任务"""
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({'error': 'Missing task field'}), 400
    result = todo_list.update_item(id, data['task'])
    if result is None:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
