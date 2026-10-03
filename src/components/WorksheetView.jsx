// WorksheetView.jsx — 单元练习卷（worksheet 题型交互化）
// Part 1 连连看（中英配对）→ Part 2 圈一圈（词义选择）→ Part 3 我来填（情境选句）→ 星星结果
import { useState, useMemo } from 'react'
import kb from '../data/kb.js'
import { makeQuiz } from '../engine/questionEngine.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- 连连看 ----------
function MatchPart({ words, onDone }) {
  const [left, setLeft] = useState(() => shuffle(words))
  const [right, setRight] = useState(() => shuffle(words))
  const [selL, setSelL] = useState(null)
  const [selR, setSelR] = useState(null)
  const [pairs, setPairs] = useState([]) // 已配对 word 列表
  const [wrong, setWrong] = useState(null)

  const pickL = (i) => { setSelL(i); setWrong(null) }
  const pickR = (i) => {
    if (selL === null) { setSelR(i); setWrong(null); return }
    const w = left[selL]
    if (right[i].word === w.word) {
      const next = [...pairs, w.word]
      setPairs(next)
      setSelL(null); setSelR(null)
      if (next.length === words.length) setTimeout(() => onDone(), 500)
    } else {
      setWrong(w.word)
      setSelL(null); setSelR(null)
      setTimeout(() => setWrong(null), 600)
    }
  }

  return (
    <div>
      <p className="ws-part-desc">先点左边的英文，再点右边对应的中文，连成一对。</p>
      <div className="ws-match">
        <div className="ws-match-col">
          {left.map((w, i) => (
            <button
              key={w.word}
              className={`ws-match-item ${selL === i ? 'ws-sel' : ''} ${pairs.includes(w.word) ? 'ws-done' : ''}`}
              disabled={pairs.includes(w.word)}
              onClick={() => pickL(i)}
            >{w.word}</button>
          ))}
        </div>
        <div className="ws-match-col">
          {right.map((w, i) => (
            <button
              key={w.word}
              className={`ws-match-item ws-cn ${selR === i ? 'ws-sel' : ''} ${pairs.includes(w.word) ? 'ws-done' : ''} ${wrong === w.word ? 'ws-wrong' : ''}`}
              disabled={pairs.includes(w.word)}
              onClick={() => pickR(i)}
            >{w.cn}</button>
          ))}
        </div>
      </div>
      <div className="ws-progress">
        {words.map((w) => <span key={w.word} className={`ws-dot ${pairs.includes(w.word) ? 'ws-dot-on' : ''}`} />)}
        <span className="ws-count">{pairs.length}/{words.length}</span>
      </div>
    </div>
  )
}

// ---------- 选择题（圈一圈 / 我来填） ----------
function ChoicePart({ questions, title, onProgress, onFinish }) {
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState([]) // {q, ok}
  const [picked, setPicked] = useState(null)

  const q = questions[idx]
  const done = results.length

  const pick = (opt) => {
    if (picked) return
    setPicked(opt)
    const ok = opt === q.answer
    const next = [...results, { q, ok, picked: opt }]
    setResults(next)
    onProgress(next.filter((r) => r.ok).length)
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1)
        setPicked(null)
      } else {
        onFinish(next)
      }
    }, 800)
  }

  return (
    <div>
      <p className="ws-part-desc">{title}</p>
      <div className="ws-question">
        <p className="ws-stem">{q.stem}</p>
        {q.hint && <p className="ws-hint">{q.hint}</p>}
      </div>
      <div className="ws-options">
        {q.options.map((opt) => {
          let cls = 'ws-opt'
          if (picked) {
            if (opt === q.answer) cls += ' ws-opt-right'
            else if (opt === picked) cls += ' ws-opt-wrong'
          }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)} disabled={!!picked}>{opt}</button>
          )
        })}
      </div>
      <div className="ws-progress">
        <span className="ws-count">第 {idx + 1} / {questions.length} 题</span>
        <span className="ws-score">已答对 {done} 题</span>
      </div>
    </div>
  )
}

