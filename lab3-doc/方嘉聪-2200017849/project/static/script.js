const taskListElement = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const filterCategorySelect = document.getElementById("filter-category");
const filterPrioritySelect = document.getElementById("filter-priority");
const resetFiltersButton = document.getElementById("reset-filters");

let currentCategoryFilter = "";
let currentPriorityFilter = "";

// Fetches tasks from the backend and renders them.
async function loadTasks() {
    try {
        const params = new URLSearchParams();
        if (currentCategoryFilter) {
            params.append("category", currentCategoryFilter);
        }
        if (currentPriorityFilter) {
            params.append("priority", currentPriorityFilter);
        }
        const query = params.toString();
        const response = await fetch(`/tasks${query ? `?${query}` : ""}`);
        const payload = await response.json();
        if (payload.status !== "success") {
            throw new Error(payload.message || "加载任务失败");
        }
        renderTasks(payload.data || []);
    } catch (error) {
        alert(error.message || "无法加载任务列表");
    }
}

// Sends a new task to the backend.
async function addTask(event) {
    event.preventDefault();
    const newTask = {
        title: titleInput.value.trim(),
        category: categorySelect.value,
        priority: prioritySelect.value,
    };
    if (!newTask.title || !newTask.category || !newTask.priority) {
        alert("请填写完整的任务信息");
        return;
    }
    try {
        const response = await fetch("/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.message || "新增任务失败");
        }
        taskForm.reset();
        loadTasks();
    } catch (error) {
        alert(error.message || "新增任务失败");
    }
}

// Toggles task completion status via backend call.
async function toggleTask(taskId, isCompleted) {
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !isCompleted }),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.message || "更新任务状态失败");
        }
        loadTasks();
    } catch (error) {
        alert(error.message || "更新任务状态失败");
    }
}

// Deletes a task by id.
async function deleteTask(taskId) {
    if (!confirm("确定要删除该任务吗？")) {
        return;
    }
    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: "DELETE",
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.message || "删除任务失败");
        }
        loadTasks();
    } catch (error) {
        alert(error.message || "删除任务失败");
    }
}

// Applies filters based on selected category and priority.
function filterTasks() {
    currentCategoryFilter = filterCategorySelect.value;
    currentPriorityFilter = filterPrioritySelect.value;
    loadTasks();
}

// Renders the list of tasks into the DOM.
function renderTasks(taskItems) {
    taskListElement.innerHTML = "";
    if (!taskItems.length) {
        taskListElement.innerHTML = "<li class=\"empty-state\">暂无任务，请添加新任务。</li>";
        return;
    }
    taskItems.forEach((task) => {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        const detailsContainer = document.createElement("div");
        detailsContainer.className = "task-details";

        const titleElement = document.createElement("p");
        titleElement.className = "task-title";
        if (task.completed) {
            titleElement.classList.add("completed");
        }
        titleElement.textContent = task.title;

        const metaElement = document.createElement("div");
        metaElement.className = "task-meta";

        const categoryElement = document.createElement("span");
        categoryElement.textContent = `分类：${task.category}`;

        const priorityElement = document.createElement("span");
        priorityElement.textContent = `优先级：${task.priority}`;
        priorityElement.classList.add(
            task.priority === "高"
                ? "priority-high"
                : task.priority === "中"
                ? "priority-medium"
                : "priority-low"
        );

        metaElement.appendChild(categoryElement);
        metaElement.appendChild(priorityElement);

        detailsContainer.appendChild(titleElement);
        detailsContainer.appendChild(metaElement);

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "task-actions";

        const toggleButton = document.createElement("button");
        toggleButton.className = "toggle-btn";
        toggleButton.textContent = task.completed ? "标记未完成" : "标记完成";
        toggleButton.addEventListener("click", () => toggleTask(task.id, task.completed));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "删除";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        actionsContainer.appendChild(toggleButton);
        actionsContainer.appendChild(deleteButton);

        listItem.appendChild(detailsContainer);
        listItem.appendChild(actionsContainer);
        taskListElement.appendChild(listItem);
    });
}

taskForm.addEventListener("submit", addTask);
filterCategorySelect.addEventListener("change", filterTasks);
filterPrioritySelect.addEventListener("change", filterTasks);
resetFiltersButton.addEventListener("click", () => {
    filterCategorySelect.value = "";
    filterPrioritySelect.value = "";
    currentCategoryFilter = "";
    currentPriorityFilter = "";
    loadTasks();
});

document.addEventListener("DOMContentLoaded", loadTasks);
