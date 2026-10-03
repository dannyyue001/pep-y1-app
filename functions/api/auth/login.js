// functions/api/auth/login.js
// 用户登录：邮箱+密码校验，成功返回 token
import { json, hashPassword, createSession } from '../../lib/password.js'

export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const body = await request.json().catch(() => null)
    if (!body) return json({ error: '请求格式错误' }, 400)

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?',
    )
      .bind(email)
      .first()
    if (!user) {
      return json({ error: '邮箱或密码错误' }, 401)
    }

    const hash = await hashPassword(password, email)
    if (hash !== user.password_hash) {
      return json({ error: '邮箱或密码错误' }, 401)
    }

    const token = await createSession(env, user.id)

    return json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    })
  } catch (e) {
    return json({ error: '服务器错误：' + e.message }, 500)
  }
}
