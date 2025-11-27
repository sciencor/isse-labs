`weather_client.py`: 依赖 `requests` 库，安装库后在 `.env` 文件中填写APIKEY:
```env
API_KEY=xxxx
```
即可获取内容。

`app.py`：依赖 `fastapi` 库和 `uvicorn` 库，安装后启动方式为
```shell
uvicorn app:app
```

随后服务将在本地8000端口执行（若端口未被占用）。具体文档可见路径 `/docs` 下提供的 Swagger UI.