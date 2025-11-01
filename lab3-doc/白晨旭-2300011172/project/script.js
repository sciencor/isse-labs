/* ---------------------------
 * Minimal Frontend for Lab3
 * Pure JS + Fetch, no libs
 * --------------------------*/

const BASE_URL = "http://localhost:5000"; // 固定
const API_ROOT = `${BASE_URL}/api`;

// ---------- DOM refs ----------
const $ = (sel) => document.querySelector(sel);
const els = {
  // add form
  title: $("#titleInput"),
  category: $("#categoryInput"),
  priority: $("#priorityInput"),
  dueDate: $("#dueDateInput"),
  addBtn: $("#addBtn"),
  addForm: $("#addForm"),

  // filters
  search: $("#searchInput"),
  catSelect: $("#categorySelect"),
  prioSelect: $("#prioritySelect"),
  statusSelect: $("#statusSelect"),
  applyBtn: $("#applyBtn"),
  clearBtn: $("#clearBtn"),

  // list & stats
  list: $("#list"),
  totalCount: $("#totalCount"),
  completedCount: $("#completedCount"),
  activeCount: $("#activeCount"),

  // connection status
  connStatus: $("#connStatus"),
};

// ---------- Toast ----------
function ensureToastHost() {
  let t = document.getElementById("toastHost");
  if (!t) {
    t = document.createElement("div");
    t.id = "toastHost";
    t.style.position = "fixed";
    t.style.top = "12px";
    t.style.left = "50%";
    t.style.transform = "translateX(-50%)";
    t.style.zIndex = "9999";
    t.style.maxWidth = "90vw";
    document.body.appendChild(t);
  }
  return t;
}
let toastTimer = null;
function showToast(msg, type = "error") {
  const host = ensureToastHost();
  host.innerHTML = "";
  const box = document.createElement("div");
  box.textContent = msg;
  box.style.padding = "10px 14px";
  box.style.borderRadius = "10px";
  box.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)";
  box.style.fontSize = "14px";
  box.style.background = type === "error" ? "#7f1d1d" : "#1f2937";
  box.style.color = "#fff";
  host.appendChild(box);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (host.innerHTML = ""), 3000);
}

