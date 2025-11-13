from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict

class TodoList(BaseModel):
    todos: Dict[int, str] = {}
    counter: int = 1

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
    
class Category(BaseModel):
    id: int
    task: str

class Task(BaseModel):
    task: str

app = FastAPI()
todo_list = TodoList()


@app.get("/get_items", response_model=Dict[int, str])
async def get_items():
    return todo_list.get_items()

@app.post("/add_item", response_model=Category)
async def add_item(task: Task):
    return todo_list.add_item(task.task)

@app.put("/edit_item", response_model=Dict[int, str])
async def edit_item(id: int, task: Task):
    return todo_list.update_item(id, task.task)

@app.delete("/delete_item", response_model=None | str)
async def delete_item(id: int):
    return todo_list.remove_item(id)
