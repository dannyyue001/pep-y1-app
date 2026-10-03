// memoryStack.js — 记忆栈总模块（年级 → 学期 → 单元 → 单词）
import { Y1 } from './memoryStack_y1.js'
import { Y2 } from './memoryStack_y2.js'

export const MEMORY_STACK = [...Y1, ...Y2]

export const GRADES = [
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
]

export function getSemesters(grade) {
  const set = [...new Set(MEMORY_STACK.filter((u) => u.grade === grade).map((u) => u.semester))]
  return set.map((s) => ({ value: s, label: `第${s}学期` }))
}

export function getUnits(grade, semester) {
  return MEMORY_STACK.filter((u) => u.grade === grade && u.semester === semester).map((u) => ({
    value: u.unit,
    label: `U${u.unit} ${u.unitName}`,
    unit: u,
  }))
}

export function getUnitWords(grade, semester, unit) {
  const u = MEMORY_STACK.find((x) => x.grade === grade && x.semester === semester && x.unit === unit)
  return u || null
}

export function totalWords() {
  return MEMORY_STACK.reduce((n, u) => n + u.words.length, 0)
}
