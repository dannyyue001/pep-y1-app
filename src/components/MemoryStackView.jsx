import { useEffect, useState } from 'react'
import { GRADES, getSemesters, getUnits, getUnitWords, totalWords } from '../data/memoryStack.js'
import { buildMemoryUnits, generateMnemonic, BOOK_LABEL } from '../engine/mnemonicEngine.js'

// 记忆法标签（按方法类型归类，帮助家长理解设计）
function mnemonicTag(m) {
  if (!m) return '联想'
  if (/谐音/.test(m)) return '谐音'
  if (/动作|TPR|手|挥|跳/.test(m)) return '动作'
  if (/拆分|\+|＝/.test(m)) return '组合'
  if (/字母|像|图|画|脑海里/.test(m)) return '联想'
  return '联想'
}

// 一屏单元标签（pep 显示 U+序号，nce1/shsb 显示 lesson）
function unitTag(u, textbook) {
  if (textbook === 'pep') return `U${u.unit}`
  return `U${u.unitNo || u.unit_id.replace(/^\D+/, '')}`
}

export default function MemoryStackView({ textbook = 'pep' }) {
  // pep: 年级→学期→单元 三级；nce1/shsb: 教材内单元单级
  const [grade, setGrade] = useState(1)
  const [semester, setSemester] = useState('上')
  const [unitIndex, setUnitIndex] = useState(0)

  const isPep = textbook === 'pep'
  const engineUnits = isPep ? null : buildMemoryUnits(textbook)

  // 切换教材时重置选择
  useEffect(() => {
    setUnitIndex(0)
    setGrade(1)
    setSemester('上')
  }, [textbook])

  // 当前单元数据
  const semesters = isPep ? getSemesters(grade) : []
  const units = isPep ? getUnits(grade, semester) : engineUnits
  const current = isPep
    ? getUnitWords(grade, semester, units[unitIndex]?.value || units[0]?.value || 1)
    : (engineUnits[unitIndex] || engineUnits[0] || null)

  // 词总览（仅 pep 使用 memoryStack.totalWords；nce1/shsb 用引擎单元计数）
  const engineTotal = engineUnits ? engineUnits.reduce((n, u) => n + u.words.length, 0) : 0
  const shownTotal = isPep ? totalWords() : engineTotal

  const changeGrade = (g) => {
    setGrade(g)
    const sems = getSemesters(g)
    setSemester(sems[0].value)
    const us = getUnits(g, sems[0].value)
    setUnitIndex(0)
  }

  const changeSemester = (s) => {
    setSemester(s)
    setUnitIndex(0)
  }

  const changeUnit = (i) => setUnitIndex(Number(i))

  const tag = unitTag(current, textbook)

  return (
    <div className="page">
      <header className="app-header">
        <h1>🧠 记忆栈</h1>
        <p className="sub">
          {BOOK_LABEL[textbook]} · 每个单词一个好记的方法 + 例句 · 共 {shownTotal} 词
        </p>
      </header>

      {/* 教材内选择器 */}
      <section className="card stack-picker">
        {isPep ? (
          <>
            <div className="picker-row">
              <label className="picker-item">
                <span className="picker-label">年级</span>
                <select value={grade} onChange={(e) => changeGrade(Number(e.target.value))}>
                  {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </label>
              <label className="picker-item">
                <span className="picker-label">学期</span>
                <select value={semester} onChange={(e) => changeSemester(e.target.value)}>
                  {semesters.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
            <div className="picker-row">
              <label className="picker-item picker-wide">
                <span className="picker-label">单元</span>
                <select value={unitIndex} onChange={(e) => changeUnit(e.target.value)}>
                  {units.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
                </select>
              </label>
            </div>
          </>
        ) : (
          <div className="picker-row">
            <label className="picker-item picker-wide">
              <span className="picker-label">单元</span>
              <select value={unitIndex} onChange={(e) => changeUnit(e.target.value)}>
                {engineUnits.map((u, i) => (
                  <option key={u.unitId} value={i}>
                    U{u.unitNo} {u.unitName}（{u.words.length}词）
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>

      {current && (
        <>
          <div className="stack-unit-head">
            <span className="stack-unit-tag">{tag}</span>
            <div>
              <h2 className="stack-unit-name">{current.unitName || current.label}</h2>
              <p className="stack-unit-topic">
                {current.topic || ''}{current.topic ? ' · ' : ''}
                {current.words.length} 词
              </p>
            </div>
          </div>

          <div className="stack-list">
            {current.words.map((w, i) => (
              <div key={i} className="stack-card">
                <div className="stack-top">
                  <span className="stack-word">{w.word}</span>
                  <span className="stack-meta">{w.phonetic && `[${w.phonetic}]`} · {w.cn}</span>
                </div>
                <div className="stack-mnemonic">
                  <span className="stack-tag">{mnemonicTag(w.mnemonic)}</span>
                  <span>💡 {w.mnemonic}</span>
                </div>
                {w.example && (
                  <div className="stack-example">
                    <span className="stack-ex-en">📖 {w.example}</span>
                    <span className="stack-ex-cn">{w.exampleCn}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card tip-card">
            <h2 className="card-title">怎么用记忆栈</h2>
            <p className="tip-text">
              ① 先看"💡 记忆方法"，让孩子自己复述一遍（说出来才算记住）；② 再读例句，把单词放进句子里；③ 每周回来看同一单元，隔几天复习效果最好。
            </p>
          </div>
        </>
      )}
    </div>
  )
}
