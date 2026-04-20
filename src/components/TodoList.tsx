'use client'

import { useEffect, useState } from 'react'
import type { Todo } from '@/lib/types'

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  // 获取待办列表
  async function fetchTodos() {
    try {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('加载失败')
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('加载待办失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换完成状态
  async function toggleTodo(todo: Todo) {
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

  if (loading) {
    return <div className="text-center py-8 text-gray-500">加载中...</div>
  }

  return (
    <ul className="space-y-2 mt-6">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow ${
            todo.is_completed ? 'opacity-50' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={todo.is_completed}
            onChange={() => toggleTodo(todo)}
            className="w-5 h-5 cursor-pointer"
          />
          <span
            className={`flex-1 ${
              todo.is_completed ? 'line-through text-gray-400' : ''
            }`}
          >
            {todo.title}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="px-3 py-1 text-red-500 hover:bg-red-50 rounded transition"
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  )
}
