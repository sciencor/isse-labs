# 实验项目说明文档

---

## 作业一：调用百度天气 API

### 步骤简述
1. 注册百度地图 API，获取 AK（API Key）。
2. 在 `.env` 文件中安全存储 AK（API Key），**不要提交到 GitHub**。
3. 编写 `weather_client.py`，用 requests 和 python-dotenv 调用天气 API。
4. 运行脚本获取天气数据。

### 运行方法
```sh
pip install requests python-dotenv
python weather_client.py
```

### 提交要求
- 代码需提交到 GitHub，**不能提交 API Key**。

---

## 作业二：TodoList Flask API

### 步骤简述
1. 编写 `app.py`，用 Flask 封装 TodoList 类为 API。
2. 支持 POST（新增）、GET（查询）、DELETE（删除）、PUT（更新）操作。
3. 编写 API 文档，说明 endpoint、参数、返回值。
4. 用 curl 验证每个接口。

### 运行方法
```sh
pip install flask
python app.py
```

### API 示例
- 新增：
  ```sh
  curl -X POST http://127.0.0.1:5000/todos -H "Content-Type: application/json" -d "{\"task\": \"Finish LAB2\"}"
  ```
- 查询：
  ```sh
  curl http://127.0.0.1:5000/todos
  ```
- 删除：
  ```sh
  curl -X DELETE http://127.0.0.1:5000/todos/1
  ```
- 更新：
  ```sh
  curl -X PUT http://127.0.0.1:5000/todos/1 -H "Content-Type: application/json" -d "{\"task\": \"Learn something about flask and HTTP.\"}"
  ```
