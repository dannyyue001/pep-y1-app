// functions/api/auth/me.js
// 获取当前登录用户：根据 Authorization Bearer token 返回用户信息（用于恢复登录态）
import { json, getUserByToken } from '../../lib/password.js'

export async function onRequestGet(context) {
  const { request, env } = context
  try {
    const user = await getUserByToken(env, request)
    if (!user) return json({ error: '未登录或会话已过期' }, 401)
    return json({ user })
  } catch (e) {
    return json({ error: '服务器错误：' + e.message }, 500)
  }
}
