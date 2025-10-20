from __future__ import annotations

import json
import threading
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "tasks.json"
DEFAULT_CATEGORY = "General"
DEFAULT_PRIORITY = 2

app = Flask(__name__)
_db_lock = threading.Lock()


class APIError(Exception):
    """Custom API error to enforce unified response format."""

    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code


@dataclass
class Task:
    id: int
    title: str
    priority: int
    category: str
    completed: bool
    created_at: str
    updated_at: str

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "Task":
        return cls(**payload)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "priority": self.priority,
            "category": self.category,
            "completed": self.completed,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


def _ensure_data_file() -> None:
    if not DATA_FILE.exists():
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        DATA_FILE.write_text("[]", encoding="utf-8")


def _load_tasks_unlocked() -> List[Dict[str, Any]]:
    _ensure_data_file()
    try:
        with DATA_FILE.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except json.JSONDecodeError as exc:
        raise APIError("ServerError", "Data store is corrupted", status_code=500) from exc


def _save_tasks_unlocked(tasks: List[Dict[str, Any]]) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(tasks, handle, ensure_ascii=False, indent=2)


def load_tasks() -> List[Dict[str, Any]]:
    with _db_lock:
        return _load_tasks_unlocked()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _priority_to_int(raw: Any, *, default: int = DEFAULT_PRIORITY) -> int:
    if raw is None:
        return default
    mapping = {"low": 1, "medium": 2, "high": 3}
    if isinstance(raw, str):
        key = raw.strip().lower()
        if key not in mapping:
            raise APIError("BadRequest", "Invalid priority value", status_code=400)
        return mapping[key]
    if isinstance(raw, (int, float)):
        try:
            value = int(raw)
        except (TypeError, ValueError) as exc:
            raise APIError("BadRequest", "Invalid priority value", status_code=400) from exc
        if value not in (1, 2, 3):
            raise APIError("BadRequest", "Priority must be 1, 2 or 3", status_code=400)
        return value
    raise APIError("BadRequest", "Priority must be 1, 2 or 3", status_code=400)


def _validate_title(raw: Any) -> str:
    if raw is None:
        raise APIError("BadRequest", "Title is required", status_code=400)
    if not isinstance(raw, str):
        raise APIError("BadRequest", "Title must be a string", status_code=400)
    title = raw.strip()
    if not title:
        raise APIError("BadRequest", "Title cannot be empty", status_code=400)
    if len(title) > 100:
        raise APIError("BadRequest", "Title must be at most 100 characters", status_code=400)
    return title


def _validate_category(raw: Any, *, default: str = DEFAULT_CATEGORY) -> str:
    if raw is None:
        return default
    if not isinstance(raw, str):
        raise APIError("BadRequest", "Category must be a string", status_code=400)
    category = raw.strip()
    return category or default


def _find_task_index(tasks: List[Dict[str, Any]], task_id: int) -> int:
    for idx, task in enumerate(tasks):
        tid = task.get("id")
        if tid is None:
            continue
        try:
            if int(tid) == task_id:
                return idx
        except (TypeError, ValueError):
            # skip entries with non-integer ids
            continue
    raise APIError("NotFound", f"Task {task_id} not found", status_code=404)


def _task_from_payload(task: Dict[str, Any]) -> Task:
    return Task.from_dict(task)


def _apply_filters(tasks: List[Dict[str, Any]], *, category: Optional[str], status: str) -> List[Dict[str, Any]]:
    filtered = tasks
    if category:
        filtered = [t for t in filtered if t.get("category") == category]
    status = (status or "all").lower()
    if status == "active":
        filtered = [t for t in filtered if not t.get("completed", False)]
    elif status == "completed":
        filtered = [t for t in filtered if t.get("completed", False)]
    elif status != "all":
        raise APIError("BadRequest", "Invalid status filter", status_code=400)
    return filtered


