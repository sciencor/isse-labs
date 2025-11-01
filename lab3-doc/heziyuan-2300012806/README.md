
# 📝 TodoList 后端系统

本项目是一个使用 **Flask + SQLite3** 实现的待办事项管理系统（TodoList API），支持任务的添加、展示、删除、完成标记、分类与优先级筛选功能。  
同时使用 `Flask-CORS` 允许前端（HTML+JS）直接通过浏览器访问接口。

---

## 🚀 功能概述

### 基本功能
1. **添加任务**：通过 POST `/todos` 创建新的待办事项  
2. **查看任务列表**：通过 GET `/todos` 获取所有任务，可按类别和优先级筛选  
3. **删除任务**：通过 DELETE `/todos/<id>` 删除指定任务  
4. **标记完成**：通过 PUT `/todos/<id>/complete` 标记任务为已完成  
5. **数据持久化**：使用 SQLite 数据库 `todo.db` 存储所有任务  
6. **日志记录**：自动同步任务到 `tasks.json`，可用于备份或外部同步  

---

## 📂 项目结构

```
todo_project/
│
├── backend/
│   ├── app.py          # Flask 主程序（即你提供的后端）
│   ├── todo.db         # SQLite 数据库（运行后自动生成）
│   └── tasks.json      # 任务日志文件（运行后自动生成）
│
├── frontend/
│   └── index.html      # 待办事项前端页面
│
└── README.md           # 项目说明文档
```

---

## ⚙️ 环境配置

### 1️⃣ 安装依赖

在终端进入 `backend/` 目录后运行：

```bash
pip install flask flask-cors
```

> Python ≥ 3.8 版本即可。

---

### 2️⃣ 启动后端服务

```bash
python app.py
```

运行后控制台将输出类似：
```
 * Running on http://127.0.0.1:5000
```

---

## 🧭 API 接口说明

### 1. 获取任务列表
**GET** `/todos`

可选参数：
- `category`: 分类筛选（如 “学习”、“工作”）
- `level`: 优先级筛选（如 “高”、“中”、“低”）

示例：
```bash
curl "http://127.0.0.1:5000/todos?category=学习&level=高"
```

返回示例：
```json
[
  {
    "id": 1,
    "title": "学习 Flask",
    "category": "学习",
    "level": "高",
    "ddl": "",
    "completed": false
  }
]
```

---

### 2. 添加任务
**POST** `/todos`

请求体（JSON）：
```json
{
  "title": "学习 Flask",
  "category": "学习",
  "level": "高",
  "ddl": "2025-10-25"
}
```

示例：
```bash
curl -X POST http://127.0.0.1:5000/todos ^
     -H "Content-Type: application/json" ^
     -d "{\"title\":\"学习 Flask\",\"category\":\"学习\",\"level\":\"高\"}"
```

返回：
```json
{ "message": "todo added successfully", "id": 1 }
```

---

### 3. 删除任务
**DELETE** `/todos/<id>`

示例：
```bash
curl -X DELETE http://127.0.0.1:5000/todos/1
```

返回：
```json
{ "message": "todo deleted" }
```

---

### 4. 标记任务完成
**PUT** `/todos/<id>/complete`

示例：
```bash
curl -X PUT http://127.0.0.1:5000/todos/1/complete
```

返回：
```json
{ "message": "todo marked as complete" }
```

---

## 📜 数据存储说明

- **数据库**：`todo.db`
  - 表名：`todos`
  - 字段：
    | 字段名 | 类型 | 说明 |
    |---------|------|------|
    | id | INTEGER PRIMARY KEY | 唯一标识 |
    | title | TEXT | 任务标题 |
    | category | TEXT | 分类（如学习/工作） |
    | level | TEXT | 优先级（高/中/低） |
    | ddl | TEXT | 截止日期（可选） |
    | completed | INTEGER | 是否完成（0未完成/1已完成） |

- **任务日志文件**：`tasks.json`
  - 自动同步数据库中的任务
  - 用于备份与外部同步

---

## 🧪 测试方法（PowerShell 兼容）

在 **VSCode 终端（PowerShell 模式）** 下使用以下命令：

```powershell
# 获取任务
Invoke-RestMethod -Uri "http://127.0.0.1:5000/todos"

# 添加任务
Invoke-RestMethod -Uri "http://127.0.0.1:5000/todos" -Method POST -Body (@{title="学习 Flask"; category="学习"; level="高"} | ConvertTo-Json) -ContentType "application/json"

# 删除任务
Invoke-RestMethod -Uri "http://127.0.0.1:5000/todos/1" -Method DELETE

# 标记任务完成
Invoke-RestMethod -Uri "http://127.0.0.1:5000/todos/1/complete" -Method PUT
```

---

## 🌐 前端说明（可选）

你可使用浏览器直接打开 `frontend/index.html`，即可通过网页界面添加、删除、筛选、标记任务，前端通过 `fetch()` 与该后端 API 通信。

---

## 🧩 扩展(TODO)

- 增加截止日期提醒
- 增加任务搜索功能
- 导出任务到 CSV / JSON
- 添加用户系统（多用户待办清单）

---

> 作者：基于 Flask 的轻量级 TodoList 示例  
> 版本：v1.0  
> 日期：2025-10
````
