export interface Category {
  id: number
  name: string
  color: string
  icon: string
  created_at: string
}

export interface Todo {
  id: number
  title: string
  is_completed: boolean
  due_date: string | null
  created_at: string
  category_id: number | null
}

export interface TodoWithCategory extends Todo {
  category?: Category | null
}
