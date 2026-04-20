'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Todo } from '@/lib/types'

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)

  // 加载待办列表
  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('加载失败:', error)
    } else {
      setTodos(data || [])
    }
    setLoading(false)
  }

  // 添加新待办
  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTodo.trim(), is_completed: false }])
      .select()

    if (error) {
      console.error('添加失败:', error)
    } else {
      setTodos([data[0], ...todos])
      setNewTodo('')
    }
  }

  // 切换完成状态
  async function toggleTodo(todo: Todo) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id)

    if (error) {
      console.error('更新失败:', error)
    } else {
      setTodos(todos.map(t => 
        t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
      ))
    }
  }

  // 删除待办
  async function deleteTodo(id: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除失败:', error)
    } else {
      setTodos(todos.filter(t => t.id !== id))
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">📝 待办清单</h1>
      
      {/* 输入框 */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加新待办..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          添加
        </button>
      </form>

      {/* 待办列表 */}
      <ul className="space-y-2">
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

      {todos.length === 0 && (
        <p className="text-center text-gray-400 py-8">暂无待办，添加一个吧！🎉</p>
      )}
    </div>
  )
}
