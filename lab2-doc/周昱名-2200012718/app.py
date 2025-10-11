from flask import Flask, jsonify, request
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

# 添加任务
@app.route('/add', methods=['POST'])
def add_item():
    data = request.get_json()
    task = data.get('task')
    if task:
        return jsonify(todo_list.add_item(task))
    return jsonify({"error": "Task not provided"})

# 删除任务
@app.route('/remove/<int:id>', methods=['DELETE'])
def remove_item(id):
    return jsonify(todo_list.remove_item(id))

# 获取所有任务
@app.route('/get', methods=['GET'])
def get_items():
    return jsonify(todo_list.get_items())

# 更新任务
@app.route('/update/<int:id>', methods=['PUT'])
def update_item(id):
    data = request.get_json()
    task = data.get('task')
    if task:
        return jsonify(todo_list.update_item(id, task))
    return jsonify({"error": "Task not provided"})

if __name__ == '__main__':
    app.run(debug=True)
