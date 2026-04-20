# 待办清单应用 📝

使用 Next.js + Supabase + Vercel 构建的待办事项应用。

## 技术栈

- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Supabase** - PostgreSQL 数据库
- **Vercel** - 部署平台

## 快速开始

### 1. 配置 Supabase

1. 访问 https://app.supabase.com 创建新项目
2. 在 SQL Editor 中运行 `supabase-schema.sql` 创建表
3. 获取项目配置：
   - Settings → API → Project URL
   - Settings → API → anon/public key

### 2. 配置环境变量

编辑 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 key
```

### 3. 本地运行

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 按提示操作，记得在 Vercel 面板添加环境变量
```

或者：
1. 访问 https://vercel.com
2. Import Git 仓库
3. 添加环境变量
4. 一键部署！

## 功能

- ✅ 添加待办事项
- ✅ 标记完成/未完成
- ✅ 删除待办
- ✅ 数据云端同步

## 项目结构

```
src/
├── app/
│   └── page.tsx        # 首页
├── components/
│   └── TodoList.tsx    # 待办组件
└── lib/
    ├── supabase.ts     # Supabase 客户端
    └── types.ts        # 类型定义
```

---

由小侯 🐒 帮主人创建！
