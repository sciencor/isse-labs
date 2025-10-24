#!/usr/bin/env python3
"""
TodoList API 测试脚本
用于验证所有API接口的功能
"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:6597"


def test_health_check():
    """测试健康检查接口"""
    print("🔍 测试健康检查接口...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 健康检查通过: {data['message']}")
            if "statistics" in data["data"]:
                stats = data["data"]["statistics"]
                print(
                    f"   📊 当前统计: 总任务{stats['total']}个, 已完成{stats['completed']}个, 待完成{stats['pending']}个"
                )
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False


def test_create_task():
    """测试创建任务"""
    print("\n📝 测试创建任务...")
    test_tasks = [
        {"title": "完成Python作业", "category": "学习", "priority": "高"},
        {"title": "准备会议材料", "category": "工作", "priority": "中"},
        {"title": "买菜做饭", "category": "生活", "priority": "低"},
        {"title": "阅读技术书籍", "category": "学习", "priority": "中"},
        {"title": "整理房间", "category": "生活", "priority": "低"},
    ]

    created_tasks = []
    for task in test_tasks:
        try:
            response = requests.post(
                f"{BASE_URL}/tasks",
                headers={"Content-Type": "application/json"},
                data=json.dumps(task),
            )
            if response.status_code == 201:
                data = response.json()
                created_tasks.append(data["data"])
                print(f"✅ 创建任务成功: {task['title']}")
            else:
                print(f"❌ 创建任务失败: {task['title']} - {response.text}")
        except Exception as e:
            print(f"❌ 创建任务异常: {task['title']} - {e}")

    return created_tasks


def test_get_tasks():
    """测试获取任务列表"""
    print("\n📋 测试获取任务列表...")
    try:
        response = requests.get(f"{BASE_URL}/tasks")
        if response.status_code == 200:
            data = response.json()
            tasks = data["data"]
            print(f"✅ 获取任务列表成功: 共{len(tasks)}个任务")
            for task in tasks:
                status = "已完成" if task["completed"] else "待完成"
                print(
                    f"   - {task['title']} ({task['category']}/{task['priority']}) - {status}"
                )
            return tasks
        else:
            print(f"❌ 获取任务列表失败: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ 获取任务列表异常: {e}")
        return []


def test_filter_tasks():
    """测试筛选功能"""
    print("\n🔍 测试筛选功能...")

    # 按类别筛选
    try:
        response = requests.get(f"{BASE_URL}/tasks?category=学习")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 按类别筛选成功: 学习类任务{len(data['data'])}个")
        else:
            print(f"❌ 按类别筛选失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 按类别筛选异常: {e}")

    # 按优先级筛选
    try:
        response = requests.get(f"{BASE_URL}/tasks?priority=高")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 按优先级筛选成功: 高优先级任务{len(data['data'])}个")
        else:
            print(f"❌ 按优先级筛选失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 按优先级筛选异常: {e}")


def test_statistics():
    """测试统计信息接口"""
    print("\n📊 测试统计信息接口...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            data = response.json()
            stats = data["data"]
            print(f"✅ 获取统计信息成功:")
            print(f"   📈 总任务数: {stats['total']}")
            print(f"   ✅ 已完成: {stats['completed']}")
            print(f"   ⏳ 待完成: {stats['pending']}")
            return True
        else:
            print(f"❌ 获取统计信息失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 获取统计信息异常: {e}")
        return False


def test_update_task(task_id):
    """测试更新任务状态"""
    print(f"\n✏️ 测试更新任务状态 (ID: {task_id})...")
    try:
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"completed": True}),
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 更新任务状态成功: {data['data']['title']} -> 已完成")
            return True
        else:
            print(f"❌ 更新任务状态失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 更新任务状态异常: {e}")
        return False


def test_delete_task(task_id):
    """测试删除任务"""
    print(f"\n🗑️ 测试删除任务 (ID: {task_id})...")
    try:
        response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 删除任务成功: {data['message']}")
            return True
        else:
            print(f"❌ 删除任务失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 删除任务异常: {e}")
        return False


def main():
    """主测试函数"""
    print("🚀 开始TodoList API测试")
    print("=" * 50)

    # 1. 健康检查
    if not test_health_check():
        print("❌ 服务器未启动，请先运行 python app.py")
        return

    # 2. 创建测试任务
    created_tasks = test_create_task()
    if not created_tasks:
        print("❌ 无法创建测试任务，测试终止")
        return

    # 等待一下确保数据同步
    time.sleep(1)

    # 3. 获取任务列表
    tasks = test_get_tasks()

    # 4. 测试筛选功能
    test_filter_tasks()

    # 5. 测试统计信息接口
    test_statistics()

    # 6. 更新第一个任务状态
    if tasks:
        test_update_task(tasks[0]["id"])

    # 7. 删除最后一个任务
    if len(tasks) > 1:
        test_delete_task(tasks[-1]["id"])

    # 8. 最终状态检查
    print("\n📊 最终状态检查...")
    final_tasks = test_get_tasks()

    # 9. 最终统计信息
    print("\n📈 最终统计信息...")
    test_statistics()

    print("\n" + "=" * 50)
    print("🎉 API测试完成！")
    print(f"📈 测试结果: 当前共有{len(final_tasks)}个任务")

    # 统计信息
    completed = sum(1 for task in final_tasks if task["completed"])
    pending = len(final_tasks) - completed
    print(f"✅ 已完成: {completed}个")
    print(f"⏳ 待完成: {pending}个")


if __name__ == "__main__":
    main()
