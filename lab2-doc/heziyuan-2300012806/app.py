#这里是将TodoList类函数改为api服务的脚本文件
from flask import Flask, request, jsonify
from typing import Dict, Any, Optional

class TodoList:
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task: str) -> Dict[str, Any]:
        """添加待办事项"""
        self.todos[self.counter] = task
        self.counter += 1
        return {"id": self.counter - 1, "task": task}

    def remove_item(self, id: int) -> Optional[str]:
        """删除待办事项"""
        if id in self.todos:
            return self.todos.pop(id)
        return None

    def get_items(self) -> Dict[int, str]:
        """获取所有待办事项"""
        return self.todos

    def update_item(self, id: int, task: str) -> Optional[Dict[int, str]]:
        """更新待办事项"""
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None

# 创建 Flask 应用
app = Flask(__name__)
todo_list = TodoList()

@app.route('/')
def index():
    """API 首页"""
    return jsonify({
        "message": "TodoList API 服务",
        "endpoints": {
            "GET /todos": "获取所有待办事项",
            "POST /todos": "添加新的待办事项",
            "PUT /todos/<id>": "更新待办事项",
            "DELETE /todos/<id>": "删除待办事项"
        }
    })

@app.route('/todos', methods=['GET'])
def get_todos():
    """获取所有待办事项"""
    try:
        todos = todo_list.get_items()
        return jsonify({
            "status": "success",
            "count": len(todos),
            "todos": todos
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/todos', methods=['POST'])
def add_todo():
    """添加新的待办事项"""
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({
                "status": "error",
                "message": "缺少 task 参数"
            }), 400
        
        task = data['task'].strip()
        if not task:
            return jsonify({
                "status": "error",
                "message": "task 不能为空"
            }), 400
        
        result = todo_list.add_item(task)
        return jsonify({
            "status": "success",
            "message": "待办事项添加成功",
            "todo": result
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """更新待办事项"""
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({
                "status": "error",
                "message": "缺少 task 参数"
            }), 400
        
        task = data['task'].strip()
        if not task:
            return jsonify({
                "status": "error",
                "message": "task 不能为空"
            }), 400
        
        result = todo_list.update_item(todo_id, task)
        if result is None:
            return jsonify({
                "status": "error",
                "message": f"ID {todo_id} 的待办事项不存在"
            }), 404
        
        return jsonify({
            "status": "success",
            "message": "待办事项更新成功",
            "todo": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除待办事项"""
    try:
        result = todo_list.remove_item(todo_id)
        if result is None:
            return jsonify({
                "status": "error",
                "message": f"ID {todo_id} 的待办事项不存在"
            }), 404
        
        return jsonify({
            "status": "success",
            "message": "待办事项删除成功",
            "deleted_task": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """处理 404 错误"""
    return jsonify({
        "status": "error",
        "message": "端点不存在"
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """处理 405 错误"""
    return jsonify({
        "status": "error",
        "message": "请求方法不允许"
    }), 405

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)