// src/components/AuthView.jsx
// 登录 / 注册页（自建邮箱+密码）
import { useState } from 'react'
import { api, setToken } from '../api/client.js'

export default function AuthView({ mode: initMode, onSuccess, onSwitchMode, onClose }) {
  const [mode, setMode] = useState(initMode || 'login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (m) => {
    setMode(m)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('请填写邮箱和密码')
      return
    }
    if (mode === 'register' && password.length < 6) {
      setError('密码至少需要 6 位')
      return
    }
    setLoading(true)
    try {
      const data =
        mode === 'register'
          ? await api.register(email, password, nickname)
          : await api.login(email, password)
      setToken(data.token)
      onSuccess && onSuccess(data.user)
    } catch (err) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'login' ? '登录' : '注册新账号'

  return (
    <div className="auth-view">
      <div className="auth-card">
        <div className="auth-head">
          <span className="auth-title">{title}</span>
          {onClose && (
            <button className="auth-close" onClick={onClose} aria-label="关闭">
              ✕
            </button>
          )}
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'on' : ''}`}
            onClick={() => switchMode('login')}
          >
            登录
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'on' : ''}`}
            onClick={() => switchMode('register')}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input
              className="auth-input"
              type="text"
              placeholder="昵称（可选）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '处理中…' : title}
          </button>
        </form>

        {onSwitchMode && (
          <div className="auth-foot">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button className="auth-link" onClick={() => onSwitchMode()}>
              {mode === 'login' ? '去注册' : '去登录'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
