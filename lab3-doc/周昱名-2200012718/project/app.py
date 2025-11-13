from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 模拟数据存储
tasks_data = []
next_id = 1

# 数据文件路径
DATA_FILE = 'tasks.json'

def load_tasks():
    """从文件加载任务数据"""
    global tasks_data, next_id
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)
                if tasks_data:
                    next_id = max(task['id'] for task in tasks_data) + 1
                else:
                    next_id = 1
    except Exception as e:
        print(f"加载数据失败: {e}")
        tasks_data = []
        next_id = 1

def save_tasks():
    """保存任务数据到文件"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"保存数据失败: {e}")

# 启动时加载数据
load_tasks()

def create_response(data=None, message="", status="success"):
    """创建统一格式的响应"""
    return {
        "status": status,
        "data": data,
        "message": message
    }

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表，支持筛选"""
    try:
        category = request.args.get('category')
        priority = request.args.get('priority')
        
        filtered_tasks = tasks_data.copy()
        
        # 按类别筛选
        if category:
            filtered_tasks = [task for task in filtered_tasks if task['category'] == category]
        
        # 按优先级筛选
        if priority:
            filtered_tasks = [task for task in filtered_tasks if task['priority'] == priority]
        
        return jsonify(create_response(data=filtered_tasks, message="获取任务列表成功"))
    except Exception as e:
        return jsonify(create_response(message=f"获取任务失败: {str(e)}", status="error")), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    """添加新任务"""
    global next_id
    try:
        data = request.get_json()
        
        # 验证必需字段
        if not data or not data.get('title'):
            return jsonify(create_response(message="任务标题不能为空", status="error")), 400
        
        # 创建新任务
        new_task = {
            "id": next_id,
            "title": data['title'],
            "category": data.get('category', '生活'),
            "priority": data.get('priority', '中'),
            "completed": False
        }
        
        # 验证类别和优先级
        valid_categories = ['学习', '工作', '生活']
        valid_priorities = ['高', '中', '低']
        
        if new_task['category'] not in valid_categories:
            return jsonify(create_response(message=f"无效的类别，必须是: {', '.join(valid_categories)}", status="error")), 400
        
        if new_task['priority'] not in valid_priorities:
            return jsonify(create_response(message=f"无效的优先级，必须是: {', '.join(valid_priorities)}", status="error")), 400
        
        tasks_data.append(new_task)
        next_id += 1
        
        save_tasks()  # 保存到文件
        
        return jsonify(create_response(data=new_task, message="任务添加成功"))
    except Exception as e:
        return jsonify(create_response(message=f"添加任务失败: {str(e)}", status="error")), 500

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """更新任务状态"""
    try:
        data = request.get_json()
        
        # 查找任务
        task = next((t for t in tasks_data if t['id'] == task_id), None)
        if not task:
            return jsonify(create_response(message="任务不存在", status="error")), 404
        
        # 更新字段
        if 'completed' in data:
            task['completed'] = data['completed']
        if 'title' in data:
            task['title'] = data['title']
        if 'category' in data:
            task['category'] = data['category']
        if 'priority' in data:
            task['priority'] = data['priority']
        
        save_tasks()  # 保存到文件
        
        return jsonify(create_response(data=task, message="任务更新成功"))
    except Exception as e:
        return jsonify(create_response(message=f"更新任务失败: {str(e)}", status="error")), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    try:
        global tasks_data
        
        # 查找任务索引
        task_index = next((i for i, t in enumerate(tasks_data) if t['id'] == task_id), -1)
        if task_index == -1:
            return jsonify(create_response(message="任务不存在", status="error")), 404
        
        # 删除任务
        deleted_task = tasks_data.pop(task_index)
        save_tasks()  # 保存到文件
        
        return jsonify(create_response(data=deleted_task, message="任务删除成功"))
    except Exception as e:
        return jsonify(create_response(message=f"删除任务失败: {str(e)}", status="error")), 500

@app.route('/tasks/stats', methods=['GET'])
def get_stats():
    """获取任务统计信息"""
    try:
        total = len(tasks_data)
        completed = sum(1 for task in tasks_data if task['completed'])
        pending = total - completed
        
        # 按类别统计
        category_stats = {}
        for task in tasks_data:
            category = task['category']
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'completed': 0}
            category_stats[category]['total'] += 1
            if task['completed']:
                category_stats[category]['completed'] += 1
        
        # 按优先级统计
        priority_stats = {}
        for task in tasks_data:
            priority = task['priority']
            if priority not in priority_stats:
                priority_stats[priority] = {'total': 0, 'completed': 0}
            priority_stats[priority]['total'] += 1
            if task['completed']:
                priority_stats[priority]['completed'] += 1
        
        stats = {
            'total': total,
            'completed': completed,
            'pending': pending,
            'categories': category_stats,
            'priorities': priority_stats
        }
        
        return jsonify(create_response(data=stats, message="统计信息获取成功"))
    except Exception as e:
        return jsonify(create_response(message=f"获取统计信息失败: {str(e)}", status="error")), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    