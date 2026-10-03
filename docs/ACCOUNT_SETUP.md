# 账号注册功能 · 部署步骤（Cloudflare Worker 动态模式）

本功能给 pep-y1-app 加上 **自建邮箱+密码注册/登录**，后端采用 **Cloudflare Worker + Static Assets + D1 数据库**（全免费）。
项目同时托管静态资源（前端）和动态 API（`/api/*`），部署命令为 `npx wrangler deploy`（不依赖 Pages deploy command）。

## 目录结构

```
src/
  worker/index.js      # Worker 动态入口：/api 路由 + 静态资源 fallback
functions/
  api/auth/
    register.js        # 注册（邮箱+密码，PBKDF2 哈希，成功返回 token）
    login.js           # 登录（校验密码，返回 token）
    me.js              # 获取当前用户（恢复登录态）
    logout.js          # 退出（删除 token）
  lib/password.js      # 哈希 / 会话 / token 解析工具
migrations/
  0001_create_users.sql  # users + sessions 建表
wrangler.toml           # Worker 入口 + 静态资源 + D1 绑定
```

## 你需要做的

### 1. 创建 D1 数据库（已完成）
- 登录 https://dash.cloudflare.com → 左侧 **Workers & Pages** → **D1** → Create database，名称 `pep-y1-db`
- database_id 已填入 `wrangler.toml`（`ee2fe2ce-...`）

### 2. 建表（已完成）
- D1 页面 → 你的数据库 → **Console** → 逐条执行 `migrations/0001_create_users.sql` 内容（注意去掉 `--` 注释，逐条执行）
- 已建：`users`、`sessions` 两张表 + 索引

### 3. 本地开发
```bash
npm i -D wrangler
npm run build                                  # 产出 dist
npx wrangler d1 execute pep-y1-db --file=./migrations/0001_create_users.sql --local
npx wrangler dev --local --port 8788           # 启动本地 Worker 调试
```

### 4. 部署到 Cloudflare（动态 Worker）
首次部署需要 CLI 认证（在终端执行）：
```bash
cd /Users/wow011/Documents/edu/pep-y1-app
npx wrangler login          # 浏览器授权 Cloudflare
npx wrangler deploy         # 部署 Worker + 静态资源 + D1
```
- 部署成功后得到一个 **`.workers.dev`** 域名（如 `pep-y1-app.<你的子域>.workers.dev`），可加自定义域名
- 之后每次改代码：`npm run build && npx wrangler deploy`

> 注意：项目已从 Cloudflare **Pages** 迁移为 **Worker** 模式（因 Pages 无法清空 Deploy command，`npx wrangler deploy` 会把 Pages 误当 Worker 部署而失败）。部署目标是 Worker，域名从 `pages.dev` 变为 `workers.dev`。

## API 说明

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/register | body: `{email, password, nickname?}` → `{token, user}` |
| POST | /api/auth/login | body: `{email, password}` → `{token, user}` |
| GET | /api/auth/me | Header: `Authorization: Bearer <token>` → `{user}` |
| POST | /api/auth/logout | Header: `Authorization: Bearer <token>` → `{ok}` |

用户角色默认 `student`（教师账号为后续方向，预留了 `role` 字段）。
