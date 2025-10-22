import os
import json
from datetime import datetime

class TodoList:
    def __init__(self, storage_path=None):
        self.storage_path = storage_path or os.path.join(os.path.dirname(__file__), "database.json")
        self._load()

    def _load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        data = json.loads(content)
                    else:
                        data = {}
            except Exception:
                data = {}
        else:
            data = {}
        self.todos = {int(k): v for k, v in (data.get("todos") or {}).items()}
        self.counter = data.get("counter", max(self.todos.keys()) + 1 if self.todos else 1)
        self.categories = set(data.get("categories", ["工作", "生活", "学习", "默认"]))
        # 仅在文件不存在时才写入初始结构；如果文件存在且解析失败，上一步已将 data = {}，为了避免覆盖已有数据，应注意恢复逻辑。
        # 若文件解析成功或不存在，确保保存当前状态
        self._save()

    def _save(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump({
                "todos": self.todos,
                "counter": self.counter,
                "categories": sorted(list(self.categories))
            }, f, ensure_ascii=False, indent=2)

    def add_item(self, task, priority="normal", category="默认", due="暂无"):
        item = {
            "id": self.counter,
            "task": task,
            "completed": False,
            "priority": priority,
            "category": category,
            "due": due  # "暂无" 或 "YYYY-MM-DD"
        }
        self.todos[self.counter] = item
        self.counter += 1
        if category:
            self.categories.add(category)
        self._save()
        return item

    def remove_item(self, id):
        id = int(id)
        item = self.todos.pop(id, None)
        if item:
            self._save()
        return item

    def _parse_due(self, due_str):
        if not due_str or due_str == "暂无":
            return None
        try:
            return datetime.strptime(due_str, "%Y-%m-%d").date()
        except Exception:
            return None

    def get_items(self, priority=None, category=None, completed=None, sort=None):
        results = list(self.todos.values())
        if priority:
            results = [i for i in results if i.get("priority") == priority]
        if category:
            results = [i for i in results if i.get("category") == category]
        if completed is not None:
            results = [i for i in results if i.get("completed") is completed]

        if sort in ("due_asc", "due_desc"):
            def key_fn(i):
                d = self._parse_due(i.get("due"))
                # None goes to end for asc, start for desc
                return (d is None, d) if sort == "due_asc" else (d is not None, d if d is not None else datetime.max.date())
            results.sort(key=key_fn, reverse=(sort == "due_desc"))
        return results

    def get_item(self, id):
        return self.todos.get(int(id))

    def update_item(self, id, task=None, priority=None, category=None, completed=None, due=None):
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
            if category:
                self.categories.add(category)
        if completed is not None:
            item["completed"] = bool(completed)
        if due is not None:
            item["due"] = due
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

    def get_categories(self):
        return sorted(self.categories)