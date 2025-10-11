@echo off
@REM 命令行编码设置为 UTF-8
chcp 65001 >nul
cd /d "E:\Github\isse-labs\lab2-doc\丁健-2300016653"

set BASE_URL=http://localhost:5000

echo 测试欢迎页面:
curl -s "%BASE_URL%/"
echo.

echo 测试显示空待办列表:
curl -s "%BASE_URL%/show_todos"
echo.

echo 测试添加待办事项1:
curl -s "%BASE_URL%/add_todo?task=Flask" -H "Accept: application/json;charset=utf-8
echo.

echo 测试添加待办事项2:
curl -s "%BASE_URL%/add_todo?task=编写API文档" -H "Accept: application/json;charset=utf-8
echo.

echo 测试显示所有待办事项:
curl -s "%BASE_URL%/show_todos" -H "Accept: application/json;charset=utf-8
echo.

echo 测试更新待办事项1:
curl -s "%BASE_URL%/update_todo?id=1&task=学习Python Flask" -H "Accept: application/json;charset=utf-8
echo.

echo 测试删除待办事项2:
curl -s "%BASE_URL%/remove_todo?id=2" -H "Accept: application/json;charset=utf-8
echo.

echo 再次显示所有待办事项:
curl -s "%BASE_URL%/show_todos" -H "Accept: application/json;charset=utf-8
echo.

pause

