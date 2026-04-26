# 📝 Todo List 待办清单应用

基于 Next.js + Supabase + Vercel 的全栈待办清单应用。

## 🚀 功能特性

- ✅ 添加任务
- ✅ 标记任务完成/未完成
- ✅ 删除任务
- ✅ 数据持久化到 Supabase 数据库
- ✅ 响应式设计，支持移动端

## 🛠️ 技术栈

- **前端框架**: Next.js 16 + React 19
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS 4
- **部署**: Vercel

## 📦 快速开始

### 1. 配置 Supabase

在 Supabase Dashboard 获取配置信息：
1. 访问 https://supabase.com/dashboard
2. 进入您的项目
3. 点击 Settings ⚙️ → API
4. 复制 `Project URL` 和 `anon public` key

### 2. 设置环境变量

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://agvitqqorxkscfvlnkqu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
```

### 3. 创建数据库表

在 Supabase SQL Editor 中运行：

```sql
-- 创建待办表
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人访问
CREATE POLICY "允许所有人访问" ON todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
```

### 4. 安装依赖

```bash
npm install
```

### 5. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
todo-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面
│   │   └── api/todos/route.ts    # API 接口
│   ├── components/
│   │   ├── AddTodo.tsx           # 添加任务组件
│   │   └── TodoList.tsx          # 任务列表组件
│   └── lib/
│       ├── supabase.ts           # Supabase 客户端
│       └── types.ts              # TypeScript 类型
├── .env.local                    # 环境变量
├── supabase-schema.sql           # 数据库表结构
└── package.json
```

## 🚀 部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 https://vercel.com
3. 导入您的 GitHub 仓库
4. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 Deploy

## 📖 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todos | 获取所有任务 |
| POST | /api/todos | 创建新任务 |
| PUT | /api/todos | 更新任务 |
| DELETE | /api/todos?id=1 | 删除任务 |

## 🎨 界面预览

- 输入框 + 添加按钮 → 添加新任务
- 复选框 → 标记完成/未完成
- 删除按钮 → 删除任务
- 已完成任务会显示删除线并降低透明度
