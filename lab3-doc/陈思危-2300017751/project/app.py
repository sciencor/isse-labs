from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
import json
import os
from dateutil import parser

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
    # 支持按分类、优先级、重要程度、状态筛选
    category = request.args.get('category')
    priority = request.args.get('priority')
    importance = request.args.get('importance')
    status = request.args.get('status')  # 'completed', 'pending', 'overdue'
    sort_by = request.args.get('sort_by', 'created_at')  # 排序字段
    sort_order = request.args.get('sort_order', 'desc')  # 排序方向
    
    filtered_todos = todos
    
    # 筛选条件
    if category:
        filtered_todos = [todo for todo in filtered_todos if todo.get('category') == category]
    
    if priority:
        filtered_todos = [todo for todo in filtered_todos if todo.get('priority') == priority]
    
    if importance:
        filtered_todos = [todo for todo in filtered_todos if todo.get('importance') == importance]
    
    if status:
        now = datetime.now().date()
        if status == 'completed':
            filtered_todos = [todo for todo in filtered_todos if todo.get('completed', False)]
        elif status == 'pending':
            filtered_todos = [todo for todo in filtered_todos if not todo.get('completed', False)]
        elif status == 'overdue':
            filtered_todos = [todo for todo in filtered_todos 
                            if not todo.get('completed', False) and 
                            todo.get('deadline') and 
                            parser.parse(todo['deadline']).date() < now]
    
    # 排序逻辑
    def get_sort_key(todo):
        if sort_by == 'priority':
            priority_order = {'high': 3, 'medium': 2, 'low': 1}
            return priority_order.get(todo.get('priority', 'low'), 1)
        elif sort_by == 'importance':
            importance_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
            return importance_order.get(todo.get('importance', 'low'), 1)
        elif sort_by == 'deadline':
            deadline = todo.get('deadline')
            if deadline:
                try:
                    return parser.parse(deadline)
                except:
                    return datetime.min
            return datetime.max  # 没有截止日期的排在最后
        elif sort_by == 'created_at':
            return parser.parse(todo.get('created_at', '1970-01-01'))
        elif sort_by == 'updated_at':
            return parser.parse(todo.get('updated_at', '1970-01-01'))
        elif sort_by == 'title':
            return todo.get('title', '').lower()
        else:
            return 0
    
    reverse = sort_order == 'desc'
    filtered_todos.sort(key=get_sort_key, reverse=reverse)
    
    # 添加状态标记
    now = datetime.now().date()
    for todo in filtered_todos:
        if todo.get('deadline'):
            try:
                deadline_date = parser.parse(todo['deadline']).date()
                if not todo.get('completed', False):
                    if deadline_date < now:
                        todo['status'] = 'overdue'
                    elif deadline_date == now:
                        todo['status'] = 'due_today'
                    elif (deadline_date - now).days <= 3:
                        todo['status'] = 'due_soon'
                    else:
                        todo['status'] = 'pending'
                else:
                    todo['status'] = 'completed'
            except:
                todo['status'] = 'pending'
        else:
            todo['status'] = 'completed' if todo.get('completed', False) else 'pending'
    
    return jsonify(filtered_todos)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """创建新的todo"""
    global next_id
    
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': '标题不能为空'}), 400
    
    # 验证截止日期格式
    deadline = data.get('deadline')
    if deadline:
        try:
            # 验证日期格式
            parser.parse(deadline)
        except ValueError:
            return jsonify({'error': '截止日期格式不正确，请使用 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS 格式'}), 400
    
    todo = {
        'id': next_id,
        'title': data['title'],
        'description': data.get('description', ''),
        'completed': False,
        'priority': data.get('priority', 'low'),  # high, medium, low
        'importance': data.get('importance', 'low'),  # critical, high, medium, low
        'category': data.get('category', '默认'),
        'deadline': deadline,  # 截止日期
        'tags': data.get('tags', []),  # 标签列表
        'estimated_time': data.get('estimated_time'),  # 预估完成时间（小时）
        'actual_time': data.get('actual_time'),  # 实际完成时间（小时）
        'notes': data.get('notes', ''),  # 备注
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
    
    # 验证截止日期格式
    deadline = data.get('deadline')
    if deadline:
        try:
            parser.parse(deadline)
        except ValueError:
            return jsonify({'error': '截止日期格式不正确，请使用 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS 格式'}), 400
    
    for todo in todos:
        if todo['id'] == todo_id:
            todo['title'] = data.get('title', todo['title'])
            todo['description'] = data.get('description', todo['description'])
            todo['completed'] = data.get('completed', todo['completed'])
            todo['priority'] = data.get('priority', todo['priority'])
            todo['importance'] = data.get('importance', todo.get('importance', 'low'))
            todo['category'] = data.get('category', todo['category'])
            if 'deadline' in data:
                todo['deadline'] = data['deadline']
            if 'tags' in data:
                todo['tags'] = data['tags']
            if 'estimated_time' in data:
                todo['estimated_time'] = data['estimated_time']
            if 'actual_time' in data:
                todo['actual_time'] = data['actual_time']
            if 'notes' in data:
                todo['notes'] = data['notes']
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

@app.route('/api/tags', methods=['GET'])
def get_tags():
    """获取所有标签"""
    all_tags = set()
    for todo in todos:
        tags = todo.get('tags', [])
        if isinstance(tags, list):
            all_tags.update(tags)
    return jsonify(list(all_tags))

@app.route('/api/todos/overdue', methods=['GET'])
def get_overdue_todos():
    """获取过期的todos"""
    now = datetime.now().date()
    overdue_todos = []
    
    for todo in todos:
        if (not todo.get('completed', False) and 
            todo.get('deadline') and 
            parser.parse(todo['deadline']).date() < now):
            overdue_todos.append(todo)
    
    return jsonify(overdue_todos)

@app.route('/api/todos/due-today', methods=['GET'])
def get_due_today_todos():
    """获取今天到期的todos"""
    today = datetime.now().date()
    due_today_todos = []
    
    for todo in todos:
        if (not todo.get('completed', False) and 
            todo.get('deadline') and 
            parser.parse(todo['deadline']).date() == today):
            due_today_todos.append(todo)
    
    return jsonify(due_today_todos)

@app.route('/api/todos/due-soon', methods=['GET'])
def get_due_soon_todos():
    """获取即将到期的todos（3天内）"""
    now = datetime.now().date()
    due_soon_todos = []
    
    for todo in todos:
        if (not todo.get('completed', False) and 
            todo.get('deadline')):
            deadline_date = parser.parse(todo['deadline']).date()
            days_left = (deadline_date - now).days
            if 0 < days_left <= 3:
                due_soon_todos.append(todo)
    
    return jsonify(due_soon_todos)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    total = len(todos)
    completed = sum(1 for todo in todos if todo['completed'])
    pending = total - completed
    
    # 优先级统计
    priority_stats = {
        'high': sum(1 for todo in todos if todo.get('priority') == 'high'),
        'medium': sum(1 for todo in todos if todo.get('priority') == 'medium'),
        'low': sum(1 for todo in todos if todo.get('priority') == 'low')
    }
    
    # 重要程度统计
    importance_stats = {
        'critical': sum(1 for todo in todos if todo.get('importance') == 'critical'),
        'high': sum(1 for todo in todos if todo.get('importance') == 'high'),
        'medium': sum(1 for todo in todos if todo.get('importance') == 'medium'),
        'low': sum(1 for todo in todos if todo.get('importance') == 'low')
    }
    
    # 截止日期统计
    now = datetime.now().date()
    overdue = 0
    due_today = 0
    due_soon = 0
    
    for todo in todos:
        if not todo.get('completed', False) and todo.get('deadline'):
            try:
                deadline_date = parser.parse(todo['deadline']).date()
                if deadline_date < now:
                    overdue += 1
                elif deadline_date == now:
                    due_today += 1
                elif (deadline_date - now).days <= 3:
                    due_soon += 1
            except:
                pass
    
    # 分类统计
    category_stats = {}
    for todo in todos:
        category = todo.get('category', '默认')
        category_stats[category] = category_stats.get(category, 0) + 1
    
    # 时间统计
    total_estimated = sum(todo.get('estimated_time', 0) or 0 for todo in todos)
    total_actual = sum(todo.get('actual_time', 0) or 0 for todo in todos if todo.get('completed'))
    
    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'priority_stats': priority_stats,
        'importance_stats': importance_stats,
        'deadline_stats': {
            'overdue': overdue,
            'due_today': due_today,
            'due_soon': due_soon
        },
        'category_stats': category_stats,
        'time_stats': {
            'total_estimated_hours': total_estimated,
            'total_actual_hours': total_actual,
            'efficiency': (total_estimated / total_actual * 100) if total_actual > 0 else 0
        }
    })

