#!/usr/bin/env bash
set -euo pipefail
BASE_URL="http://127.0.0.1:5000"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
FLASK_LOG="$BASE_DIR/flask.log"
APP_PY="$BASE_DIR/app.py"
SERVER_STARTED_BY_SCRIPT=0

start_server_if_needed(){
	if ss -tulpn | grep -q ":5000"; then
		echo "Flask already listening on 5000"
		return 0
	fi
	echo "Starting Flask using .venv python..."
	nohup ../../.venv/bin/python "$APP_PY" > "$FLASK_LOG" 2>&1 &
	SERVER_PID=$!
	SERVER_STARTED_BY_SCRIPT=1
	# wait for port
	for i in {1..40}; do
		if ss -tulpn | grep -q ":5000"; then
			echo "Port 5000 is listening"
			return 0
		fi
		sleep 0.2
	done
	echo "Timeout waiting for Flask to listen on 5000"
	return 1
}

stop_server_if_started(){
	if [ "$SERVER_STARTED_BY_SCRIPT" -eq 1 ]; then
		echo "Stopping Flask (pid $SERVER_PID) ..."
		kill "$SERVER_PID" || true
	fi
}

trap stop_server_if_started EXIT

start_server_if_needed || true

echo "1) GET /"
curl -sS -i "$BASE_URL/" || true

echo -e "\n2) GET /script.js"
curl -sS -i "$BASE_URL/script.js" || true

echo -e "\n3) POST /tasks (添加 integration-test)"
curl -sS -i -X POST "$BASE_URL/tasks" -H "Content-Type: application/json" -d @- <<'JSON' || true
{"title":"integration-test","description":"from integration script","priority":"高","category":"学习","due_date":"2025-11-01","completed":false}
JSON

echo -e "\n4) GET /tasks"
curl -sS -i "$BASE_URL/tasks" || true

echo -e "\n5) PUT /tasks/1 (标记完成)"
curl -sS -i -X PUT "$BASE_URL/tasks/1" -H "Content-Type: application/json" -d @- <<'JSON' || true
{"completed":true}
JSON

echo -e "\n6) GET /tasks"
curl -sS -i "$BASE_URL/tasks" || true

echo -e "\n7) DELETE /tasks/1"
curl -sS -i -X DELETE "$BASE_URL/tasks/1" || true

echo -e "\n8) GET /tasks"
curl -sS -i "$BASE_URL/tasks" || true

echo -e "\n9) tasks.json content"
sed -n '1,200p' "$BASE_DIR/tasks.json" || true

exit 0
