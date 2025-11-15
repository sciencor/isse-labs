from flask import Flask, jsonify, request

class TodoList:
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task):
        """添加新的待办事项"""
        self.todos[self.counter] = task
        self.counter += 1
        return {"id": self.counter - 1, "task": task}

    def remove_item(self, id):
        """删除指定ID的待办事项"""
        if id in self.todos:
            return self.todos.pop(id)
        return None

    def get_items(self):
        """获取所有待办事项"""
        return self.todos

    def update_item(self, id, task):
        """更新指定ID的待办事项"""
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None

# 创建Flask应用和TodoList实例
app = Flask(__name__)
todo_list = TodoList()

@app.route('/todos', methods=['GET'])
def get_all_todos():
    """获取所有待办事项"""
    todos_dict = todo_list.get_items()
    # 统一返回格式：将字典转换为资源对象数组
    todos_list = [{"id": key, "task": value} for key, value in todos_dict.items()]
    return jsonify({"todos": todos_list, "count": len(todos_list)})

@app.route('/todos', methods=['POST'])
def add_todo():
    """添加新的待办事项"""
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task content is required"}), 400  # 错误信息改为英文
    
    result = todo_list.add_item(data['task'])
    return jsonify(result), 201

@app.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """获取指定ID的待办事项"""
    todos = todo_list.get_items()
    if todo_id in todos:
        return jsonify({"id": todo_id, "task": todos[todo_id]})
    return jsonify({"error": "Todo item not found"}), 404  # 错误信息改为英文

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """更新指定ID的待办事项"""
    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"error": "Task content is required"}), 400  # 错误信息改为英文
    
    result = todo_list.update_item(todo_id, data['task'])
    if result:
        return jsonify({"id": todo_id, "task": data['task']})
    return jsonify({"error": "Todo item not found"}), 404  # 错误信息改为英文

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除指定ID的待办事项"""
    result = todo_list.remove_item(todo_id)
    if result:
        # 删除成功可选择返回204状态码，无内容
        return '', 204
    return jsonify({"error": "Todo item not found"}), 404  # 错误信息改为英文

if __name__ == '__main__':
    app.run(debug=True)