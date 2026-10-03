import { useState } from 'react'
import { TEMPLATES, TEMPLATE_IDS } from '../engine/questionEngine.js'

const COUNTS = [5, 10, 20]

const BOOK_LABEL = { pep: '人教PEP', nce1: '新概念一', shsb: '沪教版' }

export default function HomeView({ textbook = 'pep', grade, semester, unit, unitInfo, onStart, onWorksheet }) {
  const [selectedTpls, setSelectedTpls] = useState(() => ['cn_pick_en', 'en_pick_cn', 'listen_pick_en'])
  const [count, setCount] = useState(10)

  const isY1Up = grade === 1 && semester === '上'
  const canPractice = (textbook !== 'pep' || isY1Up) && unitInfo && Number(unitInfo.wordCount) > 0

  const toggle = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  return (
    <div className="page">
      <header className="app-header">
        <h1>一年级英语练一练</h1>
        <p className="sub">{BOOK_LABEL[textbook] || '人教PEP'} 跟课本同步 · 当前：{textbook === 'pep' ? `${grade === 1 ? '一年级' : '二年级'}第${semester}学期` : ''} U{unit} {unitInfo?.name_en || ''}</p>
      </header>

      {canPractice ? (
        <>
          {/* 单元练习卷（worksheet 版） */}
          <section className="card ws-entry-card">
            <div className="ws-entry-left">
              <h2 className="card-title">📝 单元练习卷</h2>
              <p className="ws-entry-desc">按单元过关：连连看 → 圈一圈 → 我来填，做完得星星 ⭐</p>
            </div>
            <button className="btn-primary ws-entry-btn" onClick={onWorksheet}>开始本单元</button>
          </section>

          <section className="card">
            <h2 className="card-title">自由练习（随机出题）</h2>
            <p className="ws-entry-desc">当前单元：{unitInfo.name_en} · {unitInfo.wordCount} 词 · {unitInfo.sentenceCount} 句</p>

            <div className="sub-title">选题型</div>
            <div className="chip-grid">
              {TEMPLATE_IDS.map((id) => {
                const on = selectedTpls.includes(id)
                return (
                  <button
                    key={id}
                    className={`chip ${on ? 'chip-on' : ''}`}
                    onClick={() => toggle(selectedTpls, setSelectedTpls, id)}
                  >
                    <span className="chip-main">{TEMPLATES[id].name}</span>
                  </button>
                )
              })}
            </div>

            <div className="sub-title">选题数</div>
            <div className="chip-grid">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  className={`chip ${count === c ? 'chip-on' : ''}`}
                  onClick={() => setCount(c)}
                >
                  <span className="chip-main">{c} 题</span>
                </button>
              ))}
            </div>

            <button
              className="btn-primary"
              disabled={selectedTpls.length === 0}
              onClick={() => onStart({ units: [unitInfo.id], templates: selectedTpls, count })}
            >
              开始练习
            </button>
          </section>
        </>
      ) : (
        <section className="card">
          <h2 className="card-title">素材整理中</h2>
          <p className="ws-entry-desc">
            该册的词汇/句型素材已收集（见记忆栈），出题引擎数据尚未入库。可以先到「🧠 记忆栈」背单词，等这册数据入库后即可练习。
          </p>
        </section>
      )}

      <p className="foot-note">题目由本册知识库确定性生成 · 不联网 · 无广告</p>
    </div>
  )
}
