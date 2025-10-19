// TodoList 前端逻辑实现
class TodoApp {
	constructor() {
		this.apiBaseUrl = "http://localhost:6597";
		this.tasks = [];
		this.currentFilters = {
			category: "",
			priority: "",
		};

		this.init();
	}

	// 初始化应用
	init() {
		this.bindEvents();
		this.loadTasks();
	}

	// 绑定事件监听器
	bindEvents() {
		// 添加任务表单提交
		document.getElementById("task-form").addEventListener("submit", (e) => {
			e.preventDefault();
			this.addTask();
		});

		// 筛选控制
		document
			.getElementById("filter-category")
			.addEventListener("change", (e) => {
				this.currentFilters.category = e.target.value;
				this.loadTasks();
			});

		document
			.getElementById("filter-priority")
			.addEventListener("change", (e) => {
				this.currentFilters.priority = e.target.value;
				this.loadTasks();
			});

		// 清除筛选
		document.getElementById("clear-filters").addEventListener("click", () => {
			this.clearFilters();
		});
	}

	// 显示加载状态
	showLoading() {
		document.getElementById("loading").classList.remove("hidden");
		document.getElementById("error-message").classList.add("hidden");
		document.getElementById("empty-message").classList.add("hidden");
	}

	// 隐藏加载状态
	hideLoading() {
		document.getElementById("loading").classList.add("hidden");
	}

	// 显示错误消息
	showError(message) {
		const errorElement = document.getElementById("error-message");
		errorElement.textContent = message;
		errorElement.classList.remove("hidden");
		document.getElementById("loading").classList.add("hidden");
		document.getElementById("empty-message").classList.add("hidden");
	}

	// 隐藏错误消息
	hideError() {
		document.getElementById("error-message").classList.add("hidden");
	}

	// 显示空状态消息
	showEmptyMessage() {
		document.getElementById("empty-message").classList.remove("hidden");
		document.getElementById("loading").classList.add("hidden");
		document.getElementById("error-message").classList.add("hidden");
	}

	// 隐藏空状态消息
	hideEmptyMessage() {
		document.getElementById("empty-message").classList.add("hidden");
	}

	// 构建API URL
	buildApiUrl(endpoint = "") {
		let url = `${this.apiBaseUrl}/tasks${endpoint}`;
		const params = new URLSearchParams();

		if (this.currentFilters.category) {
			params.append("category", this.currentFilters.category);
		}
		if (this.currentFilters.priority) {
			params.append("priority", this.currentFilters.priority);
		}

		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		return url;
	}

