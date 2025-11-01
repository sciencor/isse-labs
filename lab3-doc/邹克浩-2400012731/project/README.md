# TodoList

一个基于 Flask + 原生 HTML/CSS/JS 的简单待办事项 (Todo) 应用，支持：

- 添加/删除/编辑任务
- 标记完成/取消完成
- 任务分类（学习/工作/生活）和优先级（高/中/低）
- 任务截止时间、按截止时间排序
- 搜索、筛选（优先级/类别/是否完成）
- 将任务保存在 `project/backend/tasks.json`

## 目录结构

```
project/
├── backend/
│   ├── app.py        # Flask 后端
│   ├── tasks.json    # 数据文件（轻量级持久化）
│   ├── requirements.txt
│   └── integration_test.sh
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── tools/
		└── sim_frontend.py
```

## 快速开始（开发）

1. 创建并激活虚拟环境（如果尚未）：

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. 安装依赖：

```bash
pip install -r project/backend/requirements.txt
```

3. 启动后端（Flask 会托管前端静态文件）：

```bash
python project/backend/app.py
```

4. 在浏览器打开：

```
http://127.0.0.1:5000/
```

## 一键集成测试

服务启动后，可在另一个终端运行：

```bash
bash project/backend/integration_test.sh
```

这会测试静态资源加载并用 API 完成一轮增删查改流程。

## API 文档（简洁）

- GET /tasks  
	返回：{ "tasks": [ ... ] }

- POST /tasks  
	请求体：{ "title", "description", "priority", "category", "due_date" }
	返回：201

- PUT /tasks/<id>  
	请求体：部分或全部字段（例如 {"completed": true}）

- DELETE /tasks/<id>

## 前端使用说明

- 主页面提供任务列表与侧边筛选控件。
- 点击“添加任务”打开弹窗，填写后保存。
- 任务项显示标题、类别、优先级、截止时间，单击描述可展开查看多行内容（默认折叠，点击展开后自动折叠其他任务的描述）。
- 点击“编辑”可修改任务；编辑时可点击“取消”恢复原始值。
- 删除前会弹出确认框。
- 筛选支持：优先级 / 类别 / 是否完成，排序支持：创建时间 / 截止时间 / 优先级。

## 开发规范

- Python：遵循 PEP8 风格
- JavaScript：使用清晰的原生 DOM API
- 命名：后端变量使用 snake_case，前端使用 camelCase，函数使用动词开头，类使用 PascalCase

## 已完成 / 建议改进

当前已实现并通过本地集成测试的功能：后端 REST API、前端交互、持久化文件、集成测试脚本和基础文档。

后续改进建议：

- 将任务存储迁移到 SQLite 或其他数据库以支持并发和事务。
- 添加用户认证和多用户数据隔离。
- 增加端到端测试（Playwright / Selenium）和单元测试。
- 美化 UI、添加 toast 通知，替换浏览器 confirm 为自定义 modal。
- 提供 Dockerfile 与部署说明。

---

当前状态：开发完成并通过本地集成测试。
