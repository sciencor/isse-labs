# Flask TodoList API

这是一个使用 Flask 构建的待办事项系统的后端 API。该项目提供了基本的 CRUD 操作，允许用户管理待办事项。

## 功能

- 输入待办事项
- 展示所有事项，未完成在前，已完成在后
- 支持按创建日期、结束日期和重要等级排序未完成事项
- 置顶事项并加上旗标
- 删除、编辑任务，标记为完成
- 标记重要事项，显示为星
- 分类事项

## 接口

- `GET /tasks`：获取全部任务
- `POST /tasks`：新增任务
- `PUT /tasks/<id>`：修改任务状态（完成/未完成）
- `DELETE /tasks/<id>`：删除任务
- `EDIT /tasks/<id>`：编辑任务
- `GET /tasks?category=xxx`：分类
- `GET /tasks?flag=true`：标记置顶（旗标）
- `GET /tasks?star=true`：标记星

## 数据格式

每个任务对象字段如下：

```json
{ "id": 1, "title": "写实验报告", "category": "学习", "flag": true, "star": true, "completed": false }
```

后端返回统一格式：

```json
{ "status": "success", "data": [...], "message": "新增成功" }
```

## 使用说明

1. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 运行应用：
   ```bash
   python src/app.py
   ```

3. 使用 Postman 或浏览器测试接口。

## 贡献

欢迎提交问题和请求，任何贡献都将受到欢迎！