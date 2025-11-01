开发环境：WLS

帮我做一个TodoList系统完成以下功能：
1. 用户可输入新的待办事项；
2. 待办事项展示在列表中；
3. 可删除任务；
4. 可标记任务为完成；
5. 任务可按照优先级分类（高/中/低）；
6. 任务可按类别（学习/工作/生活）进行分类与筛选；
7. 支持“按时间排序”；
8. 加入“搜索任务”输入框；
9. 加入“任务截止时间”字段；
10. 将任务存入 tasks.json 文件，保存数据。

- **后端**：使用 Python Flask 提供 RESTful API。
- **前端**：使用 HTML + CSS + JavaScript（原生，不使用框架）。
- **数据格式**：JSON。
- **运行方式**：Flask 提供 RESTful API，前端用 fetch() 调用接口。
- **本地 URL**：`http://127.0.0.1:5000/`。

### 开发规范
1. **代码风格**：遵循 PEP 8（Python）和 Airbnb JavaScript 风格指南。
2. **命名约定**：
   - 变量名使用小写字母和下划线（snake_case）。
   - 函数名使用动词开头，描述功能。
   - 类名使用大写字母开头的驼峰命名法（PascalCase）。
3. **注释**：
   - Python 使用 `#` 注释，必要时添加 docstring。
   - JavaScript 使用 `//` 和 `/* */` 注释。
4. **文件组织**：
   - 后端代码放置在 `project/backend/`。
   - 前端代码放置在 `project/frontend/`。

### JSON 数据格式
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "完成作业",
      "description": "完成数学作业",
      "priority": "高",
      "category": "学习",
      "due_date": "2025-10-20",
      "completed": false
    }
  ]
}
```

### 项目结构
```
project/
├── backend/
│   ├── app.py  # Flask 主程序
│   ├── tasks.json  # 数据存储文件
│   └── requirements.txt  # Python 依赖
├── frontend/
│   ├── index.html  # 主页面
│   ├── style.css  # 样式文件
│   └── script.js  # 前端逻辑
└── README.md  # 项目说明
```

### 后端接口设计
1. **获取任务列表**
   - URL: `/tasks`
   - 方法: GET
   - 响应示例：
     ```json
     {
       "tasks": [
         {
           "id": 1,
           "title": "完成作业",
           "description": "完成数学作业",
           "priority": "高",
           "category": "学习",
           "due_date": "2025-10-20",
           "completed": false
         }
       ]
     }
     ```

2. **添加任务**
   - URL: `/tasks`
   - 方法: POST
   - 请求示例：
     ```json
     {
       "title": "完成作业",
       "description": "完成数学作业",
       "priority": "高",
       "category": "学习",
       "due_date": "2025-10-20"
     }
     ```
   - 响应：任务添加成功的消息。

3. **删除任务**
   - URL: `/tasks/<id>`
   - 方法: DELETE
   - 响应：任务删除成功的消息。

4. **更新任务状态**
   - URL: `/tasks/<id>`
   - 方法: PUT
   - 请求示例：
     ```json
     {
       "completed": true
     }
     ```
   - 响应：任务更新成功的消息。

### 命名规范
1. **变量命名**：
   - 使用小写字母和下划线（snake_case）。
   - 变量名应具有描述性，例如 `task_list` 表示任务列表。
2. **函数命名**：
   - 使用动词开头，描述功能，例如 `add_task()` 表示添加任务。
3. **类命名**：
   - 使用大写字母开头的驼峰命名法（PascalCase），例如 `TaskManager` 表示任务管理类。
4. **文件命名**：
   - Python 文件使用小写字母和下划线，例如 `app.py`。
   - 前端文件根据功能命名，例如 `task_list.js`。

### 开发顺序
1. **后端开发**：
   - 设置 Flask 项目结构。
   - 创建 `tasks.json` 文件并实现基本的读写操作。
   - 实现 RESTful API，包括获取任务列表、添加任务、删除任务和更新任务状态。
   - 测试后端接口，确保功能完整。

2. **前端开发**：
   - 创建基本的 HTML 页面结构。
   - 使用 CSS 完成页面布局和样式设计。
   - 编写 JavaScript 实现前端逻辑，包括：
     - 获取任务列表并展示。
     - 添加任务的表单交互。
     - 搜索、筛选和排序功能。
     - 调用后端 API 实现任务的增删改查。

3. **集成测试**：
   - 将前后端集成，测试整体功能。
   - 修复可能存在的交互问题。

4. **优化与部署**：
   - 优化代码结构和性能。
   - 编写项目文档。
   - 部署到本地或服务器环境，确保可用性。