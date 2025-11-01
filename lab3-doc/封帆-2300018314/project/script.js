const API_BASE = "/api/tasks";

const state = {
  status: "all",
  category: "",
  sort: "created",
  order: "desc",
  isLoading: false,
};

const elements = {
  form: document.getElementById("taskForm"),
  title: document.getElementById("titleInput"),
  category: document.getElementById("categoryInput"),
  priority: document.getElementById("priorityInput"),
  statusFilter: document.getElementById("statusFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortFilter: document.getElementById("sortFilter"),
  orderFilter: document.getElementById("orderFilter"),
  refreshBtn: document.getElementById("refreshBtn"),
  taskList: document.getElementById("taskList"),
  stats: document.getElementById("stats"),
  error: document.getElementById("error"),
  loading: document.getElementById("loading"),
  taskTemplate: document.getElementById("taskItemTemplate"),
};

function setLoading(flag) {
  state.isLoading = flag;
  elements.loading.classList.toggle("hidden", !flag);
}

function setError(message) {
  if (message) {
    elements.error.textContent = message;
    elements.error.classList.remove("hidden");
  } else {
    elements.error.textContent = "";
    elements.error.classList.add("hidden");
  }
}

async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      const message = payload?.error?.message || `请求失败 (HTTP ${response.status})`;
      throw new Error(message);
    }
    return payload.data;
  } catch (error) {
    throw new Error(error.message || "网络异常，请稍后再试");
  }
}

async function loadTasks() {
  setLoading(true);
  setError("");
  const params = new URLSearchParams();
  params.set("status", state.status);
  params.set("sort", state.sort);
  params.set("order", state.order);
  if (state.category.trim()) {
    params.set("category", state.category.trim());
  }
  try {
    const tasks = await fetchJSON(`${API_BASE}?${params.toString()}`);
    renderTasks(tasks);
    updateStats(tasks);
  } catch (error) {
    setError(error.message);
    renderTasks([]);
    updateStats([]);
  } finally {
    setLoading(false);
  }
}

function updateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  elements.stats.textContent = `总数：${total} ｜ 已完成：${completed}`;
}

function renderTasks(tasks) {
  elements.taskList.innerHTML = "";
  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-empty";
    empty.textContent = "暂无任务，试着添加一个吧！";
    elements.taskList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const task of tasks) {
    const node = elements.taskTemplate.content.firstElementChild.cloneNode(true);
    const toggle = node.querySelector(".task-toggle");
    const title = node.querySelector(".task-title");
    const priorityBadge = node.querySelector(".priority");
    const categoryBadge = node.querySelector(".category");
    const times = node.querySelector(".task-times");
    const deleteBtn = node.querySelector(".delete-btn");

    toggle.checked = task.completed;
    toggle.dataset.id = task.id;
    title.textContent = task.title;
    title.classList.toggle("completed", task.completed);

    priorityBadge.textContent = formatPriority(task.priority);
    priorityBadge.dataset.priorityLevel = task.priority;

    categoryBadge.textContent = task.category || "General";

    times.innerHTML = `创建：${formatDate(task.created_at)} · 更新：${formatDate(task.updated_at)}`;

    deleteBtn.dataset.id = task.id;

    fragment.appendChild(node);
  }
  elements.taskList.appendChild(fragment);
}

function formatPriority(priority) {
  switch (priority) {
    case 3:
      return "高";
    case 2:
      return "中";
    case 1:
    default:
      return "低";
  }
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (error) {
    return isoString;
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const title = elements.title.value.trim();
  const category = elements.category.value.trim();
  const priority = elements.priority.value;
  if (!title) {
    setError("请输入任务标题");
    elements.title.focus();
    return;
  }

  try {
    await fetchJSON(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        title,
        category: category || undefined,
        priority,
      }),
    });
    elements.form.reset();
    elements.priority.value = "medium";
    await loadTasks();
  } catch (error) {
    setError(error.message);
  }
}

async function handleToggle(event) {
  if (!event.target.classList.contains("task-toggle")) {
    return;
  }
  const id = event.target.dataset.id;
  try {
    await fetchJSON(`${API_BASE}/${id}/toggle`, { method: "PATCH" });
    await loadTasks();
  } catch (error) {
    setError(error.message);
  }
}

async function handleDelete(event) {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }
  const id = event.target.dataset.id;
  if (!confirm("确定要删除该任务吗？")) {
    return;
  }
  try {
    await fetchJSON(`${API_BASE}/${id}`, { method: "DELETE" });
    await loadTasks();
  } catch (error) {
    setError(error.message);
  }
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.taskList.addEventListener("change", handleToggle);
  elements.taskList.addEventListener("click", handleDelete);

  elements.statusFilter.addEventListener("change", () => {
    state.status = elements.statusFilter.value;
    loadTasks();
  });

  elements.categoryFilter.addEventListener("input", debounce((event) => {
    state.category = event.target.value;
    loadTasks();
  }, 400));

  elements.sortFilter.addEventListener("change", () => {
    state.sort = elements.sortFilter.value;
    loadTasks();
  });

  elements.orderFilter.addEventListener("change", () => {
    state.order = elements.orderFilter.value;
    loadTasks();
  });

  elements.refreshBtn.addEventListener("click", () => {
    loadTasks();
  });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}

window.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadTasks();
});