// ---------- 练习卷主组件 ----------
export default function WorksheetView({ unitId, unitLabel, onQuit }) {
  const [phase, setPhase] = useState(1) // 1 连连看 | 2 圈一圈 | 3 我来填 | 4 结果
  const [matchDone, setMatchDone] = useState(false)
  const [choiceScores, setChoiceScores] = useState([]) // 每题对错
  const [choiceQuestions, setChoiceQuestions] = useState([])

  const words = useMemo(() => {
    const vs = kb.vocabulary.filter((v) => v.kp_id.startsWith(unitId + '_'))
    return shuffle(vs.slice(0, 8))
  }, [unitId])

  const quizzes = useMemo(() => {
    const q2 = makeQuiz(unitId, ['cn_pick_en', 'en_pick_cn'], 5).filter((q) => q.passed)
    const q3 = makeQuiz(unitId, ['context_pick_sentence'], 3).filter((q) => q.passed)
    return { q2, q3 }
  }, [unitId])

  // 结果计算
  const matchScore = matchDone ? 4 : 0
  const choiceScore = choiceScores.filter((r) => r.ok).length * 2
  const total = matchScore + choiceScore
  const stars = total >= 17 ? 3 : total >= 13 ? 2 : total >= 9 ? 1 : 0
  const wrongList = choiceScores.filter((r) => !r.ok)

  return (
    <div className="page ws-page">
      <header className="app-header">
        <button className="back-link" onClick={onQuit}>‹ 返回首页</button>
        <h1>📝 单元练习卷</h1>
        <p className="sub">{unitLabel} · 做完 3 关，收星星 ⭐</p>
      </header>

      {/* 步骤条 */}
      <div className="ws-steps">
        {['连连看', '圈一圈', '我来填'].map((s, i) => (
          <div key={s} className={`ws-step ${phase >= i + 1 ? 'ws-step-on' : ''}`}>
            <span className="ws-step-no">{i + 1}</span>
            <span className="ws-step-name">{s}</span>
          </div>
        ))}
      </div>

      <section className="card">
        {phase === 1 && <MatchPart words={words} onDone={() => { setMatchDone(true); setPhase(2) }} />}

        {phase === 2 && quizzes.q2.length > 0 && (
          <ChoicePart
            questions={quizzes.q2}
            title="圈一圈：选出正确的单词。"
            onProgress={() => {}}
            onFinish={(rs) => { setChoiceScores([...rs]); setPhase(3) }}
          />
        )}

        {phase === 3 && quizzes.q3.length > 0 && (
          <ChoicePart
            questions={quizzes.q3}
            title="我来填：读情境，选出合适的英文句子。"
            onProgress={() => {}}
            onFinish={(rs) => { setChoiceScores((prev) => [...prev, ...rs]); setPhase(4) }}
          />
        )}

        {phase === 4 && (
          <div className="ws-result">
            <div className="ws-stars">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
            <p className="ws-total">总分 {total} / 20</p>
            <div className="ws-breakdown">
              <span>连连看 {matchScore}/4</span>
              <span>圈一圈 + 我来填 {choiceScore}/16</span>
            </div>
            {wrongList.length > 0 && (
              <div className="ws-wrong-review">
                <p className="ws-review-title">错题回顾（{wrongList.length} 题）</p>
                {wrongList.map((r, i) => (
                  <div key={i} className="ws-review-item">
                    <span className="ws-review-stem">{r.q.stem}</span>
                    <span className="ws-review-ans">✓ {r.q.answer}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="ws-actions">
              <button className="btn-primary" onClick={() => { setPhase(1); setMatchDone(false); setChoiceScores([]) }}>再练一次</button>
              <button className="btn-secondary" onClick={onQuit}>返回首页</button>
            </div>
            <p className="ws-encourage">{stars >= 3 ? '太棒了！全部掌握！' : stars >= 1 ? '不错！错题再练一遍就更好！' : '别灰心，先看记忆栈再回来！'}</p>
          </div>
        )}
      </section>
    </div>
  )
}
