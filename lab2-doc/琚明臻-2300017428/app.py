from flask import Flask, request, jsonify
app = Flask(__name__)

class TodoList:
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task):
        self.todos[self.counter] = task
        self.counter += 1
        return {"id": self.counter - 1, "task": task}

    def remove_item(self, id):
        if id in self.todos:
            return self.todos.pop(id)
        return None

    def get_items(self):
        return self.todos

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None

todo_list = TodoList()

@app.route("/todos", methods=["GET"])
def get_items():
    return jsonify(todo_list.get_items())
    
@app.route("/add", methods=["POST"])
def add_item():
    task = request.json.get("task")
    return jsonify(todo_list.add_item(task))
    
@app.route("/delete/<int:id>", methods=["DELETE"])
def remove_item(id):
    if id in todo_list.todos:
        deleted_task = todo_list.todos.pop(id)
        return jsonify({"id": id, "deleted": deleted_task})
    return jsonify({"error": "未找到该任务"})
    
@app.route("/update/<int:id>", methods=["PUT"])
def update_item(id):
    task = request.json.get("task")
    return jsonify(todo_list.update_item(id, task))

if __name__ == "__main__":
    app.run(debug=True)