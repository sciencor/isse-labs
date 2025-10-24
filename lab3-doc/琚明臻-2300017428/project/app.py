from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

# 创建Flask应用实例
app = Flask(__name__)

# 启用CORS支持，允许前端跨域访问
CORS(app)

# 模拟数据库 - 使用内存中的列表存储任务
# 每个任务包含：id, title, description, priority, category, completed, created_at, updated_at
tasks = []

# 任务ID计数器，用于生成唯一ID
task_id_counter = 1

def generate_task_id():
    """生成唯一的任务ID"""
    global task_id_counter
    task_id = task_id_counter
    task_id_counter += 1
    return task_id

def find_task_by_id(task_id):
    """根据ID查找任务，返回任务对象和索引"""
    for index, task in enumerate(tasks):
        if task['id'] == task_id:
            return task, index
    return None, -1

def validate_task_data(data, required_fields=None):
    """验证任务数据"""
    if required_fields is None:
        required_fields = ['title', 'description', 'priority', 'category']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"字段 '{field}' 是必需的且不能为空"
    
    # 验证优先级
    if data['priority'] not in ['low', 'medium', 'high']:
        return False, "优先级必须是 'low', 'medium' 或 'high'"
    
    return True, None

@app.route('/tasks', methods=['POST'])
def create_task():
    """
    创建新任务
    接收JSON数据：title, description, priority, category
    返回创建的任务信息
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求体必须包含JSON数据'}), 400
        
        # 验证必需字段
        is_valid, error_msg = validate_task_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # 创建新任务
        task_id = generate_task_id()
        current_time = datetime.now().isoformat()
        
        new_task = {
            'id': task_id,
            'title': data['title'],
            'description': data['description'],
            'priority': data['priority'],
            'category': data['category'],
            'completed': False,
            'created_at': current_time,
            'updated_at': current_time
        }
        
        # 添加到任务列表
        tasks.append(new_task)
        
        return jsonify({
            'message': '任务创建成功',
            'task': new_task
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'创建任务时发生错误: {str(e)}'}), 500

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """
    获取任务列表
    支持查询参数：
    - priority: 按优先级过滤 (low, medium, high)
    - category: 按分类过滤
    返回按ID排序的任务列表
    """
    try:
        # 获取查询参数
        priority_filter = request.args.get('priority')
        category_filter = request.args.get('category')
        
        # 复制任务列表进行过滤
        filtered_tasks = tasks.copy()
        
        # 按优先级过滤
        if priority_filter:
            if priority_filter not in ['low', 'medium', 'high']:
                return jsonify({'error': '优先级参数必须是 low, medium 或 high'}), 400
            filtered_tasks = [task for task in filtered_tasks if task['priority'] == priority_filter]
        
        # 按分类过滤
        if category_filter:
            filtered_tasks = [task for task in filtered_tasks if task['category'].lower() == category_filter.lower()]
        
        # 按ID排序
        filtered_tasks.sort(key=lambda x: x['id'])
        
        return jsonify({
            'message': '获取任务列表成功',
            'tasks': filtered_tasks,
            'total': len(filtered_tasks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取任务列表时发生错误: {str(e)}'}), 500

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """
    更新指定任务
    接收JSON数据：title, description, priority, category, completed
    返回更新后的任务信息
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求体必须包含JSON数据'}), 400
        
        # 查找任务
        task, index = find_task_by_id(task_id)
        if task is None:
            return jsonify({'error': f'任务ID {task_id} 不存在'}), 404
        
        # 验证更新数据
        if 'priority' in data and data['priority'] not in ['low', 'medium', 'high']:
            return jsonify({'error': "优先级必须是 'low', 'medium' 或 'high'"}), 400
        
        # 更新任务字段
        current_time = datetime.now().isoformat()
        
        if 'title' in data:
            task['title'] = data['title']
        if 'description' in data:
            task['description'] = data['description']
        if 'priority' in data:
            task['priority'] = data['priority']
        if 'category' in data:
            task['category'] = data['category']
        if 'completed' in data:
            task['completed'] = bool(data['completed'])
        
        task['updated_at'] = current_time
        
        # 更新任务列表
        tasks[index] = task
        
        return jsonify({
            'message': '任务更新成功',
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'更新任务时发生错误: {str(e)}'}), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    删除指定任务
    根据任务ID删除任务
    """
    try:
        # 查找任务
        task, index = find_task_by_id(task_id)
        if task is None:
            return jsonify({'error': f'任务ID {task_id} 不存在'}), 404
        
        # 删除任务
        deleted_task = tasks.pop(index)
        
        return jsonify({
            'message': '任务删除成功',
            'deleted_task': deleted_task
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'删除任务时发生错误: {str(e)}'}), 500

@app.route('/tasks/<int:task_id>/complete', methods=['PATCH'])
def toggle_task_completion(task_id):
    """
    切换任务的完成状态
    如果任务已完成，则标记为未完成；如果未完成，则标记为已完成
    """
    try:
        # 查找任务
        task, index = find_task_by_id(task_id)
        if task is None:
            return jsonify({'error': f'任务ID {task_id} 不存在'}), 404
        
        # 切换完成状态
        task['completed'] = not task['completed']
        task['updated_at'] = datetime.now().isoformat()
        
        # 更新任务列表
        tasks[index] = task
        
        status = "已完成" if task['completed'] else "未完成"
        
        return jsonify({
            'message': f'任务状态已切换为{status}',
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'切换任务状态时发生错误: {str(e)}'}), 500

@app.route('/tasks/stats', methods=['GET'])
def get_task_stats():
    """
    获取任务统计信息
    返回总任务数、已完成任务数、未完成任务数等统计信息
    """
    try:
        total_tasks = len(tasks)
        completed_tasks = len([task for task in tasks if task['completed']])
        pending_tasks = total_tasks - completed_tasks
        
        # 按优先级统计
        priority_stats = {
            'low': len([task for task in tasks if task['priority'] == 'low']),
            'medium': len([task for task in tasks if task['priority'] == 'medium']),
            'high': len([task for task in tasks if task['priority'] == 'high'])
        }
        
        return jsonify({
            'message': '获取统计信息成功',
            'stats': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
                'completion_rate': round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0,
                'priority_distribution': priority_stats
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取统计信息时发生错误: {str(e)}'}), 500

@app.route('/', methods=['GET'])
def home():
    """根路径，返回API信息"""
    return jsonify({
        'message': 'ToDoList API 服务正在运行',
        'version': '1.0.0',
        'endpoints': {
            'POST /tasks': '创建新任务',
            'GET /tasks': '获取任务列表（支持priority和category过滤）',
            'PUT /tasks/<id>': '更新指定任务',
            'DELETE /tasks/<id>': '删除指定任务',
            'PATCH /tasks/<id>/complete': '切换任务完成状态',
            'GET /tasks/stats': '获取任务统计信息'
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    """处理404错误"""
    return jsonify({'error': '请求的资源不存在'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """处理405错误"""
    return jsonify({'error': '请求方法不被允许'}), 405

@app.errorhandler(500)
def internal_error(error):
    """处理500错误"""
    return jsonify({'error': '服务器内部错误'}), 500

if __name__ == '__main__':
    # 启动Flask开发服务器
    print("启动ToDoList API服务...")
    print("服务地址: http://localhost:5000")
    print("API文档: http://localhost:5000")
    print("按 Ctrl+C 停止服务")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
