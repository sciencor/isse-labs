from flask import Flask, request, jsonify
from todo import TodoList

todos = TodoList()


app = Flask(__name__)


@app.route("/hello", methods=["GET"])
def hello():
    return jsonify({"msg": "Hello from API-Based todo"})


@app.route("/add", methods=["POST"])
def add():
    data = request.json
    if data.get("task"):
        res = todos.add_item(data.get("task"))
        res["msg"] = "Task added"
        print(f"Task added: {res}")
        return jsonify(res)
    else:
        res = {}
        res["msg"] = "Task is required"
        res["task"] = ""
        res["id"] = -1
        print(f"Task is required: {res}")
        return jsonify({"msg": "Task is required"})


@app.route("/delete", methods=["POST"])
def delete():
    data = request.json
    if data.get("id"):
        res = {}
        deleted_task = todos.remove_item(data.get("id"))
        if deleted_task:
            res["msg"] = "Task deleted"
            res["task"] = deleted_task
        else:
            res = {}
            res["msg"] = "Task not found"
            res["task"] = ""
            print(f"Task not found: {res}")

        print(f"Task deleted: {res}")
        return jsonify(res)
    else:
        res = {}
        res["msg"] = "Id is required"
        res["task"] = ""
        print(f"Id is required: {res}")
        return jsonify(res)


@app.route("/update", methods=["PUT"])
def update():
    data = request.json
    if data.get("id") and data.get("task"):
        res = todos.update_item(data.get("id"), data.get("task"))
        if res:
            refined_res = {}
            for key in res.keys():
                if isinstance(key, int):
                    val = res[key]
                    refined_res[str(key)] = val
                else:
                    refined_res[key] = res[key]

            res = refined_res
            res["msg"] = "Task updated"
            print(f"Task updated: {res}")
        else:
            res = {}
            res["msg"] = "Task not found"
            print(f"Task not found: {res}")
        return jsonify(res)
    else:
        res = {}
        res["msg"] = "Id and task are required"
        print(f"Id and task are required: {res}")

        return jsonify(res)


@app.route("/todo", methods=["GET"])
def get():
    res = todos.get_items()
    refined_res = {}
    for key in res.keys():
        if isinstance(key, int):
            val = res[key]
            refined_res[str(key)] = val
        else:
            refined_res[key] = res[key]

    res = refined_res

    res["msg"] = "Tasks fetched"
    res["count"] = todos.counter - 1
    print(f"Tasks fetched: {res}")
    return jsonify(res)


if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=9879,
    )
