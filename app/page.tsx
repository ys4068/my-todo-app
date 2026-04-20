import TodoList from '@/components/TodoList'
import AddTodo from '@/components/AddTodo'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">📝 待办清单</h1>
        <AddTodo />
        <TodoList />
      </div>
    </main>
  )
}
