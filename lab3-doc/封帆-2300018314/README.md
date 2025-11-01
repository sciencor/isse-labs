# ToDoList 全栈项目（阶段 B 完成版）

该项目实现了一个基于 Flask 的待办事项服务与纯前端静态页面，支持任务的添加、删除、标记完成、分类与状态筛选、按优先级/创建时间排序等功能。目录根位于 `lab3-doc/封帆-2300018314/`。

## 目录结构
```
lab3-doc/封帆-2300018314/
├── prompt.txt
├── screenshot.png        # 阶段 B 创建的占位文件，待替换真实截图
├── README.md             # 当前文档
└── project/
    ├── app.py            # Flask 后端
    ├── index.html        # 静态前端入口
    ├── script.js         # 前端交互逻辑
    ├── style.css         # 前端样式
    └── tasks.json        # JSON 数据存储
```

## 环境准备
```bash
python -m venv .venv
source .venv/bin/activate
pip install flask
```

## 后端启动
```bash
python lab3-doc/封帆-2300018314/project/app.py
```

服务默认监听在 `http://localhost:5000`。根路径 `/` 会返回前端页面，若只需检查后端健康状态可访问 `/api/health`。


### API 简表
| 方法 | 路径 | 说明 | 备注 |
| ---- | ---- | ---- | ---- |
| GET | `/api/tasks` | 查询任务列表 | `sort=priority|created`，`order=asc|desc`，可按 `category` 与 `status`（all/active/completed）筛选 |
| POST | `/api/tasks` | 新增任务 | `title` 必填；`priority` 支持 1/2/3 或 low/medium/high |
| PATCH | `/api/tasks/<id>` | 更新任务字段 | 支持更新 `title`、`category`、`priority`、`completed` |
| PATCH | `/api/tasks/<id>/toggle` | 切换完成状态 | 无请求体，直接翻转 `completed` |
| DELETE | `/api/tasks/<id>` | 删除任务 | 返回 `{ id }` |

所有响应统一格式：
- 成功：`{ "ok": true, "data": ... }`
- 失败：`{ "ok": false, "error": { "code": "BadRequest|NotFound|ServerError", "message": "..." } }`

### Curl 自测脚本
```bash
# 新增任务
curl -s -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write docs", "priority": "high", "category": "Work"}' | jq

# 查询任务（按创建时间降序）
curl -s "http://localhost:5000/api/tasks?sort=created&order=desc" | jq

# 更新任务标题与分类
curl -s -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Update docs", "category": "Docs"}' | jq

# 切换完成状态
curl -s -X PATCH http://localhost:5000/api/tasks/1/toggle | jq

# 删除任务
curl -s -X DELETE http://localhost:5000/api/tasks/1 | jq
```

## 前端使用
1. **启动后端**：确保 Flask 服务在 `http://localhost:5000` 运行。

2. **打开页面**：浏览器访问 `http://localhost:5000/`，后端会直接返回静态前端文件。

3. **主要区域说明**：
   - 顶部「新增任务」表单：填写标题（必填）、分类、优先级后点击「添加任务」。
   - 「筛选与排序」面板：可切换状态（全部/进行中/已完成）、输入分类关键字（实时生效）、选择排序字段与顺序、点击「刷新」强制重新拉取。
   - 「任务列表」：展示任务标题、分类、优先级、创建/更新时间。复选框切换完成状态，右侧删除按钮移除任务。
   - 列表上方统计条实时显示总任务数及完成数量。
4. **交互行为**：
   - 表单提交后自动清空并回到默认中优先级。
   - 列表操作会显示加载提示；若接口返回错误会在列表上方的红色提示框展示。
   - 分类筛选采用 400ms 防抖，可连续输入以减少请求频率。

## 常见问题排查
| 现象 | 排查步骤 |
| ---- | ---- |
| 页面提示「网络异常，请稍后再试」 | 确认后端是否已启动、浏览器访问是否使用 `http://localhost:5000`。检查浏览器控制台的网络请求返回值。 |
| 添加任务失败返回 `Title cannot be empty` | 确认标题输入后再提交，标题需要 1~100 字。 |
| 任务列表为空 | 若数据文件 `tasks.json` 存在历史脏数据，可删除后端会自动重新创建；或检查筛选条件是否过于严格。 |
| 中文字符显示异常 | 请确保浏览器编码为 UTF-8，文件已经设置 `meta charset="UTF-8"`。 |

## 扩展建议
- 将存储从 JSON 迁移至 SQLite + SQLAlchemy，支持多用户与更复杂查询。
- 为接口增加分页、搜索及批量操作。
- 添加用户认证并将前端改造成单页面应用（如 React/Vue）。
- 配置前后端统一的日志与监控方案。

## 下一步
当前已完成前后端功能。`screenshot.png` 为阶段要求的占位文件，请在验收后替换为实际运行截图。
