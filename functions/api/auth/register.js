// functions/api/auth/register.js
// 用户注册：自建邮箱+密码（PBKDF2 哈希存储），注册成功即返回登录 token
import { json, hashPassword, createSession } from '../../lib/password.js'

export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const body = await request.json().catch(() => null)
    if (!body) return json({ error: '请求格式错误' }, 400)

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const nickname = String(body.nickname || '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: '邮箱格式不正确' }, 400)
    }
    if (password.length < 6) {
      return json({ error: '密码至少需要 6 位' }, 400)
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first()
    if (existing) {
      return json({ error: '该邮箱已注册' }, 409)
    }

    const id = crypto.randomUUID()
    const passwordHash = await hashPassword(password, email)
    const defaultNickname = nickname || email.split('@')[0]
    const createdAt = new Date().toISOString()

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, nickname, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(id, email, passwordHash, defaultNickname, 'student', createdAt)
      .run()

    const token = await createSession(env, id)

    return json(
      {
        token,
        user: { id, email, nickname: defaultNickname, role: 'student' },
      },
      201,
    )
  } catch (e) {
    return json({ error: '服务器错误：' + e.message }, 500)
  }
}