def _apply_sort(tasks: List[Dict[str, Any]], *, sort: str, order: str) -> List[Dict[str, Any]]:
    sort_key = (sort or "created").lower()
    order = (order or "desc").lower()
    reverse = order == "desc"
    if order not in {"asc", "desc"}:
        raise APIError("BadRequest", "Invalid order value", status_code=400)

    if sort_key == "priority":
        key_func = lambda t: t.get("priority", DEFAULT_PRIORITY)
    elif sort_key == "created":
        key_func = lambda t: t.get("created_at", "")
    else:
        raise APIError("BadRequest", "Invalid sort field", status_code=400)
    return sorted(tasks, key=key_func, reverse=reverse)


def api_success(data: Any, status_code: int = 200):
    return jsonify({"ok": True, "data": data}), status_code


@app.errorhandler(APIError)
def handle_api_error(err: APIError):
    return jsonify({"ok": False, "error": {"code": err.code, "message": err.message}}), err.status_code


@app.errorhandler(Exception)
def handle_unexpected_error(err: Exception):
    # Log server-side if needed; for now return generic error.
    return jsonify({"ok": False, "error": {"code": "ServerError", "message": "Unexpected server error"}}), 500


@app.get("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/script.js")
def serve_script():
    return send_from_directory(BASE_DIR, "script.js")


@app.get("/style.css")
def serve_style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/api/health")
def api_health():
    return api_success("backend running")


@app.get("/api/tasks")
def list_tasks():
    tasks = load_tasks()
    category = request.args.get("category")
    status = request.args.get("status", "all")
    sort = request.args.get("sort", "created")
    order = request.args.get("order", "desc")

    filtered = _apply_filters(tasks, category=category, status=status)
    sorted_tasks = _apply_sort(filtered, sort=sort, order=order)
    return api_success(sorted_tasks)


@app.post("/api/tasks")
def create_task():
    payload = request.get_json(silent=True) or {}
    title = _validate_title(payload.get("title"))
    priority = _priority_to_int(payload.get("priority"))
    category = _validate_category(payload.get("category"))

    now = _now_iso()
    with _db_lock:
        tasks = _load_tasks_unlocked()
        next_id = max((task.get("id", 0) for task in tasks), default=0) + 1
        task = Task(
            id=next_id,
            title=title,
            priority=priority,
            category=category,
            completed=False,
            created_at=now,
            updated_at=now,
        )
        tasks.append(task.to_dict())
        _save_tasks_unlocked(tasks)
    return api_success(task.to_dict(), status_code=201)


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id: int):
    payload = request.get_json(silent=True) or {}
    allowed_keys = {"title", "priority", "category", "completed"}
    if not any(key in payload for key in allowed_keys):
        raise APIError("BadRequest", "No valid fields to update", status_code=400)

    with _db_lock:
        tasks = _load_tasks_unlocked()
        idx = _find_task_index(tasks, task_id)
        task_data = tasks[idx]
        task = _task_from_payload(task_data)

        if "title" in payload:
            task.title = _validate_title(payload.get("title"))
        if "priority" in payload:
            task.priority = _priority_to_int(payload.get("priority"), default=task.priority)
        if "category" in payload:
            task.category = _validate_category(payload.get("category"), default=task.category)
        if "completed" in payload:
            completed = payload.get("completed")
            if not isinstance(completed, bool):
                raise APIError("BadRequest", "Completed must be a boolean", status_code=400)
            task.completed = completed

        task.updated_at = _now_iso()
        tasks[idx] = task.to_dict()
        _save_tasks_unlocked(tasks)
    return api_success(task.to_dict())


@app.patch("/api/tasks/<int:task_id>/toggle")
def toggle_task(task_id: int):
    with _db_lock:
        tasks = _load_tasks_unlocked()
        idx = _find_task_index(tasks, task_id)
        task_data = tasks[idx]
        task = _task_from_payload(task_data)
        task.completed = not task.completed
        task.updated_at = _now_iso()
        tasks[idx] = task.to_dict()
        _save_tasks_unlocked(tasks)
    return api_success(task.to_dict())


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id: int):
    with _db_lock:
        tasks = _load_tasks_unlocked()
        idx = _find_task_index(tasks, task_id)
        removed = tasks.pop(idx)
        _save_tasks_unlocked(tasks)
    return api_success({"id": removed.get("id")})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
