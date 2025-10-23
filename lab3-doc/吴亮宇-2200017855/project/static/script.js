const API_URL = "http://127.0.0.1:5000/tasks";

// 页面加载时加载任务
window.onload = function() {
    loadTasks();
};

/** 加载任务列表 */
async function loadTasks() {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data.status === "success") {
        renderTasks(data.data);
    }
}

/** 渲染任务列表 */
function renderTasks(tasks) {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = "<p style='text-align:center;color:#888;'>暂无任务</p>";
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";

        // 优先级样式
        let priorityClass = "";
        if (task.priority === "高") priorityClass = "priority-high";
        else if (task.priority === "中") priorityClass = "priority-medium";
        else priorityClass = "priority-low";

        // 标题样式
        const titleClass = task.completed ? "task-title completed" : "task-title";

        card.innerHTML = `
            <div class="task-info">
                <p class="${titleClass}">${task.title}</p>
                <small>分类：${task.category} | 
                    <span class="${priorityClass}">优先级：${task.priority}</span>
                </small>
            </div>
            <div class="task-actions">
                <button onclick="toggleTask('${task.id}', ${!task.completed})">
                    ${task.completed ? "未完成" : "完成"}
                </button>
                <button onclick="deleteTask('${task.id}')">删除</button>
            </div>
        `;
        list.appendChild(card);
    });
}

/** 添加任务 */
async function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const category = document.getElementById("taskCategory").value;
    const priority = document.getElementById("taskPriority").value;

    if (!title) {
        alert("请输入任务标题！");
        return;
    }

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, priority })
    });

    const data = await res.json();
    if (data.status === "success") {
        document.getElementById("taskTitle").value = "";
        loadTasks();
    } else {
        alert(data.message);
    }
}

/** 删除任务 */
async function deleteTask(id) {
    if (!confirm("确定删除此任务吗？")) return;

    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "success") loadTasks();
}

/** 切换任务完成状态 */
async function toggleTask(id, completed) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed })
    });

    const data = await res.json();
    if (data.status === "success") loadTasks();
}

/** 筛选任务 */
async function filterTasks() {
    const category = document.getElementById("filterCategory").value;
    const priority = document.getElementById("filterPriority").value;

    let query = [];
    if (category) query.push(`category=${category}`);
    if (priority) query.push(`priority=${priority}`);

    const url = query.length ? `${API_URL}?${query.join("&")}` : API_URL;

    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "success") {
        renderTasks(data.data);
    }
}
