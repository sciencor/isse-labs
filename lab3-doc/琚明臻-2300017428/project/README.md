# ToDoList API 后端服务

这是一个基于Flask框架的ToDoList应用后端服务，提供完整的任务管理功能。

## 功能特性

- ✅ 任务创建 (POST /tasks)
- ✅ 任务列表查询 (GET /tasks) - 支持按优先级和分类过滤
- ✅ 任务更新 (PUT /tasks/<id>)
- ✅ 任务删除 (DELETE /tasks/<id>)
- ✅ 任务完成状态切换 (PATCH /tasks/<id>/complete)
- ✅ 任务统计信息 (GET /tasks/stats)
- ✅ 跨域支持 (CORS)
- ✅ 完整的错误处理

## 安装和运行

### 1. 安装依赖

```bash
cd project
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动