// ---------- API helpers ----------
async function httpJSON(path, { method = "GET", body, params } = {}) {
  const url = new URL(`${API_ROOT}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 可能后端未启动或网络错误
  if (!res.ok) {
    let text = await res.text().catch(() => "");
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || text || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  const data = await res.json();
  if (data && data.ok) return data.data;
  throw new Error((data && data.error) || "Unknown error");
}

function listTodos(params) {
  // params: { q, category, priority, completed }
  return httpJSON("/todos", { params });
}
function createTodo(payload) {
  // payload: {title, priority, category, due_date?}
  return httpJSON("/todos", { method: "POST", body: payload });
}
function updateTodo(id, patch) {
  return httpJSON(`/todos/${id}`, { method: "PATCH", body: patch });
}
function deleteTodo(id) {
  return httpJSON(`/todos/${id}`, { method: "DELETE" });
}

// ---------- State ----------
const PRIO_ORDER = { high: 0, medium: 1, low: 2 };
const state = {
  connected: false,
  todos: [],
  filters: {
    q: "",
    category: "",
    priority: "",
    // 使用 completed 布尔：statusSelect: all|active|completed -> completed true/false/undefined
    completed: undefined,
  },
};

// ---------- Rendering ----------
function setConnection(connected) {
  state.connected = connected;
  if (!els.connStatus) return;
  if (connected) {
    els.connStatus.textContent = "已连接";
    els.connStatus.classList.remove("status-off");
    els.connStatus.classList.add("status-on");
  } else {
    els.connStatus.textContent = "未连接";
    els.connStatus.classList.add("status-off");
    els.connStatus.classList.remove("status-on");
  }
}

function formatDue(due) {
  if (!due) return "";
  // Show local date-time friendly
  try {
    // Accept "YYYY-mm-ddTHH:MM:SSZ" or without Z
    const d = new Date(due);
    if (isNaN(d.getTime())) return due;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return due;
  }
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

function toZhPrio(p) {
  if (p === "high") return "高";
  if (p === "low") return "低";
  return "中";
}

function renderStats(items) {
  const total = items.length;
  const done = items.filter((x) => !!x.completed).length;
  const active = total - done;
  if (els.totalCount) els.totalCount.textContent = String(total);
  if (els.completedCount) els.completedCount.textContent = String(done);
  if (els.activeCount) els.activeCount.textContent = String(active);
}

function renderEmptyState() {
  if (!els.list) return;
  els.list.innerHTML = `
    <li class="empty">
      <div>${state.connected ? "暂无待办。" : "尚无待办或后端未连接。"}</div>
      <div class="hint">${state.connected ? "点击上方“添加”创建一条任务。" : "请启动后端（Flask: localhost:5000）或创建一条任务。"}</div>
    </li>`;
  renderStats([]);
}

function renderList(items) {
  if (!els.list) return;
  if (!items || items.length === 0) {
    renderEmptyState();
    return;
  }
  // 排序：priority desc (high>medium>low), then created_at desc
  const sorted = [...items].sort((a, b) => {
    const ap = PRIO_ORDER[a.priority] ?? 9;
    const bp = PRIO_ORDER[b.priority] ?? 9;
    if (ap !== bp) return ap - bp;
    const at = a.created_at || "";
    const bt = b.created_at || "";
    return bt.localeCompare(at);
  });

  els.list.innerHTML = "";
  for (const item of sorted) {
    const li = document.createElement("li");
    li.className = `todo ${item.completed ? "done" : ""} prio-${item.priority}`;
    li.dataset.id = item.id;

    const dueText = item.due_date ? formatDue(item.due_date) : "";
    li.innerHTML = `
      <label class="row">
        <input type="checkbox" class="toggle" ${item.completed ? "checked" : ""} aria-label="完成开关">
        <span class="title" title="双击编辑">${escapeHtml(item.title)}</span>
      </label>
      <div class="meta">
        <span class="badge ${item.priority}">优先级：${toZhPrio(item.priority)}</span>
        ${item.category ? `<span class="badge category">分类：${escapeHtml(item.category)}</span>` : ""}
        ${dueText ? `<span class="badge due">截止：${escapeHtml(dueText)}</span>` : ""}
      </div>
      <div class="ops">
        <button class="del" aria-label="删除">删除</button>
      </div>
    `;
    els.list.appendChild(li);
  }

  // 绑定列表交互（事件委托）
  els.list.onclick = async (ev) => {
    const target = ev.target;
    const li = target.closest("li.todo");
    if (!li) return;
    const id = li.dataset.id;

    if (target.classList.contains("del")) {
      // 删除
      try {
        await deleteTodo(id);
        // 从 state 移除并重渲
        state.todos = state.todos.filter((t) => t.id !== id);
        applyFiltersAndRender(); // 局部刷新
      } catch (e) {
        showToast(String(e));
      }
    }
  };

  els.list.onchange = async (ev) => {
    const target = ev.target;
    const li = target.closest("li.todo");
    if (!li) return;
    const id = li.dataset.id;

    if (target.classList.contains("toggle")) {
      // 勾选完成
      const completed = !!target.checked;
      try {
        const updated = await updateTodo(id, { completed });
        // 更新 state
        const idx = state.todos.findIndex((t) => t.id === id);
        if (idx >= 0) state.todos[idx] = updated;
        applyFiltersAndRender(); // 重新渲染（排序可能变化）
      } catch (e) {
        showToast(String(e));
        // 回滚 UI
        target.checked = !completed;
      }
    }
  };

  // 标题双击行内编辑
  els.list.ondblclick = (ev) => {
    const span = ev.target.closest(".title");
    if (!span) return;
    const li = span.closest("li.todo");
    const id = li.dataset.id;
    const old = span.textContent || "";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "inline-editor";
    input.value = old;
    input.style.width = "100%";
    span.replaceWith(input);
    input.focus();
    input.setSelectionRange(0, input.value.length);

    const save = async () => {
      const title = input.value.trim();
      if (!title || title === old) {
        // 恢复
        input.replaceWith(span);
        span.textContent = old;
        return;
      }
      try {
        const updated = await updateTodo(id, { title });
        const idx = state.todos.findIndex((t) => t.id === id);
        if (idx >= 0) state.todos[idx] = updated;
        applyFiltersAndRender();
      } catch (e) {
        showToast(String(e));
        input.replaceWith(span);
      }
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        input.replaceWith(span);
      }
    });
    input.addEventListener("blur", () => {
      // 取消即还原，不自动保存
      input.replaceWith(span);
    });
  };

  renderStats(items);
}

function applyFiltersAndRender() {
  const items = filterInMemory(state.todos, state.filters);
  renderList(items);
  // 动态填充分类下拉（可选）
  fillCategoryOptions(state.todos);
}

function filterInMemory(items, filters) {
  return items.filter((x) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const t = (x.title || "").toLowerCase();
      const c = (x.category || "").toLowerCase();
      if (!t.includes(q) && !c.includes(q)) return false;
    }
    if (filters.category) {
      if ((x.category || "").toLowerCase() !== filters.category.toLowerCase())
        return false;
    }
    if (filters.priority) {
      if (x.priority !== filters.priority) return false;
    }
    if (typeof filters.completed === "boolean") {
      if (!!x.completed !== filters.completed) return false;
    }
    return true;
  });
}

function fillCategoryOptions(allTodos) {
  if (!els.catSelect) return;
  const cur = els.catSelect.value;
  const set = new Set();
  allTodos.forEach((t) => {
    const c = (t.category || "").trim();
    if (c) set.add(c);
  });
  // 保留第一个 "全部分类"
  const head = els.catSelect.querySelector("option[value='']");
  els.catSelect.innerHTML = "";
  if (head) els.catSelect.appendChild(head);
  else {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "全部分类";
    els.catSelect.appendChild(opt);
  }
  Array.from(set).sort((a, b) => a.localeCompare(b, "zh")).forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    els.catSelect.appendChild(o);
  });
  // 尝试恢复当前选中
  els.catSelect.value = cur;
}

// ---------- Event handlers ----------
function getFiltersFromUI() {
  const status = els.statusSelect ? els.statusSelect.value : "all";
  let completed;
  if (status === "active") completed = false;
  else if (status === "completed") completed = true;
  else completed = undefined;
  return {
    q: (els.search?.value || "").trim(),
    category: els.catSelect?.value || "",
    priority: els.prioSelect?.value || "",
    completed,
  };
}

function bindEvents() {
  // 添加
  els.addBtn?.addEventListener("click", async () => {
    const title = (els.title?.value || "").trim();
    if (!title) {
      showToast("请输入标题");
      return;
    }
    const payload = {
      title,
      category: (els.category?.value || "").trim(),
      priority: els.priority?.value || "medium",
    };
    const dueRaw = els.dueDate?.value;
    if (dueRaw) {
      // datetime-local -> ISO (local)
      const iso = new Date(dueRaw).toISOString(); // 转成 UTC ISO, 后端允许 Z
      payload.due_date = iso;
    }

    try {
      const created = await createTodo(payload);
      setConnection(true);
      // 更新 state（内存追加），若不匹配当前筛选也无妨
      state.todos.push(created);
      // 清空输入
      if (els.title) els.title.value = "";
      if (els.category) els.category.value = "";
      if (els.dueDate) els.dueDate.value = "";
      // 重新渲染（排序可能变化）
      applyFiltersAndRender();
    } catch (e) {
      setConnection(false);
      showToast(String(e));
    }
  });

  // 过滤：输入即触发（加轻微 debounce）
  const debounce = (fn, ms = 250) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };
  const onFilterChanged = debounce(async () => {
    state.filters = getFiltersFromUI();
    // 如果已连接，尽量以服务端过滤为准；否则用内存过滤
    if (state.connected) {
      try {
        const params = {};
        if (state.filters.q) params.q = state.filters.q;
        if (state.filters.category) params.category = state.filters.category;
        if (state.filters.priority) params.priority = state.filters.priority;
        if (typeof state.filters.completed === "boolean")
          params.completed = state.filters.completed;
        const list = await listTodos(params);
        setConnection(true);
        state.todos = list; // 与服务端保持一致
        applyFiltersAndRender();
        return;
      } catch (e) {
        setConnection(false);
        showToast(String(e));
      }
    }
    // 未连接或失败时，使用本地缓存过滤
    applyFiltersAndRender();
  }, 200);

  els.search?.addEventListener("input", onFilterChanged);
  els.catSelect?.addEventListener("change", onFilterChanged);
  els.prioSelect?.addEventListener("change", onFilterChanged);
  els.statusSelect?.addEventListener("change", onFilterChanged);
  els.applyBtn?.addEventListener("click", onFilterChanged);
  els.clearBtn?.addEventListener("click", () => {
    if (els.search) els.search.value = "";
    if (els.catSelect) els.catSelect.value = "";
    if (els.prioSelect) els.prioSelect.value = "";
    if (els.statusSelect) els.statusSelect.value = "all";
    state.filters = getFiltersFromUI();
    onFilterChanged();
  });
}

// ---------- Initial load ----------
async function initialLoad() {
  try {
    const list = await listTodos({});
    setConnection(true);
    state.todos = list;
    state.filters = getFiltersFromUI();
    applyFiltersAndRender();
  } catch (e) {
    setConnection(false);
    showToast("后端未连接，进入离线模式");
    // 离线空态
    renderEmptyState();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  initialLoad();
});

// ---------- Exports for debugging (optional) ----------
window.__todoAPI__ = { listTodos, createTodo, updateTodo, deleteTodo };
window.__todoSTATE__ = state;
window.renderEmptyState = renderEmptyState;
