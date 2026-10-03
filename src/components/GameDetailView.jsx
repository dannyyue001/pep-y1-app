import { getGame } from '../games/games.js'

// ---------- 界面示意（纯 CSS 静态画，非真实游戏界面） ----------
function Sketch({ type }) {
  if (type === 'listen_find') {
    const items = ['🎒', '✏️', '📖', '🧢']
    return (
      <div className="sketch">
        <div className="sk-speaker">🔊 请听：bag <i>（示意）</i></div>
        <div className="sk-grid2">
          {items.map((e, i) => (
            <div key={i} className={`sk-tile ${i === 0 ? 'sk-right' : ''}`}>
              <span className="sk-big">{e}</span>
              {i === 0 && <span className="sk-badge">✓</span>}
            </div>
          ))}
        </div>
        <p className="sk-note">听单词 → 4 选 1，选对高亮 ✓</p>
      </div>
    )
  }
  if (type === 'memory') {
    return (
      <div className="sketch">
        <div className="sk-grid4">
          {['❓', 'book', '❓', '📕', '❓', '❓', 'pen', '❓', '✏️', '❓', '❓', 'bag'].map((c, i) => (
            <div key={i} className={`sk-card ${typeof c === 'string' && c !== '❓' ? 'sk-open' : ''}`}>
              {c === '❓' ? '❓' : c}
            </div>
          ))}
        </div>
        <p className="sk-note">翻开两张：单词 ↔ 图片 配对成功则消除</p>
      </div>
    )
  }
  if (type === 'fishing') {
    return (
      <div className="sketch">
        <div className="sk-pond">
          <div className="sk-fish">🐟<span className="sk-fish-word">book</span></div>
          <div className="sk-fish sk-fish-2">🐠<span className="sk-fish-word">pen</span></div>
          <div className="sk-fish sk-fish-3">🐡<span className="sk-fish-word">bag</span></div>
          <div className="sk-hook">🎣</div>
        </div>
        <p className="sk-note">听到 /bʊk/ → 点「book」那条鱼，钓上来！</p>
      </div>
    )
  }
  if (type === 'whack') {
    const words = ['say', 'look', 'read', 'listen']
    return (
      <div className="sketch">
        <div className="sk-speaker">🔊 请听：listen</div>
        <div className="sk-grid3">
          {words.map((w, i) => (
            <div key={i} className={`sk-hole ${i === 3 ? 'sk-hit' : ''}`}>
              <span className="sk-mole">🐹</span>
              <span className="sk-mole-word">{w}</span>
            </div>
          ))}
        </div>
        <p className="sk-note">地鼠顶着单词冒头，3 秒内敲中「listen」！</p>
      </div>
    )
  }
  if (type === 'letters') {
    return (
      <div className="sketch">
        <div className="sk-letter-pic">🍎🍎🍎</div>
        <div className="sk-letter-slot">{['', '', '', '', ''].map((_, i) => <span key={i} className="sk-slot" />)}</div>
        <div className="sk-letter-block">t h r e e</div>
        <p className="sk-note">看 3 个苹果 → 用字母块拼出 three</p>
      </div>
    )
  }
  if (type === 'bingo') {
    const grid = ['cat', 'dog', 'bird', 'fish', 'rabbit', 'bag', 'pen', 'book', 'cap']
    return (
      <div className="sketch">
        <div className="sk-bingo">
          {grid.map((w, i) => (
            <div key={i} className={`sk-bingo-cell ${[0, 4, 8].includes(i) ? 'sk-bingo-hit' : ''}`}>
              {w}{[0, 4, 8].includes(i) && ' ✓'}
            </div>
          ))}
        </div>
        <p className="sk-note">听到 cat / dog / rabbit → 盖上印章，连成一线喊 Bingo！</p>
      </div>
    )
  }
  return null
}

// ---------- 详情页 ----------
export default function GameDetailView({ gameId, onBack }) {
  const g = getGame(gameId)
  if (!g) return <div className="page">游戏不存在</div>

  return (
    <div className="page">
      <header className="app-header">
        <button className="back-link" onClick={onBack}>‹ 返回游戏广场</button>
        <h1>{g.emoji} {g.name} <span className="game-stars">{g.stars}</span></h1>
        <p className="sub">{g.tagline}</p>
      </header>

      <section className="card">
        <h2 className="card-title">界面示意（模板，非真实界面）</h2>
        <Sketch type={g.sketch} />
      </section>

      <section className="card">
        <h2 className="card-title">玩法设计</h2>
        <ol className="howto-list">
          {g.howto.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>

      <section className="card">
        <h2 className="card-title">基本信息</h2>
        <div className="meta-grid">
          <div><span className="meta-label">记忆点</span><span className="meta-val">{g.memory}</span></div>
          <div><span className="meta-label">适合场景</span><span className="meta-val">{g.scene}</span></div>
          <div><span className="meta-label">单局时长</span><span className="meta-val">{g.time}</span></div>
          <div><span className="meta-label">适配知识点</span><span className="meta-val">{g.kp}</span></div>
        </div>
      </section>

      <section className="card tip-card">
        <h2 className="card-title">家长小贴士</h2>
        <p className="tip-text">{g.tips}</p>
      </section>

      <div className="card status-card">
        <p className="status-text">🚧 当前为设计模板，交互开发中——接入顺序按「听音找图 → 翻牌配对 → 单词钓鱼 → 单词 Bingo → 打地鼠 → 字母拼拼乐」推进。</p>
      </div>
    </div>
  )
}
