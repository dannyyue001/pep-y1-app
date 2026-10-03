import { GAMES } from '../games/games.js'

export default function GamesView({ onOpen }) {
  return (
    <div className="page">
      <header className="app-header">
        <h1>游戏广场</h1>
        <p className="sub">听一听 · 玩一玩 · 记单词不费劲</p>
      </header>

      <section className="card intro-card">
        <p className="intro-text">
          6 个小游戏按「记忆科学」设计：<b>多感官</b>（听+看+动）、<b>短时高频</b>（2~8 分钟一局）、<b>即时反馈</b>（对了马上表扬）。目前为设计模板，逐个接入交互中。
        </p>
      </section>

      <div className="game-grid">
        {GAMES.map((g) => (
          <button key={g.id} className="game-card" onClick={() => onOpen(g.id)}>
            <div className="game-emoji">{g.emoji}</div>
            <div className="game-info">
              <span className="game-name">{g.name}</span>
              <span className="game-stars">{g.stars}</span>
            </div>
            <p className="game-tagline">{g.tagline}</p>
            <span className="game-memory">{g.memory}</span>
            <span className="game-cta">查看设计 ›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
