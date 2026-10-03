// MineView.jsx — "我的"页：账号（登录/注册） + 功能列表
import { useState, useEffect } from 'react'
import AuthView from './AuthView.jsx'
import { api, getToken, setToken } from '../api/client.js'

const SECTIONS = [
  { icon: '📒', title: '错题本', desc: '练过的错题自动收集，随时复习（开发中）' },
  { icon: '📊', title: '学习报告', desc: '周测 + 掌握情况报告（开发中）' },
  { icon: '📖', title: '知识库', desc: '人教PEP 一上 · 129 条知识点（查看）' },
  { icon: '⚙️', title: '设置', desc: '音频开关、单元范围、家长密码（开发中）' },
]

export default function MineView() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  // 启动时尝试恢复登录态
  useEffect(() => {
    if (!getToken()) return
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null) // token 失效则清除
      })
  }, [])

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (_) {
      /* 忽略退出接口错误 */
    }
    setToken(null)
    setUser(null)
  }

  return (
    <div className="page">
      <header className="app-header">
        <h1>我的</h1>
        <p className="sub">孩子的学习小档案</p>
      </header>

      {/* 账号卡片 */}
      <div className="card account-card">
        {user ? (
          <div className="account-logged">
            <div className="account-avatar">👤</div>
            <div className="account-info">
              <div className="account-name">{user.nickname || user.email}</div>
              <div className="account-email">{user.email}</div>
              <div className="account-role">{user.role === 'teacher' ? '教师账号' : '学生账号'}</div>
            </div>
            <button className="auth-submit auth-logout" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        ) : (
          <div className="account-guest">
            <div className="account-avatar">🔑</div>
            <div className="account-info">
              <div className="account-name">未登录</div>
              <div className="account-email">注册账号，可跨设备保存学习进度</div>
            </div>
            <button
              className="auth-submit"
              onClick={() => {
                setAuthMode('login')
                setShowAuth(true)
              }}
            >
              登录 / 注册
            </button>
          </div>
        )}
      </div>

      <div className="mine-list">
        {SECTIONS.map((s, i) => (
          <div key={i} className="mine-item">
            <span className="mine-icon">{s.icon}</span>
            <div className="mine-body">
              <span className="mine-title">{s.title}</span>
              <span className="mine-desc">{s.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card status-card">
        <p className="status-text">🧑‍🏫 家长端功能陆续接入中——错题本会优先做，直接挂钩练习结果。</p>
      </div>

      {showAuth && (
        <AuthView
          mode={authMode}
          onSuccess={(u) => {
            setUser(u)
            setShowAuth(false)
          }}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  )
}
