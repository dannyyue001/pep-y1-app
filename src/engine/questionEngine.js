// questionEngine.js — 出题引擎（确定性校验层 JS 版）
// 原则：答案只来自知识库字段；干扰项只来自知识库/白名单；每道题过 R1~R8 校验才交付。
// 支持多教材：按 unitId 前缀自动解析 pep（人教PEP）/ nce1（新概念一）/ shsb（沪教版）
import kb_pep from '../data/kb.js'
import kb_nce1 from '../data/kb_nce1.js'
import kb_shsb from '../data/kb_shsb.js'

const KBS = { pep: kb_pep, nce1: kb_nce1, shsb: kb_shsb }

// 按 unitId 前缀解析教材知识库（pep_ / nce1_ / shsb_）
function resolveKb(unitId) {
  let kb = kb_pep
  if (unitId.startsWith('nce1')) kb = kb_nce1
  else if (unitId.startsWith('shsb')) kb = kb_shsb
  if (!kb.whitelist) kb.whitelist = [...new Set((kb.vocabulary || []).map((v) => v.word))]
  return kb
}

// ---------- 题型模板 ----------
export const TEMPLATES = {
  cn_pick_en: {
    name: '中译英选择',
    kp_types: ['vocabulary'],
    stem: (kp) => `选出与「${kp.cn}」对应的英文单词`,
  },
  en_pick_cn: {
    name: '英译中选择',
    kp_types: ['vocabulary'],
    stem: (kp) => `选出单词 ${kp.word} 的中文意思`,
  },
  listen_pick_en: {
    name: '听音选词',
    kp_types: ['vocabulary'],
    stem: (kp) => `听录音，选出你听到的单词`,
    hint: (kp) => `/${kp.phonetic}/`,
  },
  context_pick_sentence: {
    name: '情境选句',
    kp_types: ['sentence'],
    stem: (kp) => `情境：${kp.context}。选出合适的英文句子`,
  },
}

export const TEMPLATE_IDS = Object.keys(TEMPLATES)

// ---------- 知识库 ----------
export function getUnits(bookKey = 'pep') {
  const kb = KBS[bookKey] || kb_pep
  return kb.units.map((u) => ({
    id: u.unit_id,
    name_en: u.name_en,
    name_cn: u.name_cn,
    topic: u.topic,
    wordCount: kb.vocabulary.filter((v) => v.kp_id.startsWith(u.unit_id + '_')).length,
    sentenceCount: kb.sentences.filter((s) => s.kp_id.startsWith(u.unit_id + '_')).length,
  }))
}

export const TEXTBOOKS = Object.keys(KBS) // ['pep','nce1','shsb']

function vocabOf(unitId) {
  return resolveKb(unitId).vocabulary.filter((v) => v.kp_id.startsWith(unitId + '_'))
}
function sentOf(unitId) {
  return resolveKb(unitId).sentences.filter((s) => s.kp_id.startsWith(unitId + '_'))
}

// ---------- 干扰项（确定性：知识库 distractors → 同单元词池 → 全册白名单） ----------
function pickDistractors(kp, isSentence, unitId, n, exclude) {
  const kb = resolveKb(unitId)
  const chosen = []
  const answer = isSentence ? kp.pattern_en : kp.word
  if (!isSentence) {
    for (const d of kp.distractors || []) {
      if (d !== answer && !chosen.includes(d) && kb.whitelist.includes(d)) chosen.push(d)
    }
    const sameUnit = vocabOf(unitId)
      .map((v) => v.word)
      .filter((w) => w !== answer && !chosen.includes(w))
    shuffle(sameUnit)
    for (const w of sameUnit) {
      if (chosen.length >= n) break
      chosen.push(w)
    }
    if (chosen.length < n) {
      const rest = kb.whitelist.filter((w) => w !== answer && !chosen.includes(w))
      shuffle(rest)
      for (const w of rest) {
        if (chosen.length >= n) break
        chosen.push(w)
      }
    }
  } else {
    const others = sentOf(unitId)
      .map((s) => s.pattern_en)
      .filter((p) => p !== answer && !chosen.includes(p))
    shuffle(others)
    chosen.push(...others.slice(0, n))
  }
  return chosen.slice(0, n)
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ---------- 校验器 R1~R8 ----------
function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 9
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(dp[j], dp[j - 1], prev)
      prev = dp[j]
      dp[j] = cur
    }
  }
  return dp[b.length]
}

