# TO DO LIST API guide

# 获得API
运行指令 python app.py 
默认 : Running on http://127.0.0.1:5000 , debug = True

# 调用API接口
提供了4种操作：增，删，改，查看
  # POST /add
  description : 在to-do-list后增加一个任务，返回其id与内容
  Header : Content-Type: application/json
  Body : {"task":"..."}
  e.g. : curl -X POST http://127.0.0.1:5000/add -H "Content-Type: application/json" -d '{"task": "learn Python"}'

  # DELETE /remove/id
  description : 将to-do-list中编号id的任务删除
  e.g. :  curl -X DELETE http://127.0.0.1:5000/remove/1

  # PUT /update/id
  description : 将to-do-list中编号id的任务更新为输入任务，返回id与其更新后的内容
  Header : Content-Type: application/json
  Body : {"task":"..."}
  e.g. : curl -X PUT http://127.0.0.1:5000/update/1 -H "Content-Type: application/json" -d '{"task": "learn Flask"}'

  # GET /todos
  description : 将to-do-list中所有任务及其编号返回
  e.g. : curl -X GET http://127.0.0.1:5000/todos
