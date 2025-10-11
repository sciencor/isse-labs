# api使用文档

## 一、添加TodoList

### 请求信息

- 方法：POST
- 路径：/add
- 完整URL：http://127.0.0.1:5000/add

### 请求示例

```bash
curl -X POST http://127.0.0.1:5000/add -H "Content-Type: application/json" -d '{"task":"test"}'
```

### 请求参数

请求头参数 `Content-Type` 为 `application/json` 

请求体参数：

| 参数名  | 类型     | 必选  | 说明    |
| ---- | ------ | --- | ----- |
| task | string | 是   | 所添加内容 |

### 响应参数

```json
{
    "1": "text"
}
```

## 二、获取TodoList

### 请求信息

- 方法：GET
- 路径：/get/{id}
- 完整URL：http://127.0.0.1:5000/get/{id}

### 请求示例

```bash
curl -X GET "http://127.0.0.1:5000/get/3"
```

### 请求信息

- 方法：GET

- 路径：/get/

- 完整URL：http://127.0.0.1:5000/get/

### 请求示例

```bash
curl -X GET "http://127.0.0.1:5000/get/"
curl -X GET "http://127.0.0.1:5000/get/?id=3"
```

### 请求参数

路径参数：

| 参数名 | 类型  | 必选  | 说明              |
| --- | --- | --- | --------------- |
| id  | int | 否   | 默认返回全部 TodoList |

### 响应示例

返回全部

```json
{
    "1": "todo text1",
    "2": "todo text2",
    "3": "todo text3"
}
```

返回指定

```json
{
    "3": "todo text3"
}
```

`id` 未命中

```json
{
    "3": null
}
```

## 3、更新TodoList

### 请求信息

- 方法：PUT

- 路径：/updata

- 完整URL：http://127.0.0.1:5000/update

- 

### 请求示例

```bash
curl -X PUT http://127.0.0.1:5000/update -H "Content-Type: application/json" -d '{"id":3, "task":"fix"}'
```

### 请求参数

请求头参数 `Content-Type` 为 `application/json` 

请求体参数：

| 参数名  | 类型     | 必选  | 说明    |
| ---- | ------ | --- | ----- |
| id   | int    | 是   | 更新的id |
| task | string | 是   | 所更新内容 |

### 响应示例

```json
{
    "3": "fix"
}
```

`id`未命中

```json
{
    "3": null
}
```

## 4、删除TodoList

### 请求信息

- 方法：DELETE

- 路径：/remove

- 完整URL：http://127.0.0.1:5000/remove

### 请求示例

```bash
curl -X DELETE http://127.0.0.1:5000/remove -H "Content-Type: application/json" -d '{"id":3}'
```

### 请求参数

请求头参数 `Content-Type` 为 `application/json` 

请求体参数：

| 参数名 | 类型  | 必选  | 说明    |
| --- | --- | --- | ----- |
| id  | int | 是   | 删除的id |

### 响应示例

```json
{
    "3": "fix"
}
```