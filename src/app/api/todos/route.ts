import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 在 API 路由中直接创建客户端，避免模块缓存问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// GET - 获取所有待办（支持按分类筛选和关联查询）
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const includeCategory = searchParams.get('include_category') === 'true'

    let query = supabase.from('todos').select('*')

    // 按分类筛选
    if (categoryId !== null) {
      if (categoryId === 'null') {
        // 获取未分类的待办
        query = query.is('category_id', null)
      } else {
        const categoryIdNum = parseInt(categoryId)
        if (isNaN(categoryIdNum)) {
          return NextResponse.json(
            { error: '无效的分类ID' },
            { status: 400 }
          )
        }
        query = query.eq('category_id', categoryIdNum)
      }
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // 如果需要包含分类信息
    if (includeCategory && data && data.length > 0) {
      const todosWithCategory = []
      for (const todo of data) {
        if (todo.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', todo.category_id)
            .single()

          if (categoryError && categoryError.code !== 'PGRST116') {
            console.error('获取分类信息失败:', categoryError)
            // 继续处理，但不包含分类信息
            todosWithCategory.push({ ...todo, category: null })
          } else {
            todosWithCategory.push({ ...todo, category: categoryData || null })
          }
        } else {
          todosWithCategory.push({ ...todo, category: null })
        }
      }
      return NextResponse.json(todosWithCategory, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error: any) {
    console.error('获取待办失败:', error)
    return NextResponse.json(
      { error: '获取待办失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// POST - 创建新待办（支持指定分类）
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { title, category_id } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    const insertData: Record<string, any> = {
      title: title.trim(),
      is_completed: false
    }

    // 处理分类ID
    if (category_id !== undefined && category_id !== null) {
      const categoryIdNum = parseInt(category_id)
      if (isNaN(categoryIdNum)) {
        return NextResponse.json(
          { error: '无效的分类ID' },
          { status: 400 }
        )
      }
      insertData.category_id = categoryIdNum
    } else {
      insertData.category_id = null
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('创建待办失败:', error)
    return NextResponse.json(
      { error: '创建待办失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// PUT - 更新待办（支持更新分类）
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { id, title, is_completed, category_id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '缺少 ID' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (is_completed !== undefined) updateData.is_completed = is_completed
    if (category_id !== undefined) {
      if (category_id === null) {
        updateData.category_id = null
      } else {
        const categoryIdNum = parseInt(category_id)
        if (isNaN(categoryIdNum)) {
          return NextResponse.json(
            { error: '无效的分类ID' },
            { status: 400 }
          )
        }
        updateData.category_id = categoryIdNum
      }
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('更新待办失败:', error)
    return NextResponse.json(
      { error: '更新待办失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// DELETE - 删除待办
export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少 ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除待办失败:', error)
    return NextResponse.json(
      { error: '删除待办失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}