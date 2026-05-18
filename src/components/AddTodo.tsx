'use client'

import { useState, useEffect } from 'react'
import type { Category } from '@/lib/types'

export default function AddTodo() {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // 获取分类列表
  useEffect(() => {
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
    fetchCategories()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(),
          category_id: categoryId
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '添加失败')
      }

      setTitle('')
      setCategoryId(null)
      // 刷新列表
      window.dispatchEvent(new CustomEvent('todo-added'))
    } catch (error: any) {
      console.error('添加待办失败:', error)
      alert(`添加失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加新待办..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '添加中...' : '添加'}
        </button>
      </div>
      
      {/* 分类选择 */}
      <div className="flex items-center gap-2">
        <label htmlFor="category-select" className="text-sm text-gray-600">
          分类:
        </label>
        <select
          id="category-select"
          value={categoryId === null ? '' : categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={categoriesLoading || loading}
        >
          <option value="">未分类</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        {/* 添加新分类按钮 */}
        <button
          type="button"
          onClick={async () => {
            const categoryName = prompt('请输入新分类名称:')
            if (categoryName && categoryName.trim()) {
              try {
                const res = await fetch('/api/categories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: categoryName.trim() })
                })
                if (!res.ok) {
                  const errorData = await res.json()
                  throw new Error(errorData.error || '创建分类失败')
                }
                const newCategory = await res.json()
                setCategories([...categories, newCategory])
                setCategoryId(newCategory.id)
              } catch (error: any) {
                console.error('创建分类失败:', error)
                alert(`创建分类失败: ${error.message}`)
              }
            }
          }}
          className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
          disabled={loading}
        >
          + 新建
        </button>
      </div>
    </form>
  )
}