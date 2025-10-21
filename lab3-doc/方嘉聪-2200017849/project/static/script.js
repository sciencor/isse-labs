const taskListElement = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const filterCategorySelect = document.getElementById("filter-category");
const filterPrioritySelect = document.getElementById("filter-priority");
const resetFiltersButton = document.getElementById("reset-filters");
const sortAscButton = document.getElementById("sort-asc");
const sortDescButton = document.getElementById("sort-desc");

let currentCategoryFilter = "";
let currentPriorityFilter = "";
let currentSortOrder = "asc";

// Returns a human-friendly string for due dates.
function formatDueDate(dueDate) {
    if (!dueDate) {
        return "未设置";
    }
    const parsedDate = new Date(dueDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return dueDate;
    }
    return parsedDate.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Returns a datetime-local compatible value from ISO string.
function toDatetimeLocalValue(dueDate) {
    if (!dueDate) {
        return "";
    }
    const parsedDate = new Date(dueDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Sorts tasks based on the current due date order preference.
function sortTasks(taskItems) {
    const copiedTasks = [...taskItems];
    copiedTasks.sort((taskA, taskB) => {
        const timeA = taskA.due_date ? new Date(taskA.due_date).getTime() : null;
        const timeB = taskB.due_date ? new Date(taskB.due_date).getTime() : null;
        if (timeA === null && timeB === null) {
            return 0;
        }
        if (timeA === null) {
            return 1;
        }
        if (timeB === null) {
            return -1;
        }
        if (currentSortOrder === "asc") {
            return timeA - timeB;
        }
        return timeB - timeA;
    });
    return copiedTasks;
}

// Sends updates for an existing task to the backend.
async function updateTask(taskId, updates) {
    const response = await fetch(`/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload.message || "更新任务失败");
    }
    loadTasks();
}

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
        const tasks = sortTasks(payload.data || []);
        renderTasks(tasks);
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
        due_date: dueDateInput.value,
    };
    if (!newTask.title || !newTask.category || !newTask.priority || !newTask.due_date) {
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
        await updateTask(taskId, { completed: !isCompleted });
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

// Opens an inline edit form allowing users to modify a task.
function openEditForm(task, listItem, detailsContainer, actionsContainer) {
    if (listItem.querySelector(".task-edit-form")) {
        return;
    }

    detailsContainer.classList.add("hidden");
    actionsContainer.classList.add("hidden");

    const editForm = document.createElement("form");
    editForm.className = "task-edit-form";

    const titleField = document.createElement("input");
    titleField.type = "text";
    titleField.value = task.title;
    titleField.required = true;

    const categoryField = document.createElement("select");
    ["学习", "工作", "生活"].forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        if (task.category === optionValue) {
            option.selected = true;
        }
        categoryField.appendChild(option);
    });

    const priorityField = document.createElement("select");
    ["高", "中", "低"].forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        if (task.priority === optionValue) {
            option.selected = true;
        }
        priorityField.appendChild(option);
    });

    const dueDateField = document.createElement("input");
    dueDateField.type = "datetime-local";
    dueDateField.required = true;
    dueDateField.value = toDatetimeLocalValue(task.due_date);

    const editActions = document.createElement("div");
    editActions.className = "task-edit-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "save-btn";
    saveButton.textContent = "保存";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-btn";
    cancelButton.textContent = "取消";

    editActions.appendChild(saveButton);
    editActions.appendChild(cancelButton);

    editForm.appendChild(titleField);
    editForm.appendChild(categoryField);
    editForm.appendChild(priorityField);
    editForm.appendChild(dueDateField);
    editForm.appendChild(editActions);

    listItem.appendChild(editForm);

    cancelButton.addEventListener("click", () => {
        listItem.removeChild(editForm);
        detailsContainer.classList.remove("hidden");
        actionsContainer.classList.remove("hidden");
    });

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const updatedTask = {
            title: titleField.value.trim(),
            category: categoryField.value,
            priority: priorityField.value,
            due_date: dueDateField.value,
        };
        if (!updatedTask.title || !updatedTask.due_date) {
            alert("请完整填写任务信息");
            return;
        }
        try {
            await updateTask(task.id, updatedTask);
        } catch (error) {
            alert(error.message || "更新任务失败");
        }
    });
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

        const rowContainer = document.createElement("div");
        rowContainer.className = "task-row";

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

        const dueDateElement = document.createElement("span");
        dueDateElement.className = "due-date";
        dueDateElement.textContent = `截止：${formatDueDate(task.due_date)}`;

        metaElement.appendChild(categoryElement);
        metaElement.appendChild(priorityElement);
        metaElement.appendChild(dueDateElement);

        detailsContainer.appendChild(titleElement);
        detailsContainer.appendChild(metaElement);

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "task-actions";

        const toggleButton = document.createElement("button");
        toggleButton.className = "toggle-btn";
        toggleButton.textContent = task.completed ? "标记未完成" : "标记完成";
        toggleButton.addEventListener("click", () => toggleTask(task.id, task.completed));

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "编辑";
        editButton.addEventListener("click", () => openEditForm(task, listItem, detailsContainer, actionsContainer));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "删除";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        actionsContainer.appendChild(toggleButton);
        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);

        rowContainer.appendChild(detailsContainer);
        rowContainer.appendChild(actionsContainer);

        listItem.appendChild(rowContainer);
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

sortAscButton.addEventListener("click", () => {
    currentSortOrder = "asc";
    loadTasks();
});

sortDescButton.addEventListener("click", () => {
    currentSortOrder = "desc";
    loadTasks();
});

document.addEventListener("DOMContentLoaded", loadTasks);
