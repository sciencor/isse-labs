const apiBase = '/todos';
let _currentEditId = null;
let _confirmResolver = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('openCreateBtn').addEventListener('click', openCreateModal);
  document.getElementById('clearFilter').addEventListener('click', clearFilter);

  // 移除“筛选”按钮，并确保筛选控件实时更新
  document.getElementById('filterPriority').addEventListener('change', loadTodos);
  document.getElementById('filterCategory').addEventListener('change', loadTodos);
  document.getElementById('filterCompleted').addEventListener('change', loadTodos);
  document.getElementById('sortDue').addEventListener('change', loadTodos);

  loadCategories();
  loadTodos();
  loadProgress();
});

/* ---------- categories ---------- */
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
  const eSel = document.getElementById('e_category_select');
  filterSel.innerHTML = '<option value="">全部</option>';
  mSel.innerHTML = '';
  eSel.innerHTML = '';
  cats.forEach(c => {
    const oF = document.createElement('option'); oF.value = c; oF.textContent = c; filterSel.appendChild(oF);
    const oM = document.createElement('option'); oM.value = c; oM.textContent = c; mSel.appendChild(oM);
    const oE = document.createElement('option'); oE.value = c; oE.textContent = c; eSel.appendChild(oE);
  });
  const newOptM = document.createElement('option'); newOptM.value = '__new__'; newOptM.textContent = '＋ 新建分类...'; mSel.appendChild(newOptM);
  const newOptE = document.createElement('option'); newOptE.value = '__new__'; newOptE.textContent = '＋ 新建分类...'; eSel.appendChild(newOptE);
  mSel.value = cats.length ? cats[0] : '';
  eSel.value = cats.length ? cats[0] : '';
  document.getElementById('m_category_new').style.display = 'none';
  document.getElementById('e_category_new').style.display = 'none';
}
function onCategorySelectChange(e){ document.getElementById('m_category_new').style.display = e.target.value==='__new__' ? '' : 'none'; }
function onEditCategorySelectChange(e){ document.getElementById('e_category_new').style.display = e.target.value==='__new__' ? '' : 'none'; }

/* ---------- create ---------- */
function openCreateModal(){ const m=document.getElementById('createModal'); m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.getElementById('m_task').focus(); }
function closeCreateModal() {
  const m = document.getElementById('createModal');
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
  document.getElementById('createForm').reset(); // 重置表单
  document.getElementById('m_category_new').style.display = 'none'; // 隐藏新分类输入框
}

async function onCreateSubmit(e){
  e.preventDefault();
  const task = document.getElementById('m_task').value.trim();
  const priority = document.getElementById('m_priority').value;
  const mcatSel = document.getElementById('m_category_select').value;
  const mcatNew = document.getElementById('m_category_new').value.trim();
  const category = (mcatSel === '__new__' ? (mcatNew || '默认') : (mcatSel || '默认'));
  const dueVal = document.getElementById('m_due').value; // '' or 'YYYY-MM-DD'
  const due = dueVal || '暂无'; // 如果未填写日期，则设置为“暂无”

  if (!task) {
    showToast('请输入任务内容');
    return;
  }

  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, priority, category, due })
    });
    const body = await res.json().catch(() => null);
    console.log('POST', res.status, body);
    if (res.ok) {
      closeCreateModal();
      // 清除筛选以便新项可见
      document.getElementById('filterPriority').value = '';
      document.getElementById('filterCategory').value = '';
      if (document.getElementById('filterCompleted')) document.getElementById('filterCompleted').value = 'all';
      if (document.getElementById('sortDue')) document.getElementById('sortDue').value = '';
      await loadCategories();
      await loadTodos();
      loadProgress();
      showToast('添加成功');
    } else {
      showToast('添加失败');
      console.error('创建失败：', body);
    }
  } catch (err) {
    console.error(err);
    showToast('网络错误');
  }
}