@app.route('/api/todos/search', methods=['GET'])
def search_todos():
    """搜索todos"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    
    results = []
    for todo in todos:
        # 搜索标题、描述、标签、备注
        searchable_text = ' '.join([
            todo.get('title', ''),
            todo.get('description', ''),
            todo.get('notes', ''),
            ' '.join(todo.get('tags', []))
        ]).lower()
        
        if query in searchable_text:
            results.append(todo)
    
    return jsonify(results)

@app.route('/api/todos/batch', methods=['PUT'])
def batch_update_todos():
    """批量更新todos"""
    data = request.get_json()
    todo_ids = data.get('ids', [])
    updates = data.get('updates', {})
    
    updated_todos = []
    for todo in todos:
        if todo['id'] in todo_ids:
            for key, value in updates.items():
                if key in ['title', 'description', 'completed', 'priority', 
                          'importance', 'category', 'deadline', 'tags', 
                          'estimated_time', 'actual_time', 'notes']:
                    todo[key] = value
            todo['updated_at'] = datetime.now().isoformat()
            updated_todos.append(todo)
    
    save_todos(todos)
    return jsonify(updated_todos)

@app.route('/api/todos/batch', methods=['DELETE'])
def batch_delete_todos():
    """批量删除todos"""
    data = request.get_json()
    todo_ids = data.get('ids', [])
    
    global todos
    todos = [todo for todo in todos if todo['id'] not in todo_ids]
    save_todos(todos)
    
    return jsonify({'message': f'已删除 {len(todo_ids)} 个任务'})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)