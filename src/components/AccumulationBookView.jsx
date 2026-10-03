import { useState, useEffect, useRef } from 'react'

// 后端API地址（开发时走Vite代理，生产时同域）
const API_BASE = '/api'

export default function AccumulationBookView() {
  const [subTab, setSubTab] = useState('add') // add | book | exam
  const [knowledgeList, setKnowledgeList] = useState([])

  // 添加知识点相关
  const [input, setInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeType, setAnalyzeType] = useState('') // text | image
  const [result, setResult] = useState(null)
  const [source, setSource] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  // 出卷相关
  const [examConfig, setExamConfig] = useState({ choiceCount: 5, fillCount: 3 })
  const [examPaper, setExamPaper] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)

  // 初始化：从localStorage加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pep_aiBook')
      if (saved) setKnowledgeList(JSON.parse(saved))
    } catch (e) { console.warn('加载积累本失败', e) }
  }, [])

  const saveList = (list) => {
    setKnowledgeList(list)
    localStorage.setItem('pep_aiBook', JSON.stringify(list))
  }

  // ============ 文本分析（调用后端） ============
  const handleTextAnalyze = async () => {
    if (!input.trim()) return
    setAnalyzing(true)
    setAnalyzeType('text')
    setResult(null)
    try {
      const resp = await fetch(`${API_BASE}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '分析失败')
      setResult(data.result)
      setSource(data.model || 'AI')
    } catch (e) {
      alert(`分析失败：${e.message}\n请确认后端服务已启动（python3 backend/server.py）`)
    } finally {
      setAnalyzing(false)
    }
  }

  // ============ 图片上传分析（调用后端视觉模型） ============
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('图片不能超过10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setImagePreview(base64)
      setAnalyzing(true)
      setAnalyzeType('image')
      setResult(null)
      setInput('')

      try {
        const resp = await fetch(`${API_BASE}/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || '图片识别失败')
        setResult(data.result)
        setSource(data.model || 'AI视觉')
        // 如果识别到了英文，自动填到输入框
        if (data.result?.en && data.result.en !== 'unknown') {
          setInput(data.result.en)
        }
      } catch (e) {
        alert(`图片识别失败：${e.message}\n请确认后端服务已启动`)
        setImagePreview('')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!result) return
    const item = {
      id: Date.now().toString(),
      ...result,
      mastery: 'new',
      date: new Date().toISOString().split('T')[0]
    }
    saveList([item, ...knowledgeList])
    setResult(null)
    setInput('')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ============ 积累本管理 ============
  const cycleMastery = (id) => {
    const order = ['new', 'learning', 'mastered']
    const list = knowledgeList.map(k => {
      if (k.id === id) {
        const idx = order.indexOf(k.mastery || 'new')
        k.mastery = order[(idx + 1) % order.length]
      }
      return k
    })
    saveList(list)
  }

  const deleteItem = (id) => {
    if (!confirm('确定删除这个知识点吗？')) return
    saveList(knowledgeList.filter(k => k.id !== id))
  }

  const exportData = () => {
    const data = { version: '1.0', exportDate: new Date().toISOString(), knowledge: knowledgeList }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI积累本备份_${new Date().toLocaleDateString('zh-CN')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        const list = data.knowledge || data
        if (Array.isArray(list)) {
          saveList([...list, ...knowledgeList])
          alert(`成功导入 ${list.length} 个知识点`)
        }
      } catch (err) {
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
  }

  // ============ 智能出卷 ============
  const generateExam = () => {
    if (knowledgeList.length < 3) {
      alert('积累本至少需要3个知识点才能出卷')
      return
    }
    const pool = [...knowledgeList].sort(() => Math.random() - 0.5)
    const questions = []

    const choicePool = pool.filter(k => k.type === 'word' || k.type === 'phrase').slice(0, examConfig.choiceCount)
    choicePool.forEach((k, i) => {
      const wrongs = knowledgeList.filter(x => x.id !== k.id).sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [k.zh, ...wrongs.map(w => w.zh)].sort(() => Math.random() - 0.5)
      questions.push({
        type: 'choice', num: i + 1,
        question: `What does "${k.en}" mean?`,
        options, answer: k.zh, en: k.en
      })
    })

    const fillPool = pool.filter(k => !choicePool.includes(k)).slice(0, examConfig.fillCount)
    let numOffset = choicePool.length
    fillPool.forEach((k, i) => {
      questions.push({
        type: 'fill', num: numOffset + i + 1,
        question: k.example ? `根据例句填空：${k.example.replace(new RegExp(k.en, 'i'), '_____')}（${k.zh}）` : `翻译：${k.zh} → 英文：_____`,
        answer: k.en, zh: k.zh
      })
    })

    setExamPaper({ questions, total: questions.length, date: new Date().toLocaleString() })
    setShowAnswers(false)
  }

  const masteryLabels = { new: '🆕 新学', learning: '📖 学习中', mastered: '✅ 已掌握' }

  return (
    <div className="page">
      <div className="app-header">
        <h1>📖 AI积累本</h1>
        <p className="sub">输入单词/句子或上传图片，AI自动整理知识点，出卷时确保考到</p>
      </div>

      {/* 子Tab */}
      <div className="ab-subtabs">
        {[
          { id: 'add', label: '➕ 添加', count: '' },
          { id: 'book', label: '📚 积累本', count: knowledgeList.length },
          { id: 'exam', label: '📝 出卷', count: '' }
        ].map(t => (
          <button key={t.id} className={`ab-subtab ${subTab === t.id ? 'on' : ''}`} onClick={() => setSubTab(t.id)}>
            {t.label}{t.count !== '' && <span className="ab-badge">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ===== 添加知识点 ===== */}
      {subTab === 'add' && (
        <div className="card">
          <div className="card-title">AI智能整理（文本 / 图片）</div>

          {/* 图片上传区 */}
          <div
            className="ab-upload-area"
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #d8dee6', borderRadius: 10, padding: 16, textAlign: 'center',
              cursor: 'pointer', marginBottom: 12, background: imagePreview ? 'transparent' : 'var(--bg)'
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="预览" style={{ maxHeight: 150, borderRadius: 8 }} />
            ) : (
              <div>
                <div style={{ fontSize: 28 }}>📷</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                  点击上传图片（单词卡/课文截图/手写）
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, margin: '8px 0' }}>—— 或 ——</div>

          {/* 文本输入 */}
          <textarea
            className="ab-textarea"
            placeholder="输入英语单词或句子，例如：butterfly 或 What colour is it?"
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={2}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              className="ab-btn ab-btn-primary"
              style={{ flex: 1 }}
              onClick={handleTextAnalyze}
              disabled={analyzing || !input.trim()}
            >
              {analyzing && analyzeType === 'text' ? '⏳ AI分析中...' : '🤖 文本整理'}
            </button>
            {imagePreview && (
              <button className="ab-btn" onClick={() => { setImagePreview(''); if (fileInputRef.current) fileInputRef.current.value = '' }}>
                ✖️ 取消图片
              </button>
            )}
          </div>

          {analyzing && analyzeType === 'image' && (
            <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--primary)', fontSize: 13 }}>
              🖼️ 视觉模型正在识别图片内容...
            </div>
          )}

          {result && (
            <div style={{ marginTop: 14, padding: 12, background: 'var(--primary-soft)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                ✅ {source === 'AI视觉' ? 'AI视觉识别结果' : 'AI整理结果'}
                {result.image_note && <span style={{ marginLeft: 8 }}>（{result.image_note}）</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>英文：</strong>{result.en}</div>
                <div><strong>中文：</strong>{result.zh}</div>
                <div><strong>类型：</strong>{result.type}</div>
                <div><strong>难度：</strong>{'⭐'.repeat(result.difficulty || 1)}</div>
                <div style={{ gridColumn: '1/-1' }}><strong>例句：</strong>{result.example}</div>
                <div style={{ gridColumn: '1/-1' }}>
                  <strong>标签：</strong>
                  {(result.tags || []).map(t => <span key={t} className="ab-tag">{t}</span>)}
                </div>
              </div>
              <button className="ab-btn ab-btn-success" style={{ marginTop: 10, width: '100%' }} onClick={handleSave}>
                ✅ 保存到积累本
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== 积累本列表 ===== */}
      {subTab === 'book' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="card-title" style={{ margin: 0 }}>共 {knowledgeList.length} 个知识点</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="ab-btn ab-btn-sm" onClick={exportData}>📤 导出</button>
              <label className="ab-btn ab-btn-sm" style={{ cursor: 'pointer' }}>
                📥 导入
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          {knowledgeList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
              积累本还是空的，去「添加」页面试试吧～
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {knowledgeList.map(k => (
                <div key={k.id} className="ab-kb-item" style={{ borderLeft: `4px solid ${k.mastery === 'mastered' ? 'var(--right)' : k.mastery === 'learning' ? 'var(--primary)' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{k.en}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{k.zh}</div>
                      {k.example && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>e.g. {k.example}</div>}
                      <div style={{ marginTop: 4 }}>
                        {(k.tags || []).map(t => <span key={t} className="ab-tag ab-tag-sm">{t}</span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <button className="ab-btn ab-btn-xs" onClick={() => cycleMastery(k.id)}>
                        {masteryLabels[k.mastery] || '🆕 新学'}
                      </button>
                      <button className="ab-btn ab-btn-xs ab-btn-danger" onClick={() => deleteItem(k.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== 智能出卷 ===== */}
      {subTab === 'exam' && (
        <div className="card">
          <div className="card-title">智能出卷（从积累本随机抽题）</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: 'var(--muted)' }}>选择题数量</label>
              <input type="number" className="ab-input" value={examConfig.choiceCount} min={1} max={20}
                onChange={e => setExamConfig({ ...examConfig, choiceCount: parseInt(e.target.value) || 5 })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: 'var(--muted)' }}>填空题数量</label>
              <input type="number" className="ab-input" value={examConfig.fillCount} min={0} max={10}
                onChange={e => setExamConfig({ ...examConfig, fillCount: parseInt(e.target.value) || 3 })} />
            </div>
          </div>
          <button className="ab-btn ab-btn-primary" style={{ width: '100%' }} onClick={generateExam}>
            🎯 生成试卷
          </button>

          {examPaper && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>📝 试卷（{examPaper.total}题）</span>
                <button className="ab-btn ab-btn-sm" onClick={() => setShowAnswers(!showAnswers)}>
                  {showAnswers ? '🙈 隐藏答案' : '👁️ 显示答案'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {examPaper.questions.map((q, i) => (
                  <div key={i} style={{ padding: 10, background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 6 }}>
                      {q.num}. {q.type === 'choice' ? '【选择】' : '【填空】'}{q.question}
                    </div>
                    {q.type === 'choice' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {q.options.map((opt, j) => (
                          <div key={j} style={{ fontSize: 14, padding: '4px 8px',
                            background: showAnswers && opt === q.answer ? 'var(--right-soft)' : 'transparent',
                            borderRadius: 6 }}>
                            {String.fromCharCode(65 + j)}. {opt}
                            {showAnswers && opt === q.answer && ' ✅'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                        {showAnswers ? `答案：<span style="color:var(--right);font-weight:600">${q.answer}</span>` : '在横线上写下答案：_____'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {showAnswers && (
                <div style={{ marginTop: 12, padding: 10, background: 'var(--right-soft)', borderRadius: 8, fontSize: 13 }}>
                  <strong>参考答案：</strong>
                  {examPaper.questions.map((q, i) => (
                    <span key={i} style={{ marginRight: 12 }}>{q.num}. {q.answer}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
