#!/usr/bin/env python3
# 简单脚本：模拟前端的搜索/筛选/排序逻辑
import json
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'backend' / 'tasks.json'
if not p.exists():
    print('tasks.json not found:', p)
    raise SystemExit(1)

data = json.loads(p.read_text(encoding='utf-8'))
items = data.get('tasks', [])

print('\n全部任务:')
for t in items:
    print(f"- {t.get('id')} {t.get('title')} | {t.get('category')} | {t.get('priority')} | due {t.get('due_date')}")

# 搜索关键字 '读'
q = '读'
print('\n搜索关键字 `读` 的结果:')
for t in items:
    if q in (t.get('title') or '') or q in (t.get('description') or ''):
        print(f"- {t.get('id')} {t.get('title')}")

# 筛选: priority=高, category=学习
print('\n筛选: 优先级=高 且 类别=学习:')
for t in items:
    if t.get('priority') == '高' and t.get('category') == '学习':
        print(f"- {t.get('id')} {t.get('title')} (due {t.get('due_date')})")

# 按截止时间排序
print('\n按截止时间升序排序:')
items_sorted = sorted(items, key=lambda x: x.get('due_date') or '')
for t in items_sorted:
    print(f"- {t.get('id')} {t.get('title')} due {t.get('due_date')}")
