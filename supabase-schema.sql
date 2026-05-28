-- Supabase 数据库表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 添加 due_date 字段（如果不存在）
ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);