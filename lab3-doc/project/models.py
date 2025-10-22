import os
import json

class TodoList:
    def __init__(self, storage_path=None):
        self.storage_path = storage_path or os.path.join(os.path.dirname(__file__), "database.json")
        self._load()

    def _load(self):
        if os.path.exists(self.storage_path):
            with open(self.storage_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                # 存储时用字符串 key，读取时转为 int
                self.todos = {int(k): v for k, v in data.get("todos", {}).items()}
                self.counter = data.get("counter", max(self.todos.keys()) + 1 if self.todos else 1)
        else:
            self.todos = {}
            self.counter = 1
            self._save()

    def _save(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump({"todos": self.todos, "counter": self.counter}, f, ensure_ascii=False, indent=2)

    def add_item(self, task, priority="normal", category="default"):
        item = {
            "id": self.counter,
            "task": task,
            "completed": False,
            "priority": priority,
            "category": category
        }
        self.todos[self.counter] = item
        self.counter += 1
        self._save()
        return item

    def remove_item(self, id):
        id = int(id)
        item = self.todos.pop(id, None)
        if item:
            self._save()
        return item

    def get_items(self, priority=None, category=None, completed=None):
        results = list(self.todos.values())
        if priority is not None:
            results = [i for i in results if i.get("priority") == priority]
        if category is not None:
            results = [i for i in results if i.get("category") == category]
        if completed is not None:
            results = [i for i in results if i.get("completed") is completed]
        return results

    def get_item(self, id):
        return self.todos.get(int(id))

    def update_item(self, id, task=None, priority=None, category=None, completed=None):
        id = int(id)
        item = self.todos.get(id)
        if not item:
            return None
        if task is not None:
            item["task"] = task
        if priority is not None:
            item["priority"] = priority
        if category is not None:
            item["category"] = category
        if completed is not None:
            item["completed"] = bool(completed)
        self.todos[id] = item
        self._save()
        return item

    def toggle_item(self, id):
        id = int(id)
        item = self.todos.get(id)
        if not item:
            return None
        item["completed"] = not item["completed"]
        self._save()
        return item

    def progress(self):
        total = len(self.todos)
        done = sum(1 for i in self.todos.values() if i.get("completed"))
        percent = round((done / total * 100) if total > 0 else 0, 2)
        return {"total": total, "completed": done, "percent": percent}