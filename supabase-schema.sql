-- Supabase 数据库表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建待办表
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security (可选，根据需求调整)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读写（简单起见，生产环境建议添加用户认证）
CREATE POLICY "允许所有人访问" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
