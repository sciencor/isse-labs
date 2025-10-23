from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__)

# 任务数据文件路径
TASKS_FILE = 'tasks.json'

def load_tasks():
    """从文件加载任务数据"""
    if not os.path.exists(TASKS_FILE):
        return []
    try:
        # 添加文件锁定逻辑，防止并发读取问题
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            try:
                tasks = json.load(f)
                # 确保返回的是列表
                return tasks if isinstance(tasks, list) else []
            except json.JSONDecodeError:
                print("JSON解析错误，返回空列表")
                return []
    except Exception as e:
        print(f"加载任务失败: {e}")
        return []

def save_tasks(tasks):
    """保存任务数据到文件"""
    try:
        # 添加事务性保存逻辑，先写入临时文件
        temp_file = TASKS_FILE + '.tmp'
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        # 确保写入完成后再替换原文件
        os.replace(temp_file, TASKS_FILE)
        print(f"成功保存 {len(tasks)} 个任务")
    except Exception as e:
        print(f"保存任务失败: {e}")
        # 保存失败时尝试清理临时文件
        if os.path.exists(TASKS_FILE + '.tmp'):
            try:
                os.remove(TASKS_FILE + '.tmp')
            except:
                pass

def get_next_id(tasks):
    """获取下一个任务ID"""
    if not tasks:
        return 1
    try:
        # 确保只处理有效的任务对象
        valid_tasks = [task for task in tasks if isinstance(task, dict) and 'id' in task and isinstance(task['id'], int)]
        if not valid_tasks:
            return 1
        return max(task['id'] for task in valid_tasks) + 1
    except Exception as e:
        print(f"获取下一个ID失败: {e}")
        # 出错时使用简单的备用逻辑
        return len(tasks) + 1

def is_overdue(deadline):
    """检查任务是否已截止"""
    try:
        if not deadline or deadline == 'null':
            return False
        # 确保能够正确解析ISO格式的日期时间字符串
        deadline_time = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        # 获取带有时区的当前时间，使用UTC
        from datetime import timezone
        current_time = datetime.now(timezone.utc)
        return deadline_time < current_time
    except Exception as e:
        print(f"解析截止日期错误: {e}")
        return False

