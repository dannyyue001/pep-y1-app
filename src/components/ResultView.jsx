export default function ResultView({ answers, config, onRestart }) {
  const total = answers.length
  const right = answers.filter((a) => a.correct).length
  const pct = total ? Math.round((right / total) * 100) : 0
  const wrong = answers.filter((a) => !a.correct)

  const emoji = pct >= 90 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '🌱'

  return (
    <div className="page">
      <header className="app-header">
        <h1>练习完成</h1>
      </header>

      <div className="card score-card">
        <div className="score-emoji">{emoji}</div>
        <div className="score-num">{right} / {total}</div>
        <div className="score-pct">正确率 {pct}%</div>
      </div>

      {wrong.length > 0 ? (
        <section className="card">
          <h2 className="card-title">错题回顾（{wrong.length} 题）</h2>
          {wrong.map((w, i) => (
            <div key={i} className="wrong-item">
              <p className="wrong-stem">{w.question.stem}</p>
              <p className="wrong-line">
                <span className="wrong-you">你选了：{w.selected}</span>
                <span className="wrong-ans">正确答案：{w.question.answer}</span>
              </p>
            </div>
          ))}
        </section>
      ) : (
        <div className="card">
          <p className="all-right">全部答对，太棒了！🎉</p>
        </div>
      )}

      <button className="btn-primary" onClick={onRestart}>再练一次</button>
    </div>
  )
}
