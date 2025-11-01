const API_BASE = "http://127.0.0.1:5000/tasks";
const taskList = document.getElementById("taskList");

// 用于在前端缓存当前加载的任务，方便编辑时检索
let lastTasksMap = {};

// 加载任务（保持从后端读取，即从 tasks.json 初始化）
async function loadTasks(category = "", priority = "") {
  let url = API_BASE;
  const params = [];
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
  if (params.length > 0) url += "?" + params.join("&");

  const res = await fetch(url);
  const data = await res.json();

  // 兼容后端返回格式 {status,data,message}
  const tasks = data.data || [];

  // 更新缓存
  lastTasksMap = {};
  tasks.forEach(t => { lastTasksMap[t.id] = t; });

  taskList.innerHTML = "";
  tasks.forEach(task => {
    const card = document.createElement("div");
    // 使用优先级 class（priority-high/medium/low）
    card.className = `task-card priority-${priorityClass(task.priority)} ${task.completed ? "completed" : ""}`;

    card.innerHTML = `
      <div class="task-info">
        <strong class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</strong>
        <div class="task-meta">
          <small>分类：${escapeHtml(task.category)} &nbsp;|&nbsp; 优先级：${escapeHtml(task.priority)}</small>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn" onclick="toggleTask('${task.id}', ${!task.completed})">${task.completed ? "标为未完成" : "标为完成"}</button>
        <button class="btn" onclick="openEditModal('${task.id}')">编辑</button>
        <button class="btn btn-danger" onclick="deleteTask('${task.id}')">删除</button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

function priorityClass(priority) {
  if (priority === "高") return "high";
  if (priority === "中") return "medium";
  return "low";
}

// 简单 HTML 转义，防 XSS
function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s).replace(/[&<>"'`=\/]/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }[c];
  });
}

// 添加任务
async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const category = document.getElementById("taskCategory").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title) {
    alert("请输入任务内容！");
    return;
  }

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, priority })
  });
  const data = await res.json();
  if (data.status === "success") {
    document.getElementById("taskTitle").value = "";
    loadTasks();
  } else {
    alert(data.message || "新增失败");
  }
}

// 删除任务
async function deleteTask(id) {
  if (!confirm("确定删除该任务？")) return;
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (data.status === "success") loadTasks();
  else alert(data.message || "删除失败");
}

// 切换任务完成状态
async function toggleTask(id, completed) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  const data = await res.json();
  if (data.status === "success") {
    loadTasks();
    if (completed) launchFireworks(); // 播放烟花
  } else {
    alert(data.message || "更新失败");
  }
}

// 筛选按钮事件
document.getElementById("filterBtn").addEventListener("click", () => {
  const cat = document.getElementById("filterCategory").value;
  const pri = document.getElementById("filterPriority").value;
  loadTasks(cat, pri);
});

document.getElementById("clearFilterBtn").addEventListener("click", () => {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterPriority").value = "";
  loadTasks();
});

document.getElementById("addBtn").addEventListener("click", addTask);

// 初始化加载（从后端 /tasks，后端由 tasks.json 初始化）
loadTasks();

// --------------------------
// 编辑模态逻辑
// 假设 index.html 中存在以下 DOM 元素：
// #edit-modal, #edit-title, #edit-category, #edit-priority, #save-edit, #cancel-edit
// --------------------------
const editModal = document.getElementById("edit-modal");
const editTitleInput = document.getElementById("edit-title");
const editCategoryInput = document.getElementById("edit-category");
const editPriorityInput = document.getElementById("edit-priority");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");

let currentEditId = null;

function openEditModal(taskId) {
  const task = lastTasksMap[taskId];
  if (!task) {
    alert("任务未找到（可能已被删除）");
    return;
  }
  currentEditId = taskId;
  editTitleInput.value = task.title;
  editCategoryInput.value = task.category;
  editPriorityInput.value = task.priority;
  // 显示模态
  editModal.style.display = "flex";
}

function closeEditModal() {
  editModal.style.display = "none";
  currentEditId = null;
}

cancelEditBtn.addEventListener("click", closeEditModal);

// 保存编辑
saveEditBtn.addEventListener("click", async () => {
  if (!currentEditId) return;
  const newTitle = editTitleInput.value.trim();
  const newCategory = editCategoryInput.value;
  const newPriority = editPriorityInput.value;

  if (!newTitle) {
    alert("任务名称不能为空");
    return;
  }

  const res = await fetch(`${API_BASE}/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    // 后端需支持接收 title/category/priority 字段（示例 app.py 更新片段见下方）
    body: JSON.stringify({ title: newTitle, category: newCategory, priority: newPriority })
  });
  const data = await res.json();
  if (data.status === "success") {
    closeEditModal();
    loadTasks();
  } else {
    alert(data.message || "保存失败");
  }
});

// 点击模态遮罩也可关闭
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

// --------------------------
// 烟花动画特效
// --------------------------
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function launchFireworks() {
  const fireworksCount = 2 + Math.floor(Math.random() * 2); // 2~3 个烟花同时
  for (let f = 0; f < fireworksCount; f++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;

    const hueBase = Math.random() * 360; // 随机色相
    for (let i = 0; i < 50; i++) {
      particles.push({
        x,
        y,
        radius: Math.random() * 3 + 1,
        color: `hsl(${hueBase + Math.random() * 60}, 100%, 50%)`, // 鲜艳色
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        alpha: 1,
      });
    }
  }
  animateFireworks();
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.alpha -= 0.02;
  });
  particles = particles.filter(p => p.alpha > 0);

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    ctx.fillStyle = p.color; // 直接使用 HSL 色
    ctx.globalAlpha = p.alpha; // 设置透明度
    ctx.fill();
    ctx.globalAlpha = 1; // 重置 alpha
  });

  if (particles.length > 0) requestAnimationFrame(animateFireworks);
}

function hexToRgb(hsl) {
  const rgb = hsl.match(/\d+/g);
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}
