const API_BASE = "http://127.0.0.1:5000/tasks";
const taskList = document.getElementById("taskList");

// 加载任务
async function loadTasks(category = "", priority = "") {
  let url = API_BASE;
  const params = [];
  if (category) params.push(`category=${category}`);
  if (priority) params.push(`priority=${priority}`);
  if (params.length > 0) url += "?" + params.join("&");

  const res = await fetch(url);
  const data = await res.json();

  taskList.innerHTML = "";
  data.data.forEach(task => {
    const card = document.createElement("div");
    card.className = `task-card priority-${priorityClass(task.priority)} ${task.completed ? "completed" : ""}`;
    card.innerHTML = `
      <div>
        <strong>${task.title}</strong><br>
        <small>分类：${task.category} | 优先级：${task.priority}</small>
      </div>
      <div class="task-actions">
        <button onclick="toggleTask('${task.id}', ${!task.completed})">${task.completed ? "未完成" : "完成"}</button>
        <button onclick="deleteTask('${task.id}')">删除</button>
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

// 添加任务
async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const category = document.getElementById("taskCategory").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title) {
    alert("请输入任务内容！");
    return;
  }

  await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, priority })
  });

  document.getElementById("taskTitle").value = "";
  loadTasks();
}

// 删除任务
async function deleteTask(id) {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  loadTasks();
}

// 切换任务完成状态
async function toggleTask(id, completed) {
  await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  loadTasks();
  if (completed) launchFireworks(); // ✅ 播放烟花动画
}

// 筛选任务
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

// 初始化加载
loadTasks();

// --------------------------
// 🎆 烟花动画特效
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
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height / 2;
  for (let i = 0; i < 50; i++) {
    particles.push({
      x,
      y,
      radius: Math.random() * 3,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      speedX: (Math.random() - 0.5) * 6,
      speedY: (Math.random() - 0.5) * 6,
      alpha: 1
    });
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
    ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
    ctx.fill();
  });

  if (particles.length > 0) requestAnimationFrame(animateFireworks);
}

function hexToRgb(hsl) {
  const rgb = hsl.match(/\d+/g);
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}
