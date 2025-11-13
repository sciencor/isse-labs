from __future__ import annotations
import json
import os
import uuid
import threading
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, request, jsonify
from flask_cors import CORS

"""
设计要点 & 易错点说明
--------------------
1) 统一响应格式：
   - 成功: {"ok": True, "data": ...}
   - 失败: {"ok": False, "error": "message"}
   并配合合适的 HTTP 状态码（400/404/201）。

2) 文件持久化（data.json）：
   - 首次运行自动创建为 []。
   - 串行“读-改-写”：用进程内线程锁 threading.Lock 串行化，避免并发写入导致的乱序。
   - _save_all() 采用 “写临时文件再原子替换” (os.replace) 以降低意外中断时的数据损坏风险。

3) 字段校验：
   - priority ∈ {"low","medium","high"}
   - title 非空（POST 必填，PATCH 若出现则非空）
   - due_date 若出现需为 ISO8601（示例: "2025-10-23T12:34:56Z" 或 "2025-10-23T12:34:56"）
     解析策略：优先尝试 `fromisoformat`，若字符串以 'Z' 结尾则去掉 'Z' 再解析。
     存储时保持原始字符串（前端更直观）；返回 JSON 中 None -> null。

4) 查询过滤（GET /api/todos）：
   - q（对 title/category 模糊匹配，大小写不敏感）
   - category（大小写不敏感，完全匹配）
   - priority（low/medium/high）
   - completed（true/false/1/0，大小写不敏感）

5) Flask 2.x 兼容：未使用 3.x 新特性；CORS 由 flask_cors 提供。
"""

# ------------------------ 路径与全局状态 ------------------------
APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(APP_DIR, "data.json")
_lock = threading.Lock()

app = Flask(__name__)
CORS(app)  # 允许所有来源（课程作业环境足够；生产环境需按域名白名单收敛）

# ------------------------ 工具函数 ------------------------
def _ensure_file() -> None:
    """若 data.json 不存在则创建为 []。"""
    if not os.path.exists(DATA_PATH):
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

def _load_all() -> List[Dict[str, Any]]:
    """读出全部待办；若损坏则返回空列表（并不覆盖原文件，以免无意丢失）。"""
    _ensure_file()
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []

def _save_all(items: List[Dict[str, Any]]) -> None:
    """原子写：先写临时文件，再用 os.replace 替换正式文件。"""
    tmp_path = DATA_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, DATA_PATH)

def _now_iso() -> str:
    """UTC 时间的简洁 ISO 字符串（末尾加 'Z'）。"""
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"

def _validate_priority(p: str) -> bool:
    return p in {"low", "medium", "high"}

def _parse_due_date_iso(s: Optional[str]) -> Optional[str]:
    """
    验证 ISO8601 格式；返回原样字符串（通过校验）或 None。
    允许 "...Z" 结尾；允许秒级精度；不做时区转换，仅校验。
    """
    if s is None or s == "":
        return None
    if not isinstance(s, str):
        raise ValueError("due_date must be a string or null")

    t = s.strip()
    to_check = t[:-1] if t.endswith("Z") else t
    try:
        # fromisoformat 支持 "YYYY-mm-ddTHH:MM:SS[.ffffff][+HH:MM]"
        datetime.fromisoformat(to_check)
    except ValueError as e:
        raise ValueError(f"due_date is not a valid ISO8601 string: {t}") from e
    return t

def _normalize_new_item(payload: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """POST 创建：构造并校验完整对象。"""
    title = (payload.get("title") or "").strip()
    if not title:
        return None, "title is required"

    priority = (payload.get("priority") or "medium").lower()
    if not _validate_priority(priority):
        return None, "priority must be one of: low|medium|high"

    category = (payload.get("category") or "").strip()
    completed = bool(payload.get("completed", False))

    try:
        due_date = _parse_due_date_iso(payload.get("due_date"))
    except ValueError as e:
        return None, str(e)

    now = _now_iso()
    item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "priority": priority,
        "category": category,
        "completed": completed,
        "created_at": now,
        "due_date": due_date,  # None -> JSON null
    }
    return item, None

