from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据文件路径
DATA_FILE = 'todos.json'

def load_todos():
    """从文件加载todos数据"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_todos(todos):
    """保存todos数据到文件"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(todos, f, ensure_ascii=False, indent=2)

# 初始化数据
todos = load_todos()
next_id = max([todo['id'] for todo in todos], default=0) + 1

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """获取所有todos"""
    # 支持按分类和优先级筛选
    category = request.args.get('category')
    priority = request.args.get('priority')
    
    filtered_todos = todos
    
    if category:
        filtered_todos = [todo for todo in filtered_todos if todo.get('category') == category]
    
    if priority:
        filtered_todos = [todo for todo in filtered_todos if todo.get('priority') == priority]
    
    # 按优先级排序：high > medium > low
    priority_order = {'high': 3, 'medium': 2, 'low': 1}
    filtered_todos.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 1), reverse=True)
    
    return jsonify(filtered_todos)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """创建新的todo"""
    global next_id
    
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': '标题不能为空'}), 400
    
    todo = {
        'id': next_id,
        'title': data['title'],
        'description': data.get('description', ''),
        'completed': False,
        'priority': data.get('priority', 'low'),  # high, medium, low
        'category': data.get('category', '默认'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    todos.append(todo)
    save_todos(todos)
    next_id += 1
    
    return jsonify(todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """更新todo"""
    data = request.get_json()
    
    for todo in todos:
        if todo['id'] == todo_id:
            todo['title'] = data.get('title', todo['title'])
            todo['description'] = data.get('description', todo['description'])
            todo['completed'] = data.get('completed', todo['completed'])
            todo['priority'] = data.get('priority', todo['priority'])
            todo['category'] = data.get('category', todo['category'])
            todo['updated_at'] = datetime.now().isoformat()
            
            save_todos(todos)
            return jsonify(todo)
    
    return jsonify({'error': 'Todo未找到'}), 404

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除todo"""
    global todos
    
    todos = [todo for todo in todos if todo['id'] != todo_id]
    save_todos(todos)
    
    return jsonify({'message': '删除成功'})

@app.route('/api/todos/<int:todo_id>/toggle', methods=['PUT'])
def toggle_todo(todo_id):
    """切换todo完成状态"""
    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            todo['updated_at'] = datetime.now().isoformat()
            save_todos(todos)
            return jsonify(todo)
    
    return jsonify({'error': 'Todo未找到'}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取所有分类"""
    categories = list(set(todo.get('category', '默认') for todo in todos))
    return jsonify(categories)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    total = len(todos)
    completed = sum(1 for todo in todos if todo['completed'])
    pending = total - completed
    
    priority_stats = {
        'high': sum(1 for todo in todos if todo.get('priority') == 'high'),
        'medium': sum(1 for todo in todos if todo.get('priority') == 'medium'),
        'low': sum(1 for todo in todos if todo.get('priority') == 'low')
    }
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'priority_stats': priority_stats
    })

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)