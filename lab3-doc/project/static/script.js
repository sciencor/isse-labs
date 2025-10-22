const apiBase = '/todos';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addForm').addEventListener('submit', onAdd);
  document.getElementById('applyFilter').addEventListener('click', loadTodos);
  document.getElementById('clearFilter').addEventListener('click', clearFilter);
  loadTodos();
  loadProgress();
});

async function onAdd(e) {
  e.preventDefault();
  const task = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  const category = document.getElementById('categoryInput').value.trim() || '默认';
  if (!task) return showToast('请输入任务内容');

  toggleButtonState(true, '.btn.primary');
  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({task, priority, category})
    });
    if (res.ok) {
      document.getElementById('taskInput').value = '';
      loadTodos();
      loadProgress();
      showToast('添加成功');
    } else {
      showToast('添加失败');
    }
  } catch (err) {
    showToast('网络错误');
  } finally {
    toggleButtonState(false, '.btn.primary');
  }
}

function getFilters() {
  const priority = document.getElementById('filterPriority').value;
  const category = document.getElementById('filterCategory').value.trim();
  const params = new URLSearchParams();
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  return params.toString() ? `?${params.toString()}` : '';
}

async function loadTodos() {
  const qs = getFilters();
  try {
    const res = await fetch(`/todos${qs}`);
    if (!res.ok) return showToast('获取列表失败');
    const items = await res.json();
    renderList(items);
    loadProgress();
  } catch (err) {
    showToast('网络错误');
  }
}

function renderList(items) {
  const ul = document.getElementById('todoList');
  ul.innerHTML = '';
  if (!items || items.length === 0) {
    ul.innerHTML = '<li class="empty">暂无任务</li>';
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = `todo-item ${item.completed ? 'done' : ''}`;
    li.innerHTML = `
      <div class="left">
        <input class="chk" type="checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <div class="main">
          <div class="task">${escapeHtml(item.task)}</div>
          <div class="meta">[${escapeHtml(item.priority)}] · ${escapeHtml(item.category)}</div>
        </div>
      </div>
      <div class="right">
        <button class="btn mini edit" data-id="${item.id}">编辑</button>
        <button class="btn mini danger del" data-id="${item.id}">删除</button>
      </div>
    `;
    ul.appendChild(li);

    li.querySelector('.chk').addEventListener('change', e => toggleTodo(e.target.dataset.id));
    li.querySelector('.del').addEventListener('click', () => deleteTodo(item.id));
    li.querySelector('.edit').addEventListener('click', () => editTodoPrompt(item));
  });
}

async function toggleTodo(id) {
  try {
    const res = await fetch(`/todos/${id}/toggle`, {method: 'PATCH'});
    if (res.ok) {
      loadTodos();
      loadProgress();
    } else showToast('切换失败');
  } catch {
    showToast('网络错误');
  }
}

async function deleteTodo(id) {
  if (!confirm('确认删除？')) return;
  try {
    const res = await fetch(`/todos/${id}`, {method: 'DELETE'});
    if (res.ok) {
      loadTodos();
      loadProgress();
      showToast('已删除');
    } else showToast('删除失败');
  } catch {
    showToast('网络错误');
  }
}

function editTodoPrompt(item) {
  const newTask = prompt('编辑任务内容：', item.task);
  if (newTask === null) return;
  const newPriority = prompt('优先级 (low/normal/high):', item.priority) || item.priority;
  const newCategory = prompt('分类：', item.category) || item.category;
  updateTodo(item.id, {task: newTask, priority: newPriority, category: newCategory});
}

async function updateTodo(id, body) {
  try {
    const res = await fetch(`/todos/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
    if (res.ok) {
      loadTodos();
      loadProgress();
      showToast('更新成功');
    } else showToast('更新失败');
  } catch {
    showToast('网络错误');
  }
}

async function loadProgress() {
  try {
    const res = await fetch('/todos/progress');
    if (!res.ok) return;
    const p = await res.json();
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    fill.style.width = `${p.percent}%`;
    text.textContent = `完成 ${p.completed} / ${p.total} (${p.percent}%)`;
  } catch {
    /* ignore */
  }
}

function clearFilter() {
  document.getElementById('filterPriority').value = '';
  document.getElementById('filterCategory').value = '';
  loadTodos();
}

// UI helper: 临时提示（非阻塞）
function showToast(msg, timeout = 1500) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('visible'), timeout);
}

function toggleButtonState(disabled, selector='.btn') {
  const btns = document.querySelectorAll(selector);
  btns.forEach(b => b.disabled = disabled);
}

// 简单防 XSS
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }