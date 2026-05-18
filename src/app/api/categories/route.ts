import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 在 API 路由中直接创建客户端，避免模块缓存问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// GET - 获取所有分类
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error: any) {
    console.error('获取分类失败:', error)
    return NextResponse.json(
      { error: '获取分类失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// POST - 创建新分类
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim() }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('创建分类失败:', error)
    return NextResponse.json(
      { error: '创建分类失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// PUT - 更新分类
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { id, name } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '缺少 ID' },
        { status: 400 }
      )
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('更新分类失败:', error)
    return NextResponse.json(
      { error: '更新分类失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// DELETE - 删除分类
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

    // 检查是否有待办事项关联到此分类
    const { count, error: countError } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (countError) {
      console.error('检查关联待办失败:', countError)
      throw countError
    }

    if (count && count > 0) {
      return NextResponse.json(
        { error: '无法删除：该分类下有待办事项' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('删除分类失败:', error)
    return NextResponse.json(
      { error: '删除分类失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}