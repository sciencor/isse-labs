"""
TodoList Flask 后端服务
提供 RESTful API 接口，支持任务的增删改查和统计功能
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 全局变量存储任务列表和ID计数器
todos = []
next_id = 1


def create_response(code=200, message="success", data=None):
    """
    创建统一的响应格式
    
    Args:
        code: HTTP状态码
        message: 响应消息
        data: 响应数据
    
    Returns:
        tuple: (响应字典, HTTP状态码)
    """
    response = {
        "code": code,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), code


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return create_response(200, "API is running")


@app.route('/api/todos', methods=['GET'])
def get_todos():
    """
    获取任务列表，支持按优先级、分类和状态筛选
    
    Query参数:
        - priority: high/medium/low
        - category: work/study/life/other
        - status: completed/pending
    """
    # 获取筛选参数
    priority = request.args.get('priority')
    category = request.args.get('category')
    status = request.args.get('status')
    
    # 筛选任务
    filtered_todos = todos.copy()
    
    if priority:
        filtered_todos = [t for t in filtered_todos if t['priority'] == priority]
    
    if category:
        filtered_todos = [t for t in filtered_todos if t['category'] == category]
    
    if status:
        is_completed = (status == 'completed')
        filtered_todos = [t for t in filtered_todos if t['completed'] == is_completed]
    
    return create_response(200, "success", filtered_todos)


@app.route('/api/todos', methods=['POST'])
def add_todo():
    """
    添加新任务
    
    请求体:
        - title: 任务标题（必填）
        - description: 任务描述（可选）
        - priority: 优先级，默认为 medium
        - category: 分类，默认为 other
    """
    global next_id
    
    data = request.get_json()
    
    # 验证必填字段
    if not data or not data.get('title'):
        return create_response(400, "任务标题不能为空")
    
    # 验证优先级
    priority = data.get('priority', 'medium')
    if priority not in ['high', 'medium', 'low']:
        return create_response(400, "优先级必须是 high、medium 或 low")
    
    # 验证分类
    category = data.get('category', 'other')
    if category not in ['work', 'study', 'life', 'other']:
        return create_response(400, "分类必须是 work、study、life 或 other")
    
    # 创建新任务
    new_todo = {
        'id': next_id,
        'title': data['title'].strip(),
        'description': data.get('description', '').strip(),
        'priority': priority,
        'category': category,
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    
    todos.append(new_todo)
    next_id += 1
    
    return create_response(201, "任务创建成功", new_todo)


@app.route('/api/todos/<int:todo_id>/toggle', methods=['PUT'])
def toggle_todo(todo_id):
    """
    切换任务完成状态
    
    Args:
        todo_id: 任务ID
    """
    # 查找任务
    todo = next((t for t in todos if t['id'] == todo_id), None)
    
    if not todo:
        return create_response(404, f"任务 ID {todo_id} 不存在")
    
    # 切换完成状态
    todo['completed'] = not todo['completed']
    
    return create_response(200, "任务状态更新成功", {
        'id': todo['id'],
        'completed': todo['completed']
    })


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """
    删除任务
    
    Args:
        todo_id: 任务ID
    """
    global todos
    
    # 查找任务索引
    todo_index = next((i for i, t in enumerate(todos) if t['id'] == todo_id), None)
    
    if todo_index is None:
        return create_response(404, f"任务 ID {todo_id} 不存在")
    
    # 删除任务
    todos.pop(todo_index)
    
    return create_response(200, "任务删除成功")


@app.route('/api/todos/stats', methods=['GET'])
def get_stats():
    """
    获取任务统计信息
    
    Returns:
        - total: 任务总数
        - completed: 已完成数
        - pending: 未完成数
        - completion_rate: 完成率（百分比）
    """
    total = len(todos)
    completed = sum(1 for t in todos if t['completed'])
    pending = total - completed
    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0
    
    stats = {
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_rate': completion_rate
    }
    
    return create_response(200, "success", stats)


@app.errorhandler(404)
def not_found(error):
    """处理404错误"""
    return create_response(404, "API路径不存在")


@app.errorhandler(500)
def internal_error(error):
    """处理500错误"""
    return create_response(500, "服务器内部错误")


if __name__ == '__main__':
    print("=" * 50)
    print("TodoList API 服务启动")
    print("访问地址: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='localhost', port=5000)
