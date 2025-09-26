#这里是将TodoList类函数改为api服务的脚本文件

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
    task = data.get('task')
    if not task:
        return jsonify({'error': 'Task is required'}), 400
    result = todo_list.add_item(task)
    return jsonify(result), 201

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    result = todo_list.remove_item(todo_id)
    if result is None:
        return jsonify({'error': 'Todo not found'}), 404
    return jsonify({'deleted': result}), 200

@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todo_list.get_items()), 200

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    task = data.get('task')
    if not task:
        return jsonify({'error': 'Task is required'}), 400
    result = todo_list.update_item(todo_id, task)
    if result is None:
        return jsonify({'error': 'Todo not found'}), 404
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
