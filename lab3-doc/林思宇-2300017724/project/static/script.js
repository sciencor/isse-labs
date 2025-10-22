const API_BASE = "/tasks";

const taskListElement = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const categorySelect = document.getElementById("taskCategory");
const prioritySelect = document.getElementById("taskPriority");
const dueDateInput = document.getElementById("taskDueDate");
const statusMessage = document.getElementById("statusMessage");
const emptyHint = document.getElementById("emptyHint");

const filterCategorySelect = document.getElementById("filterCategory");
const filterPrioritySelect = document.getElementById("filterPriority");
const sortSelect = document.getElementById("sortOption");
const searchInput = document.getElementById("searchKeyword");
const applyFilterButton = document.getElementById("applyFilterButton");
const clearFilterButton = document.getElementById("clearFilterButton");
const refreshButton = document.getElementById("refreshButton");

const currentFilters = {
  category: "",
  priority: "",
  search: "",
  sort: "",
};

function showMessage(text, type = "info") {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("error", type === "error");
}

function clearMessage() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("error");
}

function renderTasks(tasks) {
  taskListElement.innerHTML = "";
  if (!tasks.length) {
    emptyHint.style.display = "block";
    return;
  }

  emptyHint.style.display = "none";
  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.classList.add("task-item");
    if (task.completed) {
      item.classList.add("completed");
    }
    if (task.priority === "高") {
      item.classList.add("priority-high");
    }

    const meta = document.createElement("div");
    meta.classList.add("task-meta");

    const title = document.createElement("span");
    title.classList.add("task-title");
    title.textContent = task.title;

    const dueDate = document.createElement("span");
    dueDate.classList.add("task-due-date");
    dueDate.textContent = task.dueDate
      ? `截止日期：${task.dueDate}`
      : "截止日期：未设置";

    const labels = document.createElement("div");
    labels.classList.add("task-labels");

    const categoryBadge = document.createElement("span");
    categoryBadge.classList.add("badge", "badge-category");
    categoryBadge.textContent = `分类：${task.category}`;

    const priorityBadge = document.createElement("span");
    priorityBadge.classList.add("badge", "badge-priority");
    if (task.priority === "高") {
      priorityBadge.classList.add("high");
    }
    priorityBadge.textContent = `优先级：${task.priority}`;

    labels.append(categoryBadge, priorityBadge);
    meta.append(title, dueDate, labels);

    const actions = document.createElement("div");
    actions.classList.add("task-actions");

    const toggleButton = document.createElement("button");
    toggleButton.classList.add("btn-secondary");
    toggleButton.type = "button";
    toggleButton.textContent = task.completed ? "标记未完成" : "标记完成";
    toggleButton.addEventListener("click", () =>
      toggleTask(task.id, !task.completed),
    );

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn-secondary");
    deleteButton.type = "button";
    deleteButton.textContent = "删除";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(toggleButton, deleteButton);
    item.append(meta, actions);

    taskListElement.appendChild(item);
  });
}

async function loadTasks() {
  const params = new URLSearchParams();
  if (currentFilters.category) {
    params.set("category", currentFilters.category);
  }
  if (currentFilters.priority) {
    params.set("priority", currentFilters.priority);
  }
  if (currentFilters.search) {
    params.set("search", currentFilters.search);
  }
  if (currentFilters.sort) {
    params.set("sort", currentFilters.sort);
  }

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;

  try {
    const response = await fetch(url);
    const body = await response.json();

    if (!response.ok || body.status !== "success") {
      throw new Error(body.message || "加载任务失败");
    }

    const tasks = Array.isArray(body.data) ? body.data : [];
    renderTasks(tasks);
    showMessage(`已加载 ${tasks.length} 条任务`);
  } catch (error) {
    renderTasks([]);
    showMessage(error.message, "error");
  }
}

async function addTask(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (!title || !category || !priority || !dueDate) {
    showMessage("请填写完整的任务信息", "error");
    return;
  }

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, priority, dueDate }),
    });
    const body = await response.json();

    if (!response.ok || body.status !== "success") {
      throw new Error(body.message || "新增任务失败");
    }

    taskForm.reset();
    clearMessage();
    showMessage("新增任务成功");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    const body = await response.json();

    if (!response.ok || body.status !== "success") {
      throw new Error(body.message || "删除任务失败");
    }

    showMessage("删除任务成功");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function toggleTask(id, completed) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    const body = await response.json();

    if (!response.ok || body.status !== "success") {
      throw new Error(body.message || "更新任务失败");
    }

    showMessage("更新任务状态成功");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function filterTasks() {
  currentFilters.category = filterCategorySelect.value;
  currentFilters.priority = filterPrioritySelect.value;
  currentFilters.search = searchInput.value.trim();
  currentFilters.sort = sortSelect.value;
  loadTasks();
}

function clearFilters() {
  currentFilters.category = "";
  currentFilters.priority = "";
  currentFilters.search = "";
  currentFilters.sort = "";
  filterCategorySelect.value = "";
  filterPrioritySelect.value = "";
  searchInput.value = "";
  sortSelect.value = "";
  loadTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  taskForm.addEventListener("submit", addTask);
  applyFilterButton.addEventListener("click", filterTasks);
  clearFilterButton.addEventListener("click", clearFilters);
  refreshButton.addEventListener("click", () => loadTasks());
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      filterTasks();
    }
  });

  loadTasks();
});

window.loadTasks = loadTasks;
window.addTask = addTask;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
window.filterTasks = filterTasks;