/* ---------- edit ---------- */
function openEditModal(item){
  _currentEditId = item.id;
  const m = document.getElementById('editModal'); m.classList.add('open'); m.setAttribute('aria-hidden','false');
  document.getElementById('e_task').value = item.task || '';
  document.getElementById('e_priority').value = item.priority || 'normal';
  document.getElementById('e_due').value = (item.due && item.due!=='暂无') ? item.due : '';
  const eSel = document.getElementById('e_category_select');
  const eNew = document.getElementById('e_category_new');
  let found=false;
  for(let i=0;i<eSel.options.length;i++){ if(eSel.options[i].value===item.category){ eSel.value=item.category; found=true; break; } }
  if(!found){ eSel.value='__new__'; eNew.style.display=''; eNew.value=item.category||''; } else { eNew.style.display='none'; eNew.value=''; }
  document.getElementById('e_completed').checked = !!item.completed;
  document.getElementById('e_task').focus();
}
function closeEditModal(){ const m=document.getElementById('editModal'); m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.getElementById('editForm').reset(); document.getElementById('e_category_new').style.display='none'; _currentEditId=null; }

async function onEditSubmit(e){
  e.preventDefault();
  if(!_currentEditId) return showToast('编辑目标不存在');
  const task = document.getElementById('e_task').value.trim();
  const priority = document.getElementById('e_priority').value;
  const esel = document.getElementById('e_category_select').value;
  const enew = document.getElementById('e_category_new').value.trim();
  const category = (esel === '__new__' ? (enew || '默认') : (esel || '默认'));
  const dueVal = document.getElementById('e_due').value;
  const due = dueVal || '暂无';
  const completed = document.getElementById('e_completed').checked;
  if(!task){ showToast('请输入任务内容'); return; }
  try{
    const res = await fetch(`${apiBase}/${_currentEditId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,priority,category,due,completed})});
    const body = await res.json().catch(()=>null);
    console.log('PUT', res.status, body);
    if(res.ok){
      closeEditModal();
      await loadCategories();
      await loadTodos();
      loadProgress();
      showToast('更新成功');
    } else { showToast('更新失败'); console.error('更新失败：', body); }
  }catch(err){ console.error(err); showToast('网络错误'); }
}

/* ---------- confirm ---------- */
function showConfirm(message){
  const cm = document.getElementById('confirmModal');
  document.getElementById('confirmText').textContent = message || '确认操作？';
  cm.classList.add('open'); cm.setAttribute('aria-hidden','false');
  return new Promise(resolve => { _confirmResolver = resolve; });
}
function resolveConfirm(val) {
  const cm = document.getElementById('confirmModal');
  cm.classList.remove('open');
  cm.setAttribute('aria-hidden', 'true');
  if (_confirmResolver) {
    _confirmResolver(val); // 正确调用 resolver
  }
  _confirmResolver = null;
}

/* ---------- due 状态 ---------- */
function parseDateOnly(dateStr){
  if(!dateStr || dateStr==='暂无') return null;
  const d = new Date(dateStr + 'T00:00:00');
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function getDueStatus(item){
  if(item.completed) return null;
  const due = parseDateOnly(item.due);
  if(!due) return null;
  const today = new Date(); const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = due - todayMid;
  const oneDay = 24*60*60*1000;
  if(diffMs < 0) return 'overdue';
  if(diffMs <= oneDay) return 'near';
  return null;
}

/* ---------- load/render ---------- */
function getFilters(){
  const priority = document.getElementById('filterPriority').value;
  const category = document.getElementById('filterCategory').value;
  const completedSel = document.getElementById('filterCompleted').value;
  const sort = document.getElementById('sortDue').value;
  const params = new URLSearchParams();
  if(priority) params.append('priority', priority);
  if(category) params.append('category', category);
  if(completedSel && completedSel !== 'all') params.append('completed', completedSel === 'completed' ? 'true' : 'false');
  if(sort) params.append('sort', sort);
  return params.toString() ? `?${params.toString()}` : '';
}

async function loadTodos(){
  const qs = getFilters();
  try{
    const res = await fetch(`/todos${qs}`);
    if(!res.ok) return showToast('获取列表失败');
    const items = await res.json();
    renderList(items);
    loadProgress();
  }catch{ showToast('网络错误'); }
}

function renderList(items){
  const ul = document.getElementById('todoList'); ul.innerHTML='';
  if(!items || items.length===0){ ul.innerHTML = '<li class="empty">暂无任务</li>'; return; }
  items.forEach(item=>{
    const li = document.createElement('li');
    li.className = `todo-item ${item.completed ? 'done' : ''}`;
    const dueDisplay = item.due && item.due !== '暂无' ? item.due : '暂无';
    const dueStatus = getDueStatus(item);
    const warnHtml = dueStatus === 'overdue' ? `<span class="warn-icon overdue" title="已过期">⚠</span>` :
                     dueStatus === 'near' ? `<span class="warn-icon near" title="1 天内到期">⚠</span>` : '';
    li.innerHTML = `
      <div class="left">
        <input class="chk" type="checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <div class="main">
          <div class="task">${warnHtml}<span class="task-text">${escapeHtml(item.task)}</span></div>
          <div class="meta">[${escapeHtml(item.priority)}] · ${escapeHtml(item.category)} · 截止：${escapeHtml(dueDisplay)}</div>
        </div>
      </div>
      <div class="right">
        <button class="btn mini edit" data-id="${item.id}">编辑</button>
        <button class="btn mini danger del" data-id="${item.id}">删除</button>
      </div>
    `;
    ul.appendChild(li);
    li.querySelector('.chk').addEventListener('change', e=> toggleTodo(e.target.dataset.id));
    li.querySelector('.del').addEventListener('click', ()=> confirmAndDelete(item.id));
    li.querySelector('.edit').addEventListener('click', ()=> openEditModal(item));
  });
}

// 修复 resolveConfirm 函数，确保点击“确认删除”或“取消”时触发逻辑
function resolveConfirm(val) {
  const cm = document.getElementById('confirmModal');
  cm.classList.remove('open');
  cm.setAttribute('aria-hidden', 'true');
  if (_confirmResolver) {
    _confirmResolver(val); // 正确调用 resolver
  }
  _confirmResolver = null;
}

// 修复 confirmAndDelete 函数，确保删除逻辑正确执行
async function confirmAndDelete(id) {
  const ok = await showConfirm('确定要删除该任务吗？此操作不可恢复。');
  if (!ok) return; // 用户取消删除
  try {
    const res = await fetch(`/todos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadTodos();
      loadProgress();
      showToast('已删除');
    } else {
      showToast('删除失败');
    }
  } catch {
    showToast('网络错误');
  }
}

