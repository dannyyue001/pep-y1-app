import { useMemo, useState } from 'react'
import { makeQuiz, TEMPLATES } from '../engine/questionEngine.js'

export default function QuizView({ config, onFinish, onQuit }) {
  const questions = useMemo(
    () => makeQuiz(config.units[0], config.templates, config.count),
    [config]
  )
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])

  if (questions.length === 0) {
    return (
      <div className="page">
        <div className="card">
          <p>这个单元暂时没有可出题的知识点，换个单元或题型试试。</p>
          <button className="btn-primary" onClick={onQuit}>返回</button>
        </div>
      </div>
    )
  }

  const q = questions[idx]
  const isLast = idx === questions.length - 1

  const choose = (opt) => {
    if (selected !== null) return
    setSelected(opt)
    setAnswers((prev) => [...prev, { question: q, selected: opt, correct: opt === q.answer }])
  }

  const next = () => {
    if (isLast) {
      onFinish(answers)
    } else {
      setIdx(idx + 1)
      setSelected(null)
    }
  }

  const done = answers.length

  return (
    <div className="page">
      <header className="app-header">
        <h1>第 {idx + 1} / {questions.length} 题</h1>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${(done / questions.length) * 100}%` }} />
        </div>
      </header>

      <div className="card question-card">
        <p className="q-tag">{TEMPLATES[q.templateId].name} · {q.lesson}</p>
        <h2 className="q-stem">{q.stem}</h2>
        {q.hint ? <p className="q-hint">🔊 {q.hint}</p> : null}

        <div className="option-list">
          {q.options.map((opt) => {
            let cls = 'option'
            if (selected !== null) {
              if (opt === q.answer) cls += ' option-right'
              else if (opt === selected) cls += ' option-wrong'
              else cls += ' option-dim'
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)} disabled={selected !== null}>
                {opt}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className={`feedback ${selected === q.answer ? 'fb-right' : 'fb-wrong'}`}>
            {selected === q.answer ? '✓ 答对了！' : `✗ 正确答案是：${q.answer}`}
          </div>
        )}
      </div>

      <div className="bottom-bar">
        <button className="btn-ghost" onClick={onQuit}>退出</button>
        {selected !== null && (
          <button className="btn-primary" onClick={next}>
            {isLast ? '看结果' : '下一题'}
          </button>
        )}
      </div>
    </div>
  )
}
