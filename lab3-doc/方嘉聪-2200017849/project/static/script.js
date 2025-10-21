const pendingListElement = document.getElementById("pending-list");
const completedListElement = document.getElementById("completed-list");
const pendingCountElement = document.getElementById("pending-count");
const completedCountElement = document.getElementById("completed-count");
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const filterCategorySelect = document.getElementById("filter-category");
const filterPrioritySelect = document.getElementById("filter-priority");
const resetFiltersButton = document.getElementById("reset-filters");
const sortFieldSelect = document.getElementById("sort-field");
const sortAscButton = document.getElementById("sort-asc");
const sortDescButton = document.getElementById("sort-desc");
const selectAllCheckbox = document.getElementById("select-all");
const bulkCompleteButton = document.getElementById("bulk-complete");
const bulkDeleteButton = document.getElementById("bulk-delete");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResetButton = document.getElementById("search-reset");

let currentCategoryFilter = "";
let currentPriorityFilter = "";
let currentSortField = "due_date";
let currentSortOrder = "asc";
let currentSearchQuery = "";
let currentTasks = [];
let visibleTaskIds = [];

const selectedTaskIds = new Set();
const priorityRank = { 高: 0, 中: 1, 低: 2 };

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

function compareDueDates(taskA, taskB) {
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
    return timeA - timeB;
}

