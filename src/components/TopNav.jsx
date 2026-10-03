// TopNav.jsx — 顶部导航栏：教材版本 → 年级 → 学期 → 单元 级联下拉
import { GRADES, getSemesters, getUnits as getMemUnits } from '../data/memoryStack.js'
import { getUnits as getEngineUnits } from '../engine/questionEngine.js'

export const BOOK_OPTIONS = [
  { value: 'pep', label: '人教PEP' },
  { value: 'nce1', label: '新概念一' },
  { value: 'shsb', label: '沪教版' },
]

// 单元选项：pep 走 年级/学期/单元 级联；nce1/shsb 直接取教材单元
function unitOptions(textbook, grade, semester) {
  if (textbook === 'pep') return getMemUnits(grade, semester)
  return getEngineUnits(textbook).map((u) => ({ value: Number(u.id.replace(/^\D+/, '') || 1), label: `U${u.unit_no || ''} ${u.name_en}` }))
}

export default function TopNav({ textbook, grade, semester, unit, onChange }) {
  const isPep = textbook === 'pep'
  const semesters = isPep ? getSemesters(grade) : []
  const units = unitOptions(textbook, grade, semester)

  const changeBook = (b) => {
    if (b === 'pep') {
      const sems = getSemesters(1)
      const us = getMemUnits(1, sems[0].value)
      onChange(b, 1, sems[0].value, us[0].value)
    } else {
      onChange(b, 1, '上', 1)
    }
  }
  const changeGrade = (g) => {
    const sems = getSemesters(g)
    const us = getMemUnits(g, sems[0].value)
    onChange(textbook, g, sems[0].value, us[0].value)
  }
  const changeSemester = (s) => {
    const us = getMemUnits(grade, s)
    onChange(textbook, grade, s, us[0].value)
  }
  const changeUnit = (u) => onChange(textbook, grade, semester, u)

  return (
    <header className="topnav">
      <div className="topnav-brand">📘 英语练一练</div>
      <div className="topnav-pickers">
        <select value={textbook} onChange={(e) => changeBook(e.target.value)} aria-label="教材版本">
          {BOOK_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        {isPep && (
          <select value={grade} onChange={(e) => changeGrade(Number(e.target.value))} aria-label="年级">
            {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        )}
        {isPep && (
          <select value={semester} onChange={(e) => changeSemester(e.target.value)} aria-label="学期">
            {semesters.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        <select value={unit} onChange={(e) => changeUnit(Number(e.target.value))} aria-label="单元">
          {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>
    </header>
  )
}
