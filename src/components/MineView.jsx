// MineView.jsx — "我的"页（占位：错题本/设置/关于，后续填充）
const SECTIONS = [
  { icon: '📒', title: '错题本', desc: '练过的错题自动收集，随时复习（开发中）' },
  { icon: '📊', title: '学习报告', desc: '周测 + 掌握情况报告（开发中）' },
  { icon: '📖', title: '知识库', desc: '人教PEP 一上 · 129 条知识点（查看）' },
  { icon: '⚙️', title: '设置', desc: '音频开关、单元范围、家长密码（开发中）' },
]

export default function MineView() {
  return (
    <div className="page">
      <header className="app-header">
        <h1>我的</h1>
        <p className="sub">孩子的学习小档案</p>
      </header>

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
    </div>
  )
}
