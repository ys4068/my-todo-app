import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 在 API 路由中直接创建客户端，避免模块缓存问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// GET - 获取所有待办
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('todos')
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
    console.error('获取待办失败:', error)
    return NextResponse.json(
      { error: '获取待办失败', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// POST - 创建新待办
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { title } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: title.trim(), is_completed: false }])
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

// PUT - 更新待办
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { id, title, is_completed } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: '缺少 ID' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (is_completed !== undefined) updateData.is_completed = is_completed

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
