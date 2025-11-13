#!/usr/bin/env bash
# Simple test script for the TodoList API
set -euo pipefail

HOST=${1:-http://127.0.0.1:5000}


echo "Create a valid task"
curl -s -X POST "$HOST/tasks" -H "Content-Type: application/json" -d '{"title":"写实验报告","category":"学习","priority":"高","dueTime":"2025-12-31T23:59"}' | jq

echo "Create a task with invalid dueTime (before created)"
curl -s -X POST "$HOST/tasks" -H "Content-Type: application/json" -d '{"title":"过期任务","category":"工作","priority":"中","dueTime":"2000-01-01T00:00"}' | jq

echo "List all tasks"
curl -s "$HOST/tasks" | jq

echo "Filter by category 学习"
curl -s "$HOST/tasks?category=学习" | jq

echo "Search by title '实验'"
curl -s "$HOST/tasks?search=实验" | jq

echo "Mark task 1 as completed"
curl -s -X PUT "$HOST/tasks/1" -H "Content-Type: application/json" -d '{"completed":true}' | jq

echo "Delete task 1"
curl -s -X DELETE "$HOST/tasks/1" | jq

echo "Done"


