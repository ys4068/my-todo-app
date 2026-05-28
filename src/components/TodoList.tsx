'use client'

import { useEffect, useState } from 'react'
import type { TodoWithCategory, Category } from '@/lib/types'

export default function TodoList() {
  const [todos, setTodos] = useState<TodoWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null | 'all' | 'today'>('all')
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
    fetchCategories()
    
    // 监听待办添加事件
    const handleTodoAdded = () => {
      fetchTodos()
    }
    window.addEventListener('todo-added', handleTodoAdded)
    
    return () => {
      window.removeEventListener('todo-added', handleTodoAdded)
    }
  }, [])

  // 获取待办列表（带分类信息）
  async function fetchTodos() {
    try {
      let url = '/api/todos?include_category=true&sort=due_date'
      
      if (selectedCategory === 'today') {
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
        
        const res = await fetch(url)
        if (!res.ok) throw new Error('加载失败')
        const data: TodoWithCategory[] = await res.json()
        
        // 过滤今天到期的待办
        const todayTodos = data.filter(todo => {
          if (!todo.due_date) return false
          return todo.due_date >= todayStart && todo.due_date < todayEnd
        })
        setTodos(todayTodos)
      } else if (selectedCategory !== 'all') {
        url += `&category_id=${selectedCategory === null ? 'null' : selectedCategory}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('加载失败')
        const data: TodoWithCategory[] = await res.json()
        setTodos(data)
      } else {
        const res = await fetch(url)
        if (!res.ok) throw new Error('加载失败')
        const data: TodoWithCategory[] = await res.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('加载待办失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取分类列表
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('加载分类失败')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // 切换完成状态
  async function toggleTodo(todo: TodoWithCategory) {
    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todo.id,
          is_completed: !todo.is_completed
        })
      })

      if (!res.ok) throw new Error('更新失败')

      setTodos(todos.map(t =>
        t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
      ))
    } catch (error) {
      console.error('更新待办失败:', error)
    }
  }

  // 删除待办
  async function deleteTodo(id: number) {
    try {
      const res = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('删除失败')

      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('删除待办失败:', error)
    }
  }

  // 更新待办分类
  async function updateTodoCategory(todoId: number, newCategoryId: number | null) {
    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todoId,
          category_id: newCategoryId
        })
      })

      if (!res.ok) throw new Error('更新分类失败')

      // 更新本地状态
      setTodos(todos.map(t =>
        t.id === todoId ? { ...t, category_id: newCategoryId, category: newCategoryId ? 
          categories.find(c => c.id === newCategoryId) || null : null } : t
      ))
    } catch (error) {
      console.error('更新待办分类失败:', error)
    }
  }

  // 更新待办截止日期
  async function updateTodoDueDate(todoId: number, newDueDate: string | null) {
    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todoId,
          due_date: newDueDate
        })
      })

      if (!res.ok) throw new Error('更新截止日期失败')

      setTodos(todos.map(t =>
        t.id === todoId ? { ...t, due_date: newDueDate } : t
      ))
    } catch (error) {
      console.error('更新待办截止日期失败:', error)
    }
  }

  if (loading && categoriesLoading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>
  }

  // 计算未分类待办数量
  const unclassifiedCount = todos.filter(todo => todo.category_id === null).length
  
  // 计算各分类待办数量
  const categoryCounts: Record<number, number> = {}
  todos.forEach(todo => {
    if (todo.category_id) {
      categoryCounts[todo.category_id] = (categoryCounts[todo.category_id] || 0) + 1
    }
  })

  // 计算今天待办数量
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
  const todayCount = todos.filter(todo => {
    if (!todo.due_date) return false
    return todo.due_date >= todayStart && todo.due_date < todayEnd
  }).length

  // 判断截止日期状态
  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    if (due < todayStart) return 'overdue'
    if (due >= todayStart && due < tomorrowStart) return 'today'
    return 'future'
  }

  // 格式化日期显示
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="mt-6">
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setSelectedCategory('all')
            fetchTodos()
          }}
          className={`px-3 py-1 rounded-full text-sm transition ${
            selectedCategory === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          全部 ({todos.length})
        </button>
        <button
          onClick={() => {
            setSelectedCategory('today')
            fetchTodos()
          }}
          className={`px-3 py-1 rounded-full text-sm transition ${
            selectedCategory === 'today' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          今天 ({todayCount})
        </button>
        <button
          onClick={() => {
            setSelectedCategory(null)
            fetchTodos()
          }}
          className={`px-3 py-1 rounded-full text-sm transition ${
            selectedCategory === null 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          未分类 ({unclassifiedCount})
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id)
              fetchTodos()
            }}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCategory === category.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {category.name} ({categoryCounts[category.id] || 0})
          </button>
        ))}
      </div>

      {/* 待办列表 */}
      {todos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedCategory === 'all' 
            ? '暂无待办事项' 
            : selectedCategory === null 
              ? '暂无未分类待办' 
              : '该分类下暂无待办'}
        </div>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow ${
                todo.is_completed ? 'opacity-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodo(todo)}
                className="w-5 h-5 mt-1 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span
                    className={`flex-1 break-words ${
                      todo.is_completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {todo.title}
                  </span>
                  {todo.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                      {todo.category.name}
                    </span>
                  )}
                  {todo.due_date && (
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      getDueDateStatus(todo.due_date) === 'overdue' 
                        ? 'bg-red-100 text-red-800' 
                        : getDueDateStatus(todo.due_date) === 'today'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {formatDateDisplay(todo.due_date)}
                    </span>
                  )}
                </div>
                
                {/* 分类和截止日期编辑 */}
                {!todo.is_completed && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <select
                      value={todo.category_id === null ? '' : todo.category_id}
                      onChange={(e) => updateTodoCategory(todo.id, e.target.value ? Number(e.target.value) : null)}
                      className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">移至未分类</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">截止:</label>
                      <input
                        type="datetime-local"
                        value={todo.due_date ? todo.due_date.slice(0, 16) : ''}
                        onChange={(e) => updateTodoDueDate(todo.id, e.target.value || null)}
                        className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {todo.due_date && (
                        <button
                          onClick={() => updateTodoDueDate(todo.id, null)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 text-red-500 hover:bg-red-50 rounded transition self-start mt-1"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}