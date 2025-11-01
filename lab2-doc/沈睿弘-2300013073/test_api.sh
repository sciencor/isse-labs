#!/bin/bash

set -u

BASE_URL=${1:-"http://127.0.0.1:5000"}

echo
echo "=================================================="
echo "1. 新增任务成功"
echo "=================================================="
echo "Request: POST ${BASE_URL}/todos"
echo "Payload: {\"task\": \"Write ISSE lab\"}"
echo "Response: "
curl -sS -X POST "${BASE_URL}/todos" \
  -H "Content-Type: application/json" \
  -d '{"task": "Write ISSE lab"}' \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "2. 新增任务缺少 task 字段 (400)"
echo "=================================================="
echo "Request: POST ${BASE_URL}/todos"
echo "Payload: {}"
echo "Response: "
curl -sS -X POST "${BASE_URL}/todos" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "3. 查询任务列表"
echo "=================================================="
echo "Request: GET ${BASE_URL}/todos"
echo "Payload: <none>"
echo "Response: "
curl -sS -X GET "${BASE_URL}/todos" \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "4. 更新任务成功"
echo "=================================================="
echo "Request: PUT ${BASE_URL}/todos/1"
echo "Payload: {\"task\": \"Finished writing ISSE lab\"}"
echo "Response: "
curl -sS -X PUT "${BASE_URL}/todos/1" \
  -H "Content-Type: application/json" \
  -d '{"task": "Finished writing ISSE lab"}' \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "5. 更新任务缺少 task 字段 (400)"
echo "=================================================="
echo "Request: PUT ${BASE_URL}/todos/1"
echo "Payload: {}"
echo "Response: "
curl -sS -X PUT "${BASE_URL}/todos/1" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "6. 更新不存在的任务 (404)"
echo "=================================================="
echo "Request: PUT ${BASE_URL}/todos/99"
echo "Payload: {\"task\": \"Non existing\"}"
echo "Response: "
curl -sS -X PUT "${BASE_URL}/todos/99" \
  -H "Content-Type: application/json" \
  -d '{"task": "Non existing"}' \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "7. 删除任务成功"
echo "=================================================="
echo "Request: DELETE ${BASE_URL}/todos/1"
echo "Payload: <none>"
echo "Response: "
curl -sS -X DELETE "${BASE_URL}/todos/1" \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "8. 删除不存在的任务 (404)"
echo "=================================================="
echo "Request: DELETE ${BASE_URL}/todos/1"
echo "Payload: <none>"
echo "Response: "
curl -sS -X DELETE "${BASE_URL}/todos/1" \
  -w '\nHTTP Status: %{http_code}\n'
echo

echo "=================================================="
echo "9. 最终任务列表"
echo "=================================================="
echo "Request: GET ${BASE_URL}/todos"
echo "Payload: <none>"
echo "Response: "
curl -sS -X GET "${BASE_URL}/todos" \
  -w '\nHTTP Status: %{http_code}\n'
echo
