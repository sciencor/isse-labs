TodoList API 文档
基础信息
服务器地址：http://127.0.0.1:5000
数据格式：所有请求和响应均使用 JSON 格式
启动方式：运行 python app.py 启动服务

GET /
返回主页 HTML，包含跳转到可视化操作页面的链接。

GET /show_todos
获取当前所有待办事项。
返回值为字典，键为任务 ID（整数），值为任务内容（字符串）。
示例返回：
{
  "1": "学习 Flask",
  "2": "写作业"
}

POST /add_todo
添加一个新任务。
请求体需为 JSON 格式，包含字段 task（字符串类型，不能为空）。
示例请求：
curl -X POST http://127.0.0.1:5000/add_todo \
     -H "Content-Type: application/json" \
     -d "{\"task\": \"买牛奶\"}"
成功时返回新任务的 ID 和内容，状态码 201：
{
  "id": 1,
  "task": "买牛奶"
}

PUT /update_todo/<id>
更新指定 ID 的任务内容。
<id> 为路径参数，表示要更新的任务编号。
请求体需包含 task 字段。
示例请求：
curl -X PUT http://127.0.0.1:5000/update_todo/1 \
     -H "Content-Type: application/json" \
     -d "{\"task\": \"去超市买牛奶\"}"

DELETE /delete_todo/<id>
删除指定 ID 的任务。
<id> 为路径参数。
示例请求：
curl -X DELETE http://127.0.0.1:5000/delete_todo/1