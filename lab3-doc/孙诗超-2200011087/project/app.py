from flask import Flask, render_template, request, jsonify
from enum import Enum
from datetime import datetime
from functools import wraps

class Priority(Enum):
    LOW = "低"
    MEDIUM = "中"
    HIGH = "高"

class ToDoList:
    def __init__(self, content: str, category: str = "默认", priority: Priority = Priority.MEDIUM):
        self.content = content
        self.completed = False
        self.category = category
        self.priority = priority
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def mark_completed(self):
        """标记任务为已完成"""
        self.completed = True
        self.updated_at = datetime.now()
    
    def mark_incomplete(self):
        """标记任务为未完成"""
        self.completed = False
        self.updated_at = datetime.now()
    
    def update_content(self, new_content: str):
        """更新任务内容"""
        self.content = new_content
        self.updated_at = datetime.now()
    
    def update_priority(self, new_priority: Priority):
        """更新任务优先级"""
        self.priority = new_priority
        self.updated_at = datetime.now()
    
    def update_category(self, new_category: str):
        """更新任务分类"""
        self.category = new_category
        self.updated_at = datetime.now()
    
    def to_dict(self):
        """将任务转换为字典格式，便于JSON序列化"""
        return {
            'content': self.content,
            'completed': self.completed,
            'category': self.category,
            'priority': self.priority.value,
            'created_at': self.created_at.timestamp(),
            'updated_at': self.updated_at.timestamp(),
        }
    
    def __str__(self):
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.content} (分类: {self.category}, 优先级: {self.priority.value})"

app = Flask(__name__)

# 配置JSON响应不转义非ASCII字符
app.json.ensure_ascii = False

# CORS处理装饰器
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# 应用CORS处理
app.after_request(add_cors_headers)

# 处理OPTIONS预检请求
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'  
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

# 存储待办事项的列表
todo_items = []

@app.route('/')
def index():
    return """
    <h1>待办事项管理系统</h1>
    <h2>API 端点：</h2>
    <ul>
        <li>GET /api/todos - 获取所有待办事项</li>
        <li>POST /api/todos - 创建新待办事项</li>
        <li>PUT /api/todos/&lt;id&gt;/complete - 标记待办事项为完成</li>
        <li>PUT /api/todos/&lt;id&gt;/incomplete - 标记待办事项为未完成</li>
        <li>DELETE /api/todos/&lt;id&gt; - 删除待办事项</li>
    </ul>
    <p>使用示例：</p>
    <pre>
    # 创建待办事项
    curl -X POST http://localhost:5000/api/todos \
         -H "Content-Type: application/json" \
         -d '{"content": "学习Python", "category": "学习", "priority": "高"}'
    
    # 获取所有待办事项
    curl http://localhost:5000/api/todos
    </pre>
    """

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """获取所有待办事项"""
    return jsonify([item.to_dict() for item in todo_items])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """创建新待办事项"""
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({'error': '缺少必要字段: content'}), 400
    
    content = data['content']
    category = data.get('category', '默认')
    priority_str = data.get('priority', '中')
    
    # 将字符串转换为Priority枚举
    priority_map = {'低': Priority.LOW, '中': Priority.MEDIUM, '高': Priority.HIGH}
    priority = priority_map.get(priority_str, Priority.MEDIUM)
    
    todo = ToDoList(content, category, priority)
    todo_items.append(todo)
    
    return jsonify({'message': '待办事项创建成功', 'todo': todo.to_dict()}), 201

@app.route('/api/todos/<int:todo_id>/complete', methods=['PUT'])
def complete_todo(todo_id):
    """标记待办事项为完成"""
    if todo_id < 0 or todo_id >= len(todo_items):
        return jsonify({'error': '待办事项不存在'}), 404
    
    todo_items[todo_id].mark_completed()
    return jsonify({'message': '待办事项标记为完成', 'todo': todo_items[todo_id].to_dict()})

@app.route('/api/todos/<int:todo_id>/incomplete', methods=['PUT'])
def incomplete_todo(todo_id):
    """标记待办事项为未完成"""
    if todo_id < 0 or todo_id >= len(todo_items):
        return jsonify({'error': '待办事项不存在'}), 404
    
    todo_items[todo_id].mark_incomplete()
    return jsonify({'message': '待办事项标记为未完成', 'todo': todo_items[todo_id].to_dict()})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除待办事项"""
    if todo_id < 0 or todo_id >= len(todo_items):
        return jsonify({'error': '待办事项不存在'}), 404
    
    deleted_todo = todo_items.pop(todo_id)
    return jsonify({'message': '待办事项删除成功', 'todo': deleted_todo.to_dict()})

@app.route('/api/ping')
def ping_api():
    return "PONG"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)