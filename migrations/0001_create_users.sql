-- migrations/0001_create_users.sql
-- 用户表 + 会话表（账号注册功能的初始结构）

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,               -- uuid
  email         TEXT UNIQUE NOT NULL,           -- 登录邮箱（唯一）
  password_hash TEXT NOT NULL,                  -- PBKDF2 哈希
  nickname      TEXT NOT NULL,                  -- 昵称（默认用邮箱前缀）
  role          TEXT NOT NULL DEFAULT 'student',-- 角色：student 学生 / teacher 教师
  created_at    TEXT NOT NULL                   -- ISO 时间
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,                  -- 会话 token（uuid）
  user_id    TEXT NOT NULL,                     -- 关联 users.id
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL                      -- 30 天后过期
);

-- 预留索引：按 token 查会话
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