// 修复 closeCreateModal 函数，确保模态框正确关闭
function closeCreateModal() {
  const m = document.getElementById('createModal');
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
  document.getElementById('createForm').reset(); // 重置表单
  document.getElementById('m_category_new').style.display = 'none'; // 隐藏新分类输入框
}

// 修复新建任务时未填写截止日期的显示问题
async function onCreateSubmit(e) {
  e.preventDefault();
  const task = document.getElementById('m_task').value.trim();
  const priority = document.getElementById('m_priority').value;
  const mcatSel = document.getElementById('m_category_select').value;
  const mcatNew = document.getElementById('m_category_new').value.trim();
  const category = (mcatSel === '__new__' ? (mcatNew || '默认') : (mcatSel || '默认'));
  const dueVal = document.getElementById('m_due').value; // '' or 'YYYY-MM-DD'
  const due = dueVal || '暂无'; // 如果未填写日期，则设置为“暂无”

  if (!task) {
    showToast('请输入任务内容');
    return;
  }

  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, priority, category, due })
    });
    const body = await res.json().catch(() => null);
    console.log('POST', res.status, body);
    if (res.ok) {
      closeCreateModal();
      // 清除筛选以便新项可见
      document.getElementById('filterPriority').value = '';
      document.getElementById('filterCategory').value = '';
      if (document.getElementById('filterCompleted')) document.getElementById('filterCompleted').value = 'all';
      if (document.getElementById('sortDue')) document.getElementById('sortDue').value = '';
      await loadCategories();
      await loadTodos();
      loadProgress();
      showToast('添加成功');
    } else {
      showToast('添加失败');
      console.error('创建失败：', body);
    }
  } catch (err) {
    console.error(err);
    showToast('网络错误');
  }
}

// 修复 closeEditModal 函数，确保编辑模态框正确关闭
function closeEditModal() {
  const m = document.getElementById('editModal');
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
  document.getElementById('editForm').reset(); // 重置表单
  document.getElementById('e_category_new').style.display = 'none'; // 隐藏新分类输入框
  _currentEditId = null;
}

/* ---------- UI helpers ---------- */
function showToast(msg, timeout=1500){ let t=document.getElementById('toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); } t.textContent=msg; t.classList.add('visible'); clearTimeout(t._hideTimer); t._hideTimer=setTimeout(()=>t.classList.remove('visible'), timeout); }
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }