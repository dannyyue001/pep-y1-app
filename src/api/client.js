// src/api/client.js
// 前端 API 封装：注册 / 登录 / 获取当前用户 / 退出
// token 存 localStorage，供 /api/auth/me 恢复登录态

const TOKEN_KEY = 'pep_y1_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch (_) {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data?.error || '请求失败（' + res.status + '）')
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  register: (email, password, nickname) =>
    request('/api/auth/register', { method: 'POST', body: { email, password, nickname } }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { method: 'GET' }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
}