def _apply_patch(item: Dict[str, Any], payload: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    PATCH：对允许字段进行部分更新。
    返回 (changed, error)
    """
    changed = False

    if "title" in payload:
        t = (payload.get("title") or "").strip()
        if not t:
            return False, "title cannot be empty"
        if t != item["title"]:
            item["title"] = t
            changed = True

    if "priority" in payload:
        p = (payload.get("priority") or "").lower()
        if not _validate_priority(p):
            return False, "priority must be one of: low|medium|high"
        if p != item["priority"]:
            item["priority"] = p
            changed = True

    if "category" in payload:
        c = (payload.get("category") or "").strip()
        if c != item.get("category", ""):
            item["category"] = c
            changed = True

    if "completed" in payload:
        comp = bool(payload.get("completed"))
        if comp != bool(item.get("completed", False)):
            item["completed"] = comp
            changed = True

    if "due_date" in payload:
        try:
            dd = _parse_due_date_iso(payload.get("due_date"))
        except ValueError as e:
            return False, str(e)
        if dd != item.get("due_date"):
            item["due_date"] = dd
            changed = True

    return changed, None

def _parse_bool(s: Optional[str]) -> Optional[bool]:
    """解析查询字符串中的布尔值：true/false/1/0（大小写不敏感）。不合法返回 None。"""
    if s is None:
        return None
    v = s.strip().lower()
    if v in {"true", "1"}:
        return True
    if v in {"false", "0"}:
        return False
    return None

# ------------------------ 统一响应封装 ------------------------
def ok(data: Any, status: int = 200):
    return jsonify({"ok": True, "data": data}), status

def fail(msg: str, status: int):
    return jsonify({"ok": False, "error": msg}), status

# ------------------------ 路由 ------------------------
@app.route("/api/todos", methods=["GET"])
def list_todos():
    """
    查询参数：
      - q: 关键字（对 title 与 category 进行大小写不敏感包含匹配）
      - category: 分类（大小写不敏感，完全匹配）
      - priority: low|medium|high
      - completed: true/false/1/0
    """
    q = request.args.get("q")
    category = request.args.get("category")
    priority = request.args.get("priority")
    completed = _parse_bool(request.args.get("completed"))

    with _lock:
        items = _load_all()

    # 过滤
    def match(item: Dict[str, Any]) -> bool:
        if q:
            qs = q.strip().lower()
            if qs not in (item.get("title", "").lower()) and qs not in (item.get("category", "").lower()):
                return False
        if category:
            if (item.get("category", "").lower()) != category.strip().lower():
                return False
        if priority:
            if (priority.lower() not in {"low", "medium", "high"}) or (item.get("priority") != priority.lower()):
                return False
        if completed is not None:
            if bool(item.get("completed", False)) != completed:
                return False
        return True

    filtered = [it for it in items if match(it)]
    return ok(filtered)

@app.route("/api/todos", methods=["POST"])
def create_todo():
    """
    请求 JSON：
      - title: 必填，非空字符串
      - priority: 可选，默认 medium，取值 {low, medium, high}
      - category: 可选，字符串
      - due_date: 可选，ISO8601 或 null
    """
    payload = request.get_json(silent=True) or {}
    item, err = _normalize_new_item(payload)
    if err:
        return fail(err, 400)

    with _lock:
        items = _load_all()
        items.append(item)
        _save_all(items)

    return ok(item, status=201)

@app.route("/api/todos/<todo_id>", methods=["PATCH"])
def update_todo(todo_id: str):
    """
    允许更新字段：title | priority | category | completed | due_date
    """
    payload = request.get_json(silent=True) or {}

    with _lock:
        items = _load_all()
        for it in items:
            if it.get("id") == todo_id:
                changed, err = _apply_patch(it, payload)
                if err:
                    return fail(err, 400)
                if changed:
                    _save_all(items)
                return ok(it)
    return fail("not found", 404)

@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id: str):
    with _lock:
        items = _load_all()
        new_items = [it for it in items if it.get("id") != todo_id]
        if len(new_items) == len(items):
            return fail("not found", 404)
        _save_all(new_items)
    return ok({"id": todo_id})

# 可选：健康检查（不在作业要求内，保留有利于本地排查）
@app.route("/api/health", methods=["GET"])
def health():
    return ok({"time": _now_iso()})

# ------------------------ 入口 ------------------------
if __name__ == "__main__":
    # 监听 localhost:5000；debug=True 便于开发
    app.run(host="127.0.0.1", port=5000, debug=True)
