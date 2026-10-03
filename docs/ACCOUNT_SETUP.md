# 账号注册功能 · 部署步骤

本功能给 pep-y1-app 加上 **自建邮箱+密码注册/登录**，后端使用 Cloudflare Pages Functions + D1 数据库（全免费）。

## 目录结构

```
functions/
  api/auth/
    register.js     # 注册（邮箱+密码，PBKDF2 哈希，成功返回 token）
    login.js        # 登录（校验密码，返回 token）
    me.js           # 获取当前用户（恢复登录态）
    logout.js       # 退出（删除 token）
  lib/password.js   # 哈希 / 会话 / token 解析工具
migrations/
  0001_create_users.sql  # users + sessions 建表
wrangler.toml             # D1 数据库绑定配置
```

## 你需要做的（Cloudflare 控制台）

### 1. 创建 D1 数据库
- 登录 https://dash.cloudflare.com → 左上角选择你的账号 → 左侧 **Workers & Pages** → **D1**
- 点 **Create database** → 名称填 `pep-y1-db` → 创建
- 创建后记下数据库的 **database_id**（类似 `xxxxxxxx-xxxx-...`）

### 2. 填入 database_id
- 把 `wrangler.toml` 里的 `database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"` 换成真实值

### 3. 建表
两种方式任选：
- **控制台**：D1 页面 → 你的数据库 → **Console** → 粘贴执行 `migrations/0001_create_users.sql` 内容
- **命令行**：`npx wrangler d1 execute pep-y1-db --file=./migrations/0001_create_users.sql --remote`

### 4. 配置 Pages 部署
- 项目 Settings → **Functions** 确认已启用（默认开启）
- Builds & deployments：**清除 Deploy command**（纯静态 + Functions 不用 wrangler deploy），Build command `npm run build`，Output `dist`
- 重新 push 或 **Retry deployment**

### 5. 本地开发
```bash
npm i -D wrangler   # 安装 wrangler
npx wrangler d1 execute pep-y1-db --file=./migrations/0001_create_users.sql --local
npx wrangler pages dev dist --d1 DB=pep-y1-db
```
（本机运行需把 `database_id` 占位符替换成真实值，或先创建本地 D1）

## API 说明

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/register | body: `{email, password, nickname?}` → `{token, user}` |
| POST | /api/auth/login | body: `{email, password}` → `{token, user}` |
| GET | /api/auth/me | Header: `Authorization: Bearer <token>` → `{user}` |
| POST | /api/auth/logout | Header: `Authorization: Bearer <token>` → `{ok}` |

用户角色默认 `student`（教师账号为后续方向，预留了 `role` 字段）。
