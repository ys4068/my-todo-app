export interface Category {
  id: number
  name: string
  created_at: string
}

export interface Todo {
  id: number
  title: string
  is_completed: boolean
  created_at: string
  category_id: number | null
}

export interface TodoWithCategory extends Todo {
  category: Category | null
}