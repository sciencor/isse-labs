const apiBase = '/todos';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('openCreateBtn').addEventListener('click', openCreateModal);
  document.getElementById('applyFilter').addEventListener('click', loadTodos);
  document.getElementById('clearFilter').addEventListener('click', clearFilter);

  // modal create handlers
  document.getElementById('createCancel').addEventListener('click', closeCreateModal);
  document.getElementById('createForm').addEventListener('submit', onCreateSubmit);
  document.getElementById('m_category_select').addEventListener('change', onCategorySelectChange);

  // confirm modal buttons
  document.getElementById('confirmNo').addEventListener('click', () => resolveConfirm(false));
  document.getElementById('confirmYes').addEventListener('click', () => resolveConfirm(true));

  loadCategories();
  loadTodos();
  loadProgress();
});

/* ---------- 类别管理 ---------- */
async function loadCategories() {
  try {
    const res = await fetch('/categories');
    if (!res.ok) return;
    const cats = await res.json();
    populateCategorySelects(cats);
  } catch {}
}

function populateCategorySelects(cats) {
  const filterSel = document.getElementById('filterCategory');
  const mSel = document.getElementById('m_category_select');
  // 清空并添加默认项
  filterSel.innerHTML = '<option value="">全部</option>';
  mSel.innerHTML = '';
  // 添加选项并在新建 select 最后添加一个 "新建分类" 选项
  cats.forEach(c => {
    const o1 = document.createElement('option'); o1.value = c; o1.textContent = c; filterSel.appendChild(o1);
    const o2 = document.createElement('option'); o2.value = c; o2.textContent = c; mSel.appendChild(o2);
  });
  const newOpt = document.createElement('option'); newOpt.value = '__new__'; newOpt.textContent = '＋ 新建分类...'; mSel.appendChild(newOpt);
  mSel.value = cats.length ? cats[0] : '';
  document.getElementById('m_category_new').style.display = 'none';
}

function onCategorySelectChange(e) {
  const v = e.target.value;
  const newInput = document.getElementById('m_category_new');
  if (v === '__new__') {
    newInput.style.display = '';
    newInput.focus();
  } else {
    newInput.style.display = 'none';
  }
}

/* ---------- 新建任务模态 ---------- */
function openCreateModal() {
  const m = document.getElementById('createModal');
  m.setAttribute('aria-hidden', 'false');
  m.classList.add('open');
  document.getElementById('m_task').focus();
}

function closeCreateModal() {
  const m = document.getElementById('createModal');
  m.setAttribute('aria-hidden', 'true');
  m.classList.remove('open');
  document.getElementById('createForm').reset();
  document.getElementById('m_category_new').style.display = 'none';
}

async function onCreateSubmit(e) {
  e.preventDefault();
  const task = document.getElementById('m_task').value.trim();
  const priority = document.getElementById('m_priority').value;
  const mcatSel = document.getElementById('m_category_select').value;
  const mcatNew = document.getElementById('m_category_new').value.trim();
  const category = (mcatSel === '__new__' ? (mcatNew || '默认') : (mcatSel || '默认'));
  const dueVal = document.getElementById('m_due').value; // '' or 'YYYY-MM-DD'
  const due = dueVal || '暂无';

  if (!task) { showToast('请输入任务内容'); return; }

  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({task, priority, category, due})
    });
    if (res.ok) {
      closeCreateModal();
      await loadCategories(); // 若新建分类需要刷新
      loadTodos();
      loadProgress();
      showToast('添加成功');
    } else {
      showToast('添加失败');
    }
  } catch {
    showToast('网络错误');
  }
}

/* ---------- 自定义确认框 ---------- */
let _confirmResolver = null;
function showConfirm(message) {
  const cm = document.getElementById('confirmModal');
  document.getElementById('confirmText').textContent = message || '确认操作？';
  cm.classList.add('open');
  cm.setAttribute('aria-hidden', 'false');
  return new Promise(resolve => { _confirmResolver = resolve; });
}
function resolveConfirm(val) {
  const cm = document.getElementById('confirmModal');
  cm.classList.remove('open');
  cm.setAttribute('aria-hidden', 'true');
  if (_confirmResolver) _confirmResolver(val);
  _confirmResolver = null;
}

/* ---------- 业务逻辑 ---------- */
function getFilters() {
  const priority = document.getElementById('filterPriority').value;
  const category = document.getElementById('filterCategory').value;
  const completedSel = document.getElementById('filterCompleted').value;
  const sort = document.getElementById('sortDue').value;
  const params = new URLSearchParams();
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  if (completedSel && completedSel !== 'all') {
    params.append('completed', completedSel === 'completed' ? 'true' : 'false');
  }
  if (sort) params.append('sort', sort);
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
  } catch {
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
    const dueDisplay = item.due && item.due !== '暂无' ? item.due : '暂无';
    li.innerHTML = `
      <div class="left">
        <input class="chk" type="checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <div class="main">
          <div class="task">${escapeHtml(item.task)}</div>
          <div class="meta">[${escapeHtml(item.priority)}] · ${escapeHtml(item.category)} · 截止：${escapeHtml(dueDisplay)}</div>
        </div>
      </div>
      <div class="right">
        <button class="btn mini edit" data-id="${item.id}">编辑</button>
        <button class="btn mini danger del" data-id="${item.id}">删除</button>
      </div>
    `;
    ul.appendChild(li);

    li.querySelector('.chk').addEventListener('change', e => toggleTodo(e.target.dataset.id));
    li.querySelector('.del').addEventListener('click', () => confirmAndDelete(item.id));
    li.querySelector('.edit').addEventListener('click', () => editTodoPrompt(item));
  });
}

async function confirmAndDelete(id) {
  const ok = await showConfirm('确定要删除该任务吗？此操作不可恢复。');
  if (!ok) return;
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

function editTodoPrompt(item) {
  // 简易编辑：使用 prompt，可扩展为模态
  const newTask = prompt('编辑任务内容：', item.task);
  if (newTask === null) return;
  const newPriority = prompt('优先级 (low/normal/high):', item.priority) || item.priority;
  const newCategory = prompt('分类：', item.category) || item.category;
  const newDue = prompt('截止日期 (YYYY-MM-DD，留空表示暂无):', item.due && item.due !== '暂无' ? item.due : '') || '暂无';
  updateTodo(item.id, {task: newTask, priority: newPriority, category: newCategory, due: newDue});
}

async function updateTodo(id, body) {
  try {
    const res = await fetch(`/todos/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
    if (res.ok) {
      loadCategories(); // 若编辑分类产生新分类
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
  document.getElementById('filterCompleted').value = 'all';
  document.getElementById('sortDue').value = '';
  loadTodos();
}

// UI helper
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

function escapeHtml(s){ return (s+'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }