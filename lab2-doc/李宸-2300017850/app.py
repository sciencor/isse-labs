from flask import Flask, request, jsonify

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

to_do_list = TodoList()
app = Flask(__name__)

@app.route("/add", methods=["POST"])
def add_todo():
    data = request.get_json()
    task = data['task']
    if not task:
        return jsonify({"error":"cannot find task"})
    result = to_do_list.add_item(task)
    return jsonify(result)

@app.route("/todos", methods=["GET"])
def get_todo():
    items = to_do_list.get_items()
    return jsonify(items)

@app.route("/update/<int:id>", methods=["PUT"])
def update_todo(id):
    data = request.get_json()
    task = data['task']
    if not task:
        return jsonify({"error":"cannot find task"})
    result = to_do_list.update_item(id, task)
    return jsonify(result)

@app.route('/remove/<int:id>', methods=['DELETE'])
def remove_todo(id):
    return jsonify(to_do_list.remove_item(id))

if __name__ == '__main__':
    app.run(debug=True)