# Lab3 · ToDoList（Flask + 原生前端）

本项目为Lab3课程作业的最小可运行示例：  
- **后端**：Flask（返回 JSON、支持 CORS）、本地 `data.json` 文件持久化。  
- **前端**：纯 HTML + 原生 JS（`fetch`），实现新增、删除、标记完成、搜索/过滤、按优先级/分类展示，支持截止日期。  
- **运行目标**：启动后端后，直接双击打开前端 `index.html` 即可完成交互，无需打包和第三方库。

---

## 目录结构

```

lab3-doc/
└── 白晨旭-2300011172/
├── prompt.txt
├── ai_generated_prompt.txt     # 由ChatGPT-5生成的prompt
├── screenshot.png              # 运行后自行截图放这里
├── README.md                   # 本文件
└── project/
    ├── app.py                  # Flask 后端
    ├── requirements.txt
    ├── data.json               # 首次运行自动生成（为空列表 []）
    ├── index.html              # 纯静态前端
    ├── script.js
    └── style.css
```

---

## 环境准备与运行步骤

> 需要 Python 3.9+；推荐在虚拟环境中运行。

```bash
# 1) 进入项目目录
cd lab3-doc/李华-230111234/project

# 2) 创建并激活虚拟环境
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 3) 安装依赖
pip install -r requirements.txt

# 4) 启动后端（默认 http://localhost:5000）
python app.py
```

启动后，用浏览器直接打开本目录下的 **`index.html`** 即可使用前端（前端通过 CORS 访问 `http://localhost:5000/api`）。

> **重置数据**：将 `project/data.json` 内容改为 `[]` 即可清空。

---

## 接口列表（简要）

* 统一返回格式：

  * 成功：`{"ok": true, "data": ...}`
  * 失败：`{"ok": false, "error": "message"}`（配合 4xx/5xx 状态码）

### 1) 列表查询

`GET /api/todos?q&category&priority&completed`

**示例：**

```
GET /api/todos?priority=high&completed=false
```

**响应：**

```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "title": "Finish report",
      "priority": "high",
      "category": "work",
      "completed": false,
      "created_at": "2025-10-23T12:00:00Z",
      "due_date": "2025-10-24T12:00:00Z"
    }
  ]
}
```

### 2) 新增

`POST /api/todos`（JSON）

**请求体：**

```json
{
  "title": "Buy milk",
  "priority": "low",
  "category": "life",
  "due_date": null
}
```

**响应：**

```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "title": "Buy milk",
    "priority": "low",
    "category": "life",
    "completed": false,
    "created_at": "2025-10-23T12:34:56Z",
    "due_date": null
  }
}
```

### 3) 局部更新

`PATCH /api/todos/<id>`（JSON）

**请求体（示例一：标记完成）：**

```json
{ "completed": true }
```

**请求体（示例二：改标题/分类/优先级/截止）：**

```json
{
  "title": "Finish quarterly report",
  "category": "work-urgent",
  "priority": "high",
  "due_date": "2025-11-02T09:00:00Z"
}
```

**响应：**

```json
{ "ok": true, "data": { ...更新后的完整对象... } }
```

### 4) 删除

`DELETE /api/todos/<id>`

**响应：**

```json
{ "ok": true, "data": { "id": "<id>" } }
```

---

## curl 自测（简要）

### Bash（Linux/macOS/Git Bash）

```bash
# 列表
curl -s http://localhost:5000/api/todos | jq .

# 新增
curl -s -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Read book","priority":"medium","category":"study"}' | jq .

# 标记完成（替换 <ID>）
curl -s -X PATCH http://localhost:5000/api/todos/<ID> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | jq .

# 删除（替换 <ID>）
curl -s -X DELETE http://localhost:5000/api/todos/<ID> | jq .
```

### PowerShell（Windows）

> **注意**：Windows 的 `curl.exe` 对引号/编码敏感，推荐写入临时文件再 `--data-binary` 发送，或使用 `Invoke-RestMethod`。

```powershell
# 列表
curl.exe -s http://localhost:5000/api/todos | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 新增（简单示例：确保使用双引号包装 JSON）
curl.exe -s -X POST http://localhost:5000/api/todos -H "Content-Type: application/json" `
  -d "{\"title\":\"Read book\",\"priority\":\"medium\",\"category\":\"study\"}" `
  | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

> 若需完整可执行的 PowerShell 自测脚本（包含创建/过滤/更新/删除/错误用例），可参考本仓库 `scripts/test.ps1` 示例（使用 UTF-8 与临时文件规避编码问题）。

---

## 常见问题（FAQ）

### 1. CORS 报错 / 前端访问被拦截

* 本项目已在后端启用 `flask_cors`，默认允许 `http://localhost` 前端访问。
* 确保你访问的后端基址为 `http://localhost:5000/api`；若改过端口/host，请同步修改前端 `script.js` 中的 `BASE_URL`。

### 2. 5000 端口被占用

* 更换端口运行：编辑 `project/app.py` 最后一行，将 `port=5000` 改成空闲端口（如 5050）：

  ```python
  app.run(host="127.0.0.1", port=5050, debug=True)
  ```
* 同步修改前端 `project/script.js` 中的：

  ```js
  const BASE_URL = "http://localhost:5050";
  ```

### 3. Windows 上文件锁 / 写入失败

* `data.json` 为简单文件存储，后端使用**进程内线程锁**串行化“读-改-写”。
* 避免多个后端进程**同时**运行（只保持一个 `python app.py`）。
* 若 `data.json` 被云同步/杀毒软件占用：

  * 将项目放在非同步目录（避免 OneDrive/网盘实时占用）。
  * 将 `data.json` 加入杀软排除或临时关闭实时监控测试。
  * 实在不行可更换文件名或目录（同时修改 `app.py` 中 `DATA_PATH`）。

### 4. due_date 的时间格式

* API 接受 ISO8601，例如：`"2025-10-24T12:00:00Z"` 或无 `Z` 的 `"2025-10-24T12:00:00"`。
* 前端通过 `<input type="datetime-local">` 选择后，会用 `toISOString()` 转成 UTC ISO 发送给后端。

### 5. 数据损坏/无法解析

* 如果误操作导致 `data.json` 不是合法 JSON，后端会容错为空列表但不会覆盖原文件。
* 你可以手动把 `data.json` 内容改成 `[]` 重置。

### 6. 前端打开是空白或“未连接”

* 确认后端已启动并监听正确端口。
* 浏览器控制台若报网络错误（如 `ECONNREFUSED`），说明后端未启动或端口错误；修正后刷新页面即可。

---

## 依赖

`project/requirements.txt`：

```
Flask>=2.2,<3
flask-cors>=3.0,<4
```

---

## 评分对照（功能完成度自检）

* [x] 新增 / 删除 / 标记完成
* [x] 搜索（标题/分类）与过滤（状态/优先级/分类），按优先级或时间展示
* [x] CORS、JSON 返回、文件持久化
* [x] 目录结构与 README、截图
* [x] 纯前端（HTML+JS+CSS，无第三方库）即开即用

祝你作业顺利完成！ 🎯

