#!/bin/bash

# TodoList 任务管理系统启动脚本

echo "=================================="
echo "  TodoList 任务管理系统"
echo "=================================="
echo ""

# 检查是否已安装 Flask
if ! python -c "import flask" 2>/dev/null; then
    echo "❌ Flask 未安装，正在安装..."
    pip install flask
fi

# 启动后端服务
echo "🚀 正在启动后端服务..."
echo "   地址: http://localhost:5000"
echo ""

# 在后台启动 Flask
python app.py --host 0.0.0.0 --port 5000 --debug &
FLASK_PID=$!

# 等待后端启动
sleep 2

# 启动前端服务
echo "🌐 正在启动前端服务..."
echo "   地址: http://localhost:8080"
echo ""

# 在后台启动 HTTP 服务器
python -m http.server 8080 &
HTTP_PID=$!

sleep 1

echo "=================================="
echo "✅ 系统启动成功！"
echo "=================================="
echo ""
echo "请在浏览器中访问："
echo "👉 http://localhost:8080/index.html"
echo ""
echo "按 Ctrl+C 停止服务..."
echo ""

# 捕获 Ctrl+C 信号
trap "echo ''; echo '正在停止服务...'; kill $FLASK_PID $HTTP_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait

