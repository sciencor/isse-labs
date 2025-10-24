from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from typing import List, Dict, Optional, Any
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Task:
    """任务数据模型类"""

    def __init__(
        self,
        task_id: int,
        title: str,
        category: str = "其他",
        priority: str = "中",
        completed: bool = False,
    ):
        self.id = task_id
        self.title = title.strip()
        self.category = category
        self.priority = priority
        self.completed = completed
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """将任务对象转换为字典"""
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "priority": self.priority,
            "completed": self.completed,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def update(self, **kwargs) -> None:
        """更新任务属性"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now()

    def mark_completed(self, completed: bool) -> None:
        """标记任务完成状态"""
        self.completed = completed
        self.updated_at = datetime.now()


class TaskManager:
    """任务管理器类"""

    def __init__(self):
        self.tasks: List[Task] = []
        self.next_id = 1
        self.valid_categories = ["学习", "工作", "生活", "其他"]
        self.valid_priorities = ["高", "中", "低"]

    def create_task(
        self, title: str, category: str = "其他", priority: str = "中"
    ) -> Task:
        """创建新任务"""
        # 验证和标准化输入
        category = self._validate_category(category)
        priority = self._validate_priority(priority)

        # 创建任务对象
        task = Task(
            task_id=self.next_id, title=title, category=category, priority=priority
        )

        self.tasks.append(task)
        self.next_id += 1

        logger.info(f"创建新任务: {task.title} (ID: {task.id})")
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """根据ID获取任务"""
        return next((task for task in self.tasks if task.id == task_id), None)

    def get_tasks(
        self, category: Optional[str] = None, priority: Optional[str] = None
    ) -> List[Task]:
        """获取任务列表，支持筛选"""
        filtered_tasks = self.tasks.copy()

        if category:
            filtered_tasks = [
                task for task in filtered_tasks if task.category == category
            ]

        if priority:
            filtered_tasks = [
                task for task in filtered_tasks if task.priority == priority
            ]

        return filtered_tasks

    def update_task(self, task_id: int, **kwargs) -> Optional[Task]:
        """更新任务"""
        task = self.get_task(task_id)
        if not task:
            return None

        # 验证更新数据
        if "category" in kwargs:
            kwargs["category"] = self._validate_category(kwargs["category"])
        if "priority" in kwargs:
            kwargs["priority"] = self._validate_priority(kwargs["priority"])

        task.update(**kwargs)
        logger.info(f"更新任务: {task.title} (ID: {task.id})")
        return task

    def delete_task(self, task_id: int) -> bool:
        """删除任务"""
        task = self.get_task(task_id)
        if not task:
            return False

        self.tasks = [task for task in self.tasks if task.id != task_id]
        logger.info(f"删除任务: {task.title} (ID: {task.id})")
        return True

    def get_statistics(self) -> Dict[str, int]:
        """获取任务统计信息"""
        total = len(self.tasks)
        completed = sum(1 for task in self.tasks if task.completed)
        pending = total - completed

        return {"total": total, "completed": completed, "pending": pending}

    def _validate_category(self, category: str) -> str:
        """验证并标准化类别"""
        if category not in self.valid_categories:
            logger.warning(f"无效的类别 '{category}'，使用默认值 '其他'")
            return "其他"
        return category

    def _validate_priority(self, priority: str) -> str:
        """验证并标准化优先级"""
        if priority not in self.valid_priorities:
            logger.warning(f"无效的优先级 '{priority}'，使用默认值 '中'")
            return "中"
        return priority


class TodoListAPI:
    """TodoList API 主类"""

    def __init__(self):
        self.app = Flask(__name__, static_folder=".", static_url_path="")
        CORS(self.app)  # 允许跨域请求
        self.task_manager = TaskManager()
        self._setup_routes()
        self._setup_error_handlers()

    def _setup_routes(self):
        """设置路由"""

        @self.app.route("/")
        def index():
            """首页路由，返回TodoList页面"""
            try:
                with open("index.html", "r", encoding="utf-8") as f:
                    html_content = f.read()
                return html_content
            except FileNotFoundError:
                return (
                    jsonify(
                        {"status": "error", "data": None, "message": "页面文件未找到"}
                    ),
                    404,
                )

        @self.app.route("/<path:filename>")
        def static_files(filename):
            """静态文件服务"""
            try:
                return self.app.send_static_file(filename)
            except FileNotFoundError:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": None,
                            "message": f"文件 {filename} 未找到",
                        }
                    ),
                    404,
                )

        @self.app.route("/tasks", methods=["GET"])
        def get_tasks():
            """获取所有任务，支持按类别和优先级筛选"""
            try:
                category = request.args.get("category")
                priority = request.args.get("priority")

                tasks = self.task_manager.get_tasks(category, priority)
                task_dicts = [task.to_dict() for task in tasks]

                return jsonify(
                    {
                        "status": "success",
                        "data": task_dicts,
                        "message": f"成功获取{len(task_dicts)}个任务",
                    }
                )
            except Exception as e:
                logger.error(f"获取任务失败: {str(e)}")
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": [],
                            "message": f"获取任务失败: {str(e)}",
                        }
                    ),
                    500,
                )

        @self.app.route("/tasks", methods=["POST"])
        def create_task():
            """创建新任务"""
            try:
                data = request.get_json()

                # 验证必需字段
                if not data or "title" not in data:
                    return (
                        jsonify(
                            {
                                "status": "error",
                                "data": None,
                                "message": "任务标题不能为空",
                            }
                        ),
                        400,
                    )

                # 创建任务
                task = self.task_manager.create_task(
                    title=data["title"],
                    category=data.get("category", "其他"),
                    priority=data.get("priority", "中"),
                )

                return (
                    jsonify(
                        {
                            "status": "success",
                            "data": task.to_dict(),
                            "message": "任务创建成功",
                        }
                    ),
                    201,
                )

            except Exception as e:
                logger.error(f"创建任务失败: {str(e)}")
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": None,
                            "message": f"创建任务失败: {str(e)}",
                        }
                    ),
                    500,
                )

        @self.app.route("/tasks/<int:task_id>", methods=["PUT"])
        def update_task(task_id):
            """更新任务状态"""
            try:
                data = request.get_json()

                # 查找任务
                task = self.task_manager.get_task(task_id)
                if not task:
                    return (
                        jsonify(
                            {
                                "status": "error",
                                "data": None,
                                "message": f"任务ID {task_id} 不存在",
                            }
                        ),
                        404,
                    )

                # 更新任务
                updated_task = self.task_manager.update_task(task_id, **data)
                if not updated_task:
                    return (
                        jsonify(
                            {
                                "status": "error",
                                "data": None,
                                "message": f"任务ID {task_id} 不存在",
                            }
                        ),
                        404,
                    )

                return jsonify(
                    {
                        "status": "success",
                        "data": updated_task.to_dict(),
                        "message": "任务更新成功",
                    }
                )

            except Exception as e:
                logger.error(f"更新任务失败: {str(e)}")
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": None,
                            "message": f"更新任务失败: {str(e)}",
                        }
                    ),
                    500,
                )

        @self.app.route("/tasks/<int:task_id>", methods=["DELETE"])
        def delete_task(task_id):
            """删除任务"""
            try:
                success = self.task_manager.delete_task(task_id)
                if not success:
                    return (
                        jsonify(
                            {
                                "status": "error",
                                "data": None,
                                "message": f"任务ID {task_id} 不存在",
                            }
                        ),
                        404,
                    )

                return jsonify(
                    {
                        "status": "success",
                        "data": None,
                        "message": f"任务 {task_id} 删除成功",
                    }
                )

            except Exception as e:
                logger.error(f"删除任务失败: {str(e)}")
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": None,
                            "message": f"删除任务失败: {str(e)}",
                        }
                    ),
                    500,
                )

        @self.app.route("/health", methods=["GET"])
        def health_check():
            """健康检查接口"""
            stats = self.task_manager.get_statistics()
            return jsonify(
                {
                    "status": "success",
                    "data": {"message": "服务运行正常", "statistics": stats},
                    "message": "TodoList API 服务正常",
                }
            )

        @self.app.route("/stats", methods=["GET"])
        def get_statistics():
            """获取统计信息接口"""
            try:
                stats = self.task_manager.get_statistics()
                return jsonify(
                    {"status": "success", "data": stats, "message": "统计信息获取成功"}
                )
            except Exception as e:
                logger.error(f"获取统计信息失败: {str(e)}")
                return (
                    jsonify(
                        {
                            "status": "error",
                            "data": None,
                            "message": f"获取统计信息失败: {str(e)}",
                        }
                    ),
                    500,
                )

    def _setup_error_handlers(self):
        """设置错误处理器"""

        @self.app.errorhandler(404)
        def not_found(error):
            return (
                jsonify(
                    {"status": "error", "data": None, "message": "请求的资源不存在"}
                ),
                404,
            )

        @self.app.errorhandler(500)
        def internal_error(error):
            return (
                jsonify({"status": "error", "data": None, "message": "服务器内部错误"}),
                500,
            )

    def run(self, debug=True, host="localhost", port=6597):
        """启动服务器"""
        print("启动TodoList API服务器...")
        print("API文档:")
        print("GET    /                - TodoList 主页面")
        print("GET    /tasks           - 获取所有任务")
        print("POST   /tasks           - 创建新任务")
        print("PUT    /tasks/<id>      - 更新任务状态")
        print("DELETE /tasks/<id>      - 删除任务")
        print("GET    /health          - 健康检查")
        print("GET    /stats           - 获取统计信息")
        print(f"\n服务器地址: http://{host}:{port}")
        print(f"TodoList 页面: http://{host}:{port}/")

        self.app.run(debug=debug, host=host, port=port)


# 创建API实例
todo_api = TodoListAPI()
app = todo_api.app

if __name__ == "__main__":
    todo_api.run()
