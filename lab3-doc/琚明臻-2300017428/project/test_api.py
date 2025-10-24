#!/usr/bin/env python3
"""
ToDoList API 测试脚本
用于测试所有API端点的功能
"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:5000"

def print_separator(title):
    """打印分隔符"""
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def test_api_connection():
    """测试API连接"""
    print_separator("测试API连接")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API服务连接成功")
            print(f"响应: {response.json()}")
            return True
        else:
            print(f"❌ API服务连接失败: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务，请确保服务正在运行")
        return False

def test_create_task():
    """测试创建任务"""
    print_separator("测试创建任务")
    
    test_tasks = [
        {
            "title": "学习Flask框架",
            "description": "完成Flask Web开发教程",
            "priority": "high",
            "category": "学习"
        },
        {
            "title": "买菜做饭",
            "description": "去超市买菜，准备晚餐",
            "priority": "medium",
            "category": "生活"
        },
        {
            "title": "整理文档",
            "description": "整理项目相关文档",
            "priority": "low",
            "category": "工作"
        }
    ]
    
    created_tasks = []
    
    for i, task_data in enumerate(test_tasks, 1):
        print(f"\n创建任务 {i}:")
        print(f"数据: {json.dumps(task_data, ensure_ascii=False, indent=2)}")
        
        try:
            response = requests.post(f"{BASE_URL}/tasks", json=task_data)
            print(f"状态码: {response.status_code}")
            
            if response.status_code == 201:
                result = response.json()
                print("✅ 任务创建成功")
                print(f"创建的任务: {json.dumps(result['task'], ensure_ascii=False, indent=2)}")
                created_tasks.append(result['task'])
            else:
                print(f"❌ 任务创建失败: {response.json()}")
                
        except Exception as e:
            print(f"❌ 请求异常: {e}")
    
    return created_tasks

def test_get_tasks():
    """测试获取任务列表"""
    print_separator("测试获取任务列表")
    
    # 获取所有任务
    print("\n1. 获取所有任务:")
    try:
        response = requests.get(f"{BASE_URL}/tasks")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 获取任务列表成功")
            print(f"总任务数: {result['total']}")
            for task in result['tasks']:
                print(f"  - ID: {task['id']}, 标题: {task['title']}, 优先级: {task['priority']}, 分类: {task['category']}")
        else:
            print(f"❌ 获取任务列表失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 按优先级过滤
    print("\n2. 按优先级过滤 (high):")
    try:
        response = requests.get(f"{BASE_URL}/tasks?priority=high")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 按优先级过滤成功")
            print(f"高优先级任务数: {result['total']}")
            for task in result['tasks']:
                print(f"  - ID: {task['id']}, 标题: {task['title']}")
        else:
            print(f"❌ 按优先级过滤失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 按分类过滤
    print("\n3. 按分类过滤 (学习):")
    try:
        response = requests.get(f"{BASE_URL}/tasks?category=学习")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 按分类过滤成功")
            print(f"学习类任务数: {result['total']}")
            for task in result['tasks']:
                print(f"  - ID: {task['id']}, 标题: {task['title']}")
        else:
            print(f"❌ 按分类过滤失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_update_task(task_id):
    """测试更新任务"""
    print_separator(f"测试更新任务 (ID: {task_id})")
    
    update_data = {
        "title": "更新后的学习Flask框架",
        "description": "完成Flask Web开发教程 - 已更新",
        "priority": "medium"
    }
    
    print(f"更新数据: {json.dumps(update_data, ensure_ascii=False, indent=2)}")
    
    try:
        response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 任务更新成功")
            print(f"更新后的任务: {json.dumps(result['task'], ensure_ascii=False, indent=2)}")
        else:
            print(f"❌ 任务更新失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_toggle_completion(task_id):
    """测试切换任务完成状态"""
    print_separator(f"测试切换任务完成状态 (ID: {task_id})")
    
    # 切换为已完成
    print("\n1. 切换为已完成:")
    try:
        response = requests.patch(f"{BASE_URL}/tasks/{task_id}/complete")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 任务状态切换成功")
            print(f"任务状态: {result['message']}")
            print(f"任务信息: {json.dumps(result['task'], ensure_ascii=False, indent=2)}")
        else:
            print(f"❌ 任务状态切换失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 再次切换为未完成
    print("\n2. 再次切换为未完成:")
    try:
        response = requests.patch(f"{BASE_URL}/tasks/{task_id}/complete")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 任务状态切换成功")
            print(f"任务状态: {result['message']}")
        else:
            print(f"❌ 任务状态切换失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_get_stats():
    """测试获取统计信息"""
    print_separator("测试获取统计信息")
    
    try:
        response = requests.get(f"{BASE_URL}/tasks/stats")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 获取统计信息成功")
            stats = result['stats']
            print(f"总任务数: {stats['total_tasks']}")
            print(f"已完成任务数: {stats['completed_tasks']}")
            print(f"未完成任务数: {stats['pending_tasks']}")
            print(f"完成率: {stats['completion_rate']}%")
            print(f"优先级分布: {json.dumps(stats['priority_distribution'], ensure_ascii=False, indent=2)}")
        else:
            print(f"❌ 获取统计信息失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_delete_task(task_id):
    """测试删除任务"""
    print_separator(f"测试删除任务 (ID: {task_id})")
    
    try:
        response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 任务删除成功")
            print(f"删除的任务: {json.dumps(result['deleted_task'], ensure_ascii=False, indent=2)}")
        else:
            print(f"❌ 任务删除失败: {response.json()}")
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def test_error_handling():
    """测试错误处理"""
    print_separator("测试错误处理")
    
    # 测试不存在的任务
    print("\n1. 测试获取不存在的任务:")
    try:
        response = requests.get(f"{BASE_URL}/tasks/999")
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 测试无效的优先级
    print("\n2. 测试创建无效优先级的任务:")
    try:
        invalid_data = {
            "title": "测试任务",
            "description": "测试描述",
            "priority": "invalid",
            "category": "测试"
        }
        response = requests.post(f"{BASE_URL}/tasks", json=invalid_data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")

def main():
    """主测试函数"""
    print("🚀 开始测试ToDoList API...")
    print(f"测试目标: {BASE_URL}")
    
    # 测试API连接
    if not test_api_connection():
        print("\n❌ API服务未运行，请先启动服务: python app.py")
        return
    
    # 创建测试任务
    created_tasks = test_create_task()
    if not created_tasks:
        print("\n❌ 没有成功创建任务，停止测试")
        return
    
    # 获取任务ID用于后续测试
    test_task_id = created_tasks[0]['id']
    
    # 获取任务列表
    test_get_tasks()
    
    # 更新任务
    test_update_task(test_task_id)
    
    # 切换任务完成状态
    test_toggle_completion(test_task_id)
    
    # 获取统计信息
    test_get_stats()
    
    # 测试错误处理
    test_error_handling()
    
    # 删除任务
    test_delete_task(test_task_id)
    
    print_separator("测试完成")
    print("✅ 所有测试已完成！")
    print("\n💡 提示:")
    print("- 查看服务器日志了解详细请求信息")
    print("- 可以手动访问 http://localhost:5000 查看API信息")
    print("- 使用Postman或其他API工具进行更详细的测试")

if __name__ == "__main__":
    main()
