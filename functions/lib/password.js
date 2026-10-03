// functions/lib/password.js
// 密码哈希工具：使用 Web Crypto API（Cloudflare Workers 原生支持，无需额外依赖）
// 方案：PBKDF2-SHA256，email 作为 salt 的一部分，100000 次迭代

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const saltData = enc.encode('pep-y1-app:' + salt)
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltData, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return btoa(String.fromCharCode(...new Uint8Array(bits)))
}

async function createSession(env, userId) {
  const token = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 天
  await env.DB.prepare(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
  )
    .bind(token, userId, now.toISOString(), expiresAt.toISOString())
    .run()
  return token
}

// 从 Authorization: Bearer <token> 解析出用户（供需要登录态的接口复用）
async function getUserByToken(env, request) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) return null
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.nickname, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`,
  )
    .bind(token, new Date().toISOString())
    .first()
  return row || null
}

export { hashPassword, createSession, getUserByToken }
