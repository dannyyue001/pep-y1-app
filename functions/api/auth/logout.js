// functions/api/auth/logout.js
// 用户退出：删除当前 session token
import { json } from '../../lib/password.js'

export async function onRequestPost(context) {
  const { request, env } = context
  try {
    const auth = request.headers.get('Authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    if (token) {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    }
    return json({ ok: true })
  } catch (e) {
    return json({ error: '服务器错误：' + e.message }, 500)
  }
}
