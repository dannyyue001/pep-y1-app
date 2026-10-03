// NavBar.jsx — 底部导航栏（首页 / 游戏 / 记忆栈 / 积累本 / 我的）
const TABS = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'games', label: '游戏', icon: '🎮' },
  { id: 'memory', label: '记忆栈', icon: '🧠' },
  { id: 'book', label: '积累本', icon: '📖' },
  { id: 'mine', label: '我的', icon: '👤' },
]

export default function NavBar({ tab, onChange }) {
  return (
    <nav className="navbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-item ${tab === t.id ? 'nav-on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
