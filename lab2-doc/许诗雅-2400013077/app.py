"""
做一个TodoList增加、删除、查询、更新的API服务，好心的助教已经帮你把类方法写好了，你只需要：
1. 用 Flask 将类方法封装为 API 接口
2. 编写 API 使用文档（endpoint、参数、返回值说明）
"""

from flask import Flask, request, jsonify

class TodoListApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.todos = {}
        self.counter = 1
    def run(self):
        @self.app.route('/')
        def index():
            return 'Hello, This is todoList!'

        @self.app.route("/get", methods=["GET"])
        def get_items():
            return jsonify(self.todos)

        @self.app.route("/add", methods=["POST"])
        def add_item():
            task = request.json["task"]
            self.todos[self.counter] = task
            self.counter += 1
            return jsonify({"id": self.counter - 1, "task": task})
        
        @self.app.route("/remove/<int:id>", methods=["DELETE"])
        def remove_item(id):
            if id in self.todos:
                return jsonify({"status":"delete succeed", "task":self.todos.pop(id)})
            return jsonify({"status":"delete fail"})

        @self.app.route("/update/<int:id>", methods=["PUT"])
        def update_item(id):
            task = request.json["task"]
            if id in self.todos:
                self.todos[id] = task
                return jsonify({"status":"update succeed",str(id): task})
            return jsonify({"status":"update fail"})
        self.app.run(debug=True)

if __name__ == "__main__":
    app = TodoListApp()
    app.run()
    