export function validate(question, kp, templateId, unitId) {
  const kb = resolveKb(unitId)
  const report = []
  const ans = question.answer
  const opts = question.options
  const distractors = opts.filter((o) => o !== ans)
  const expected = kp.word || kp.pattern_en

  // R1 答案一致性
  const r1 = ans === expected
  report.push({ rule: 'R1', ok: r1, detail: r1 ? `答案=${expected}` : `答案 ${ans} ≠ 知识库 ${expected}` })

  // R2 干扰项约束
  const r2 = distractors.length >= 2 && !distractors.includes(ans) && new Set(opts).size === opts.length
  report.push({ rule: 'R2', ok: r2, detail: r2 ? `干扰项${distractors.length}个且无重复` : '干扰项不足或重复' })

  // R3 超纲检测：词汇题查白名单，句子题查全册句型集
  const sentencePool = kb.sentences.map((s) => s.pattern_en)
  const legal = kp.word ? kb.whitelist : sentencePool
  const bad = opts.filter((o) => o !== expected && !legal.includes(o))
  const r3 = bad.length === 0
  report.push({ rule: 'R3', ok: r3, detail: r3 ? '选项均在合法集合' : `超纲项：${bad.join(',')}` })

  // R4 近形易混（一年级禁用）
  const near = distractors.filter((d) => kp.word && levenshtein(d.toLowerCase(), ans.toLowerCase()) <= 1 && d[0].toLowerCase() === ans[0].toLowerCase())
  const r4 = near.length === 0
  report.push({ rule: 'R4', ok: r4, detail: r4 ? '无近形干扰' : `近形干扰：${near.join(',')}` })

  // R5 题型匹配
  const isSentenceTpl = templateId === 'context_pick_sentence'
  const kpType = kp.word ? 'vocabulary' : 'sentence'
  const r5 = (isSentenceTpl ? 'sentence' : 'vocabulary') === kpType
  report.push({ rule: 'R5', ok: r5, detail: '题型与知识点类型匹配' })

  // R6 资源存在性（MVP：音频名指向 .mp3 文件即可）
  const ak = kp.audio_key || ''
  const r6 = !kp.word || (ak && ak.endsWith('.mp3'))
  report.push({ rule: 'R6', ok: r6, detail: r6 ? '资源字段完整' : `音频字段异常：${ak}` })

  // R7 难度一致性
  const r7 = question.difficulty === (kp.difficulty || 1)
  report.push({ rule: 'R7', ok: r7, detail: r7 ? '难度一致' : '难度不一致' })

  // R8 版权过滤（题干不得复制教材例句原文）
  const ex = kp.example_en || ''
  const r8 = !ex || question.stem.trim().toLowerCase() !== ex.trim().toLowerCase()
  report.push({ rule: 'R8', ok: r8, detail: r8 ? '题干为模板生成' : '题干疑似复制例句' })

  return { passed: report.every((r) => r.ok), report }
}

// ---------- 出题 ----------
export function generateQuestion(unitId, templateId, index) {
  const tpl = TEMPLATES[templateId]
  if (!tpl) return null
  const isSentence = templateId === 'context_pick_sentence'
  const pool = isSentence ? sentOf(unitId) : vocabOf(unitId)
  if (pool.length === 0) return null
  const kp = pool[index % pool.length]
  const answer = kp.word || kp.pattern_en
  const ds = pickDistractors(kp, isSentence, unitId, 3)
  const options = shuffle([...ds, answer])
  const stem = tpl.stem(kp)
  const question = {
    templateId,
    kp_id: kp.kp_id,
    unit: unitId,
    lesson: kp.lesson || '',
    stem,
    hint: tpl.hint ? tpl.hint(kp) : '',
    options,
    answer,
    difficulty: kp.difficulty || 1,
    audioKey: kp.audio_key || '',
  }
  const { passed, report } = validate(question, kp, templateId, unitId)
  question.passed = passed
  question.report = report
  return question
}

// 批量出题：保证通过校验；生成失败重试（≤2 次），仍失败跳过
export function makeQuiz(unitId, templateIds, count) {
  const questions = []
  let guard = 0
  while (questions.length < count && guard < count * 4) {
    guard++
    const tpl = templateIds[Math.floor(Math.random() * templateIds.length)]
    const q = generateQuestion(unitId, tpl, questions.length)
    if (q && q.passed) questions.push(q)
  }
  return questions
}
