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
            return {id: task}
        return None

app = Flask(__name__)
todo_list = TodoList()

@app.route('/')
def home():
    """根路径欢迎信息"""
    return jsonify({"message": "欢迎使用 TodoList API！请访问 /todos 路径来操作待办事项。"})

@app.route('/todos', methods=['POST'])
def add_todo():
    """
    [C]reate: 添加新的待办事项
    """
    data = request.get_json()
    if 'task' not in data:
        return jsonify({"error": "Task is required"}), 400
    item = todo_list.add_item(data['task'])
    return jsonify(item), 201

@app.route('/todos', methods=['GET'])
def get_todos():
    """
    [R]ead: 查询所有待办事项
    """
    return jsonify(todo_list.get_items()), 200

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    """
    [U]pdate: 更新指定 ID 的待办事项
    """
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task is required"}), 400
    item = todo_list.update_item(id, data['task'])
    if item:
        return jsonify(item), 200
    else:
        return jsonify({"error": "Item not found"}), 404

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    """
    [D]elete: 删除指定 ID 的待办事项
    """
    item = todo_list.remove_item(id)
    if item:
        return jsonify({"message": "Item deleted"}), 200
    else:
        return jsonify({"error": "Item not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)