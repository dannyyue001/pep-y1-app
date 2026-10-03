// src/worker/index.js
// Cloudflare Worker 动态入口：静态资源由 [assets] 托管（dist），
// 动态 API（/api/*）由本 Worker 处理，复用 functions 的 auth 逻辑。
//
// 部署方式：npx wrangler deploy（配合 wrangler.toml 的 main + [assets]）
// 本地调试：npx wrangler dev --local（自动使用本地 D1）

import { onRequestPost as register } from '../../functions/api/auth/register.js'
import { onRequestPost as login } from '../../functions/api/auth/login.js'
import { onRequestGet as me } from '../../functions/api/auth/me.js'
import { onRequestPost as logout } from '../../functions/api/auth/logout.js'

// 构造 Pages Functions 兼容的 context 对象，传给复用 handler
function makeContext(request, env, ctx) {
  return {
    request,
    env,
    params: {},
    data: {},
    waitUntil: (p) => ctx.waitUntil(p),
    next: () => new Response('Not Found', { status: 404 }),
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method
    const c = makeContext(request, env, ctx)

    // 动态 API 路由
    if (pathname.startsWith('/api/')) {
      if (pathname === '/api/auth/register' && method === 'POST') return register(c)
      if (pathname === '/api/auth/login' && method === 'POST') return login(c)
      if (pathname === '/api/auth/me' && method === 'GET') return me(c)
      if (pathname === '/api/auth/logout' && method === 'POST') return logout(c)
      return new Response(JSON.stringify({ error: '接口不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }

    // 非 API：单页应用 fallback，未匹配到静态资源的 GET 请求返回 index.html
    if (method === 'GET') {
      // 静态资源（js/css/图片等）已被 [assets] 自动匹配，不会走到这里；
      // 走到这里的是 SPA 前端路由（如刷新 /units/1），返回 index.html
      const indexReq = new Request(new URL('/index.html', url).toString(), request)
      return env.ASSETS.fetch(indexReq)
    }

    return new Response('Not Found', { status: 404 })
  },
}