	// 发送API请求
	async apiRequest(url, options = {}) {
		try {
			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					...options.headers,
				},
				...options,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || `HTTP错误: ${response.status}`);
			}

			return data;
		} catch (error) {
			console.error("API请求失败:", error);
			throw error;
		}
	}

	// 加载任务列表
	async loadTasks() {
		try {
			this.showLoading();
			this.hideError();

			const url = this.buildApiUrl();
			const response = await this.apiRequest(url);

			this.tasks = response.data || [];
			this.renderTasks();
			this.updateStats();
		} catch (error) {
			this.showError(`加载任务失败: ${error.message}`);
		} finally {
			this.hideLoading();
		}
	}

	// 添加新任务
	async addTask() {
		try {
			const form = document.getElementById("task-form");
			const formData = new FormData(form);

			const taskData = {
				title: formData.get("title").trim(),
				category: formData.get("category"),
				priority: formData.get("priority"),
			};

			if (!taskData.title) {
				alert("请输入任务标题");
				return;
			}

			this.showLoading();
			this.hideError();

			const response = await this.apiRequest(this.buildApiUrl(), {
				method: "POST",
				body: JSON.stringify(taskData),
			});

			if (response.status === "success") {
				// 清空表单
				form.reset();
				// 重新加载任务列表
				await this.loadTasks();
				this.showSuccessMessage("任务添加成功！");
			}
		} catch (error) {
			this.showError(`添加任务失败: ${error.message}`);
		} finally {
			this.hideLoading();
		}
	}

	// 切换任务完成状态
	async toggleTask(taskId) {
		try {
			const task = this.tasks.find((t) => t.id === taskId);
			if (!task) return;

			const newStatus = !task.completed;

			const response = await this.apiRequest(
				`${this.apiBaseUrl}/tasks/${taskId}`,
				{
					method: "PUT",
					body: JSON.stringify({ completed: newStatus }),
				}
			);

			if (response.status === "success") {
				await this.loadTasks();
				this.showSuccessMessage(`任务已标记为${newStatus ? "完成" : "未完成"}`);
			}
		} catch (error) {
			this.showError(`更新任务失败: ${error.message}`);
		}
	}

	// 删除任务
	async deleteTask(taskId) {
		try {
			if (!confirm("确定要删除这个任务吗？")) {
				return;
			}

			const response = await this.apiRequest(
				`${this.apiBaseUrl}/tasks/${taskId}`,
				{
					method: "DELETE",
				}
			);

			if (response.status === "success") {
				await this.loadTasks();
				this.showSuccessMessage("任务删除成功！");
			}
		} catch (error) {
			this.showError(`删除任务失败: ${error.message}`);
		}
	}

	// 渲染任务列表
	renderTasks() {
		const taskList = document.getElementById("task-list");
		const taskCount = document.getElementById("task-count");

		taskList.innerHTML = "";
		taskCount.textContent = `(${this.tasks.length})`;
		this.updateFilterStatus();

		if (this.tasks.length === 0) {
			this.showEmptyMessage();
			return;
		}

		this.hideEmptyMessage();

		this.tasks.forEach((task) => {
			const taskElement = this.createTaskElement(task);
			taskList.appendChild(taskElement);
		});
	}

	// 创建任务元素
	createTaskElement(task) {
		const li = document.createElement("li");
		li.className = `task-item priority-${task.priority} ${
			task.completed ? "completed" : ""
		}`;

		li.innerHTML = `
            <div class="task-info">
                <div class="task-title ${
									task.completed ? "completed" : ""
								}">${this.escapeHtml(task.title)}</div>
                <div class="task-category category-${
									task.category
								}">${this.escapeHtml(task.category)}</div>
                <div class="task-priority priority-${
									task.priority
								}">${this.escapeHtml(task.priority)}</div>
                <div class="task-status status-${
									task.completed ? "completed" : "pending"
								}">
                    ${task.completed ? "已完成" : "待完成"}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-success" onclick="app.toggleTask(${
									task.id
								})">
                    ${task.completed ? "标记未完成" : "标记完成"}
                </button>
                <button class="btn btn-danger" onclick="app.deleteTask(${
									task.id
								})">
                    删除
                </button>
            </div>
        `;

		return li;
	}

	// 更新统计信息
	updateStats() {
		const totalTasks = this.tasks.length;
		const completedTasks = this.tasks.filter((task) => task.completed).length;
		const pendingTasks = totalTasks - completedTasks;

		document.getElementById("total-tasks").textContent = totalTasks;
		document.getElementById("completed-tasks").textContent = completedTasks;
		document.getElementById("pending-tasks").textContent = pendingTasks;
	}

	// 清除筛选
	clearFilters() {
		this.currentFilters = { category: "", priority: "" };
		document.getElementById("filter-category").value = "";
		document.getElementById("filter-priority").value = "";
		this.loadTasks();
	}

	// 更新筛选状态显示
	updateFilterStatus() {
		const filterStatus = document.getElementById("filter-status");
		const filterCount = document.getElementById("filter-count");

		if (!filterStatus || !filterCount) return;

		// 构建筛选描述
		let filterText = "当前筛选: ";
		const filters = [];

		if (this.currentFilters.category) {
			filters.push(`类别=${this.currentFilters.category}`);
		}
		if (this.currentFilters.priority) {
			filters.push(`优先级=${this.currentFilters.priority}`);
		}

		if (filters.length === 0) {
			filterText += "全部任务";
		} else {
			filterText += filters.join(" + ");
		}

		// 更新文本和计数
		filterStatus.querySelector("span").textContent = filterText;
		filterCount.textContent = this.tasks.length;

		// 显示状态指示器
		filterStatus.classList.add("active");

		// 如果有筛选条件，添加特殊样式
		if (filters.length > 0) {
			filterStatus.style.background = "rgba(79, 172, 254, 0.15)";
			filterStatus.style.border = "1px solid rgba(79, 172, 254, 0.3)";
		} else {
			filterStatus.style.background = "rgba(79, 172, 254, 0.1)";
			filterStatus.style.border = "none";
		}
	}

	// 显示成功消息
	showSuccessMessage(message) {
		// 创建临时成功提示
		const successDiv = document.createElement("div");
		successDiv.className = "success-message";
		successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;
		successDiv.textContent = message;

		document.body.appendChild(successDiv);

		// 3秒后自动移除
		setTimeout(() => {
			successDiv.style.animation = "slideOut 0.3s ease";
			setTimeout(() => {
				if (successDiv.parentNode) {
					successDiv.parentNode.removeChild(successDiv);
				}
			}, 300);
		}, 3000);
	}

	// HTML转义防止XSS
	escapeHtml(text) {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}
}

// 添加CSS动画
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化应用
let app;
document.addEventListener("DOMContentLoaded", () => {
	app = new TodoApp();

	// 添加键盘快捷键支持
	document.addEventListener("keydown", (e) => {
		// Ctrl+Enter 快速添加任务
		if (e.ctrlKey && e.key === "Enter") {
			const titleInput = document.getElementById("title");
			if (document.activeElement === titleInput) {
				app.addTask();
			}
		}

		// Escape 清除筛选
		if (e.key === "Escape") {
			app.clearFilters();
		}
	});

	// 定期检查服务器连接状态
	setInterval(async () => {
		try {
			await fetch(`${app.apiBaseUrl}/health`);
		} catch (error) {
			console.warn("服务器连接异常:", error.message);
		}
	}, 30000); // 每30秒检查一次
});

// 导出到全局作用域，供HTML中的onclick使用
window.app = app;