// Sorts tasks based on the current sort field and order.
function sortTasks(taskItems) {
    const direction = currentSortOrder === "asc" ? 1 : -1;
    const copied = [...taskItems];
    copied.sort((taskA, taskB) => {
        if (currentSortField === "priority") {
            const rankA = priorityRank[taskA.priority] ?? 99;
            const rankB = priorityRank[taskB.priority] ?? 99;
            const diff = rankA - rankB;
            if (diff !== 0) {
                return diff * direction;
            }
            return compareDueDates(taskA, taskB);
        }
        const dueDiff = compareDueDates(taskA, taskB);
        if (dueDiff !== 0) {
            return dueDiff * direction;
        }
        const rankA = priorityRank[taskA.priority] ?? 99;
        const rankB = priorityRank[taskB.priority] ?? 99;
        return (rankA - rankB) * direction;
    });
    return copied;
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

function resetSelection() {
    selectedTaskIds.clear();
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
}

function updateSelectAllState() {
    const visibleCount = visibleTaskIds.length;
    if (!visibleCount) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    const selectedVisible = visibleTaskIds.filter((id) => selectedTaskIds.has(id)).length;
    if (selectedVisible === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedVisible === visibleCount) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function applyCheckboxSelection(shouldSelect) {
    visibleTaskIds.forEach((id) => {
        if (shouldSelect) {
            selectedTaskIds.add(id);
        } else {
            selectedTaskIds.delete(id);
        }
    });
    document.querySelectorAll(".task-select").forEach((checkbox) => {
        checkbox.checked = shouldSelect;
    });
    selectAllCheckbox.indeterminate = false;
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
        if (currentSearchQuery) {
            params.append("search", currentSearchQuery);
        }
        const query = params.toString();
        const response = await fetch(`/tasks${query ? `?${query}` : ""}`);
        const payload = await response.json();
        if (payload.status !== "success") {
            throw new Error(payload.message || "加载任务失败");
        }
        currentTasks = payload.data || [];
        renderTasks(currentTasks);
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
        resetSelection();
        loadTasks();
    } catch (error) {
        alert(error.message || "新增任务失败");
    }
}

async function handleToggleTask(task, listItem) {
    const targetStatus = !task.completed;
    if (targetStatus) {
        listItem.classList.add("completing");
        await new Promise((resolve) => setTimeout(resolve, 280));
    }
    try {
        await updateTask(task.id, { completed: targetStatus });
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
        selectedTaskIds.delete(taskId);
        loadTasks();
    } catch (error) {
        alert(error.message || "删除任务失败");
    }
}

// Applies filters based on selected category and priority.
function filterTasks() {
    currentCategoryFilter = filterCategorySelect.value;
    currentPriorityFilter = filterPrioritySelect.value;
    resetSelection();
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

function pruneSelection() {
    selectedTaskIds.forEach((id) => {
        if (!visibleTaskIds.includes(id)) {
            selectedTaskIds.delete(id);
        }
    });
}

function renderTaskList(container, tasks, isCompleted) {
    container.innerHTML = "";
    if (!tasks.length) {
        const empty = document.createElement("li");
        empty.className = "empty-state";
        empty.textContent = isCompleted ? "暂无已完成任务" : "暂无待处理任务";
        container.appendChild(empty);
        return;
    }

    tasks.forEach((task) => {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        const rowContainer = document.createElement("div");
        rowContainer.className = "task-row";

        const leftContainer = document.createElement("div");
        leftContainer.className = "task-left";

        const selectBox = document.createElement("input");
        selectBox.type = "checkbox";
        selectBox.className = "task-select";
        selectBox.checked = selectedTaskIds.has(task.id);
        selectBox.addEventListener("change", (event) => {
            if (event.target.checked) {
                selectedTaskIds.add(task.id);
            } else {
                selectedTaskIds.delete(task.id);
            }
            updateSelectAllState();
        });

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

        leftContainer.appendChild(selectBox);
        leftContainer.appendChild(detailsContainer);

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "task-actions";

        const toggleButton = document.createElement("button");
        toggleButton.className = "toggle-btn";
        toggleButton.textContent = task.completed ? "标记未完成" : "标记完成";
        toggleButton.addEventListener("click", () => handleToggleTask(task, listItem));

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

        rowContainer.appendChild(leftContainer);
        rowContainer.appendChild(actionsContainer);

        listItem.appendChild(rowContainer);
        container.appendChild(listItem);
    });
}

// Renders grouped task lists and updates counters.
function renderTasks(tasks) {
    const pendingTasks = sortTasks(tasks.filter((task) => !task.completed));
    const completedTasks = sortTasks(tasks.filter((task) => task.completed));

    visibleTaskIds = [...pendingTasks, ...completedTasks].map((task) => task.id);
    pruneSelection();

    renderTaskList(pendingListElement, pendingTasks, false);
    renderTaskList(completedListElement, completedTasks, true);

    pendingCountElement.textContent = pendingTasks.length;
    completedCountElement.textContent = completedTasks.length;

    updateSelectAllState();
}

async function performBatchAction(action) {
    if (!selectedTaskIds.size) {
        alert("请先选择至少一个任务");
        return;
    }
    if (action === "delete" && !confirm("确定要删除选中的任务吗？")) {
        return;
    }
    try {
        const response = await fetch("/tasks/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ids: Array.from(selectedTaskIds) }),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.message || "批量操作失败");
        }
        resetSelection();
        await loadTasks();
    } catch (error) {
        alert(error.message || "批量操作失败");
    }
}

taskForm.addEventListener("submit", addTask);
filterCategorySelect.addEventListener("change", filterTasks);
filterPrioritySelect.addEventListener("change", filterTasks);
sortFieldSelect.addEventListener("change", () => {
    currentSortField = sortFieldSelect.value;
    loadTasks();
});

resetFiltersButton.addEventListener("click", () => {
    filterCategorySelect.value = "";
    filterPrioritySelect.value = "";
    searchInput.value = "";
    sortFieldSelect.value = "due_date";
    currentCategoryFilter = "";
    currentPriorityFilter = "";
    currentSearchQuery = "";
    currentSortField = "due_date";
    currentSortOrder = "asc";
    resetSelection();
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

selectAllCheckbox.addEventListener("change", (event) => {
    applyCheckboxSelection(event.target.checked);
});

bulkCompleteButton.addEventListener("click", () => performBatchAction("complete"));
bulkDeleteButton.addEventListener("click", () => performBatchAction("delete"));

searchButton.addEventListener("click", () => {
    currentSearchQuery = searchInput.value.trim();
    resetSelection();
    loadTasks();
});

searchResetButton.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchQuery = "";
    resetSelection();
    loadTasks();
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        currentSearchQuery = searchInput.value.trim();
        resetSelection();
        loadTasks();
    }
});

document.addEventListener("DOMContentLoaded", loadTasks);