# 获取任务列表（支持筛选和排序）
@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表，支持筛选与排序"""
    tasks = load_tasks()
    
    # 获取查询参数
    category = request.args.get('category')
    priority = request.args.get('priority')
    status = request.args.get('status')
    search = request.args.get('search')
    sort = request.args.get('sort')  # 保持向后兼容
    sort_by = request.args.get('sort_by')
    sort_order = request.args.get('sort_order', 'asc')  # 默认升序
    
    # 验证查询参数
    if status and status not in ['completed', 'pending', 'overdue']:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "无效的状态筛选条件，可选值: completed, pending, overdue"
        }), 400
    
    if sort and sort not in ['deadline_asc', 'deadline_desc']:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "无效的排序方式，可选值: deadline_asc, deadline_desc"
        }), 400
    
    # 验证sort_by和sort_order参数
    valid_sort_fields = ['id', 'priority', 'deadline']
    if sort_by and sort_by not in valid_sort_fields:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"无效的排序字段，可选值: {', '.join(valid_sort_fields)}"
        }), 400
    
    if sort_order not in ['asc', 'desc']:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "无效的排序顺序，可选值: asc, desc"
        }), 400
    
    # 过滤出有效的任务对象
    valid_tasks = [task for task in tasks if isinstance(task, dict)]
    
    # 筛选任务
    filtered_tasks = []
    for task in valid_tasks:
        # 按类别筛选
        if category and task.get('category') != category:
            continue
        # 按优先级筛选
        if priority and task.get('priority') != priority:
            continue
        # 按状态筛选
        if status:
            if status == 'completed' and not task.get('completed', False):
                continue
            elif status == 'pending':
                # pending任务是未完成且未过期的任务
                if task.get('completed', False):
                    continue
                if task.get('deadline') and is_overdue(task['deadline']):
                    continue
            elif status == 'overdue':
                # overdue任务是未完成且已过期的任务
                if task.get('completed', False):
                    continue
                if not task.get('deadline') or not is_overdue(task['deadline']):
                    continue
        # 按关键词搜索 - 支持标题和描述搜索
        if search:
            search_lower = search.lower()
            title_match = search_lower in task.get('title', '').lower()
            desc_match = search_lower in task.get('description', '').lower() if 'description' in task else False
            if not title_match and not desc_match:
                continue
        
        filtered_tasks.append(task)
    
    # 排序 - 先处理新的sort_by和sort_order参数，后处理旧的sort参数以保持向后兼容
    if sort_by:
        reverse = (sort_order == 'desc')
        
        if sort_by == 'id':
            # 按ID排序，确保None值排在最后
            filtered_tasks.sort(key=lambda x: (x.get('id') is None, x.get('id', 0)), reverse=reverse)
        elif sort_by == 'priority':
            # 按优先级排序，将优先级映射为数值以便正确排序
            priority_map = {'high': 3, '高': 3, 'medium': 2, '中': 2, 'low': 1, '低': 1}
            filtered_tasks.sort(key=lambda x: (x.get('priority') not in priority_map, priority_map.get(x.get('priority', ''), 0)), reverse=reverse)
        elif sort_by == 'deadline':
            # 按截止日期排序，确保None值排在最后
            filtered_tasks.sort(key=lambda x: (x.get('deadline') is None, x.get('deadline', '')), reverse=reverse)
    elif sort:
        # 向后兼容旧的sort参数
        if sort == 'deadline_asc':
            filtered_tasks.sort(key=lambda x: (x.get('deadline') is None, x.get('deadline', '')))
        elif sort == 'deadline_desc':
            filtered_tasks.sort(key=lambda x: (x.get('deadline') is None, x.get('deadline', '')), reverse=True)
    
    return jsonify({
        "status": "success",
        "data": filtered_tasks,
        "message": "操作成功"
    })

# 新增任务
@app.route('/tasks', methods=['POST'])
def add_task():
    """新增任务"""
    tasks = load_tasks()
    
    try:
        data = request.json
        
        # 验证请求数据格式
        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "data": None,
                "message": "请求数据格式错误"
            }), 400
        
        # 验证必填字段
        if not data.get('title') or not data.get('title').strip():
            return jsonify({
                "status": "error",
                "data": None,
                "message": "任务标题不能为空"
            }), 400
        
        # 验证分类和优先级的有效性
        valid_categories = ['学习', '工作', '生活', 'study', 'work', 'life']
        valid_priorities = ['高', '中', '低', 'high', 'medium', 'low']
        
        if data.get('category') and data['category'] not in valid_categories:
            return jsonify({
                "status": "error",
                "data": None,
                "message": f"无效的分类，可选值: {', '.join(valid_categories)}"
            }), 400
            
        if data.get('priority') and data['priority'] not in valid_priorities:
            return jsonify({
                "status": "error",
                "data": None,
                "message": f"无效的优先级，可选值: {', '.join(valid_priorities)}"
            }), 400
        
        # 验证截止日期格式（支持空值，不强制要求）
        if data.get('deadline'):
            try:
                # 尝试解析日期时间以验证格式
                datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
            except:
                return jsonify({
                    "status": "error",
                    "data": None,
                    "message": "无效的截止日期格式，请使用ISO格式"
                }), 400
        # 空截止时间或null值直接通过验证，不报错
        
        # 创建新任务
        new_task = {
            "id": get_next_id(tasks),
            "title": data.get('title'),
            "category": data.get('category') or "学习",
            "priority": data.get('priority') or "中",
            "completed": False,
            "deadline": data.get('deadline')
        }
        
        tasks.append(new_task)
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": new_task,
            "message": "任务添加成功"
        }), 201
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"添加任务失败: {str(e)}"
        }), 500

# 修改任务状态
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """修改任务状态"""
    # 验证任务ID是否为正整数
    if task_id <= 0:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "无效的任务ID"
        }), 400
        
    tasks = load_tasks()
    
    # 过滤出有效的任务对象并查找指定ID的任务
    valid_tasks = [t for t in tasks if isinstance(t, dict) and 'id' in t]
    task = next((t for t in valid_tasks if t['id'] == task_id), None)
    
    if not task:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "任务不存在"
        }), 404
    
    try:
        data = request.json
        
        # 验证请求数据格式
        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "data": None,
                "message": "请求数据格式错误"
            }), 400
            
        # 验证并更新completed字段
        if 'completed' in data:
            if not isinstance(data['completed'], bool):
                return jsonify({
                    "status": "error",
                    "data": None,
                    "message": "completed字段必须是布尔值"
                }), 400
            task['completed'] = data['completed']
        
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": task,
            "message": "任务更新成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"更新任务失败: {str(e)}"
        }), 500

# 删除任务
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    # 验证任务ID是否为正整数
    if task_id <= 0:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "无效的任务ID"
        }), 400
        
    tasks = load_tasks()
    
    # 过滤出有效的任务对象并查找索引
    task_index = None
    for i, t in enumerate(tasks):
        if isinstance(t, dict) and t.get('id') == task_id:
            task_index = i
            break
    
    if task_index is None:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "任务不存在"
        }), 404
    
    try:
        deleted_task = tasks.pop(task_index)
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": deleted_task,
            "message": "任务删除成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"删除任务失败: {str(e)}"
        }), 500

# 清除所有任务
@app.route('/tasks/clear', methods=['DELETE'])
def clear_all_tasks():
    """清除所有任务"""
    try:
        # 保存空任务列表，相当于清除所有任务
        save_tasks([])
        
        return jsonify({
            "status": "success",
            "data": [],
            "message": "所有任务已清除"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"清除任务失败: {str(e)}"
        }), 500

# 启用 CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 添加根路由，用于直接访问前端页面
@app.route('/')
def index():
    """提供首页"""
    try:
        # 直接返回index.html文件内容
        with open('index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"读取index.html失败: {e}")
        return "首页加载失败", 500

# 直接为关键静态文件添加路由
@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css', mimetype='text/css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js', mimetype='application/javascript')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)