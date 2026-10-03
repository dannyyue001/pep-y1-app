import { useState } from 'react'
import TopNav from './components/TopNav.jsx'
import HomeView from './components/HomeView.jsx'
import QuizView from './components/QuizView.jsx'
import ResultView from './components/ResultView.jsx'
import GamesView from './components/GamesView.jsx'
import GameDetailView from './components/GameDetailView.jsx'
import MemoryStackView from './components/MemoryStackView.jsx'
import MineView from './components/MineView.jsx'
import WorksheetView from './components/WorksheetView.jsx'
import AccumulationBookView from './components/AccumulationBookView.jsx'
import NavBar from './components/NavBar.jsx'
import { getUnits } from './engine/questionEngine.js'

// 由 教材版本/年级/学期/单元 映射到出题引擎单元 id
function resolveUnitId(textbook, grade, semester, unit) {
  if (textbook === 'pep') {
    if (grade === 1 && semester === '上') return `pep_y1_u${unit}`
    return null
  }
  if (textbook === 'nce1') return `nce1_u${unit}`
  if (textbook === 'shsb') return `shsb_u${unit}`
  return null
}

export default function App() {
  const [textbook, setTextbook] = useState('pep')
  const [grade, setGrade] = useState(1)
  const [semester, setSemester] = useState('上')
  const [unit, setUnit] = useState(1)
  const [tab, setTab] = useState('home')      // home | games | memory | mine（带导航栏的页）
  const [view, setView] = useState('home')    // home | quiz | result | game | worksheet（全屏页）
  const [config, setConfig] = useState(null)
  const [answers, setAnswers] = useState([])
  const [gameId, setGameId] = useState(null)

  const units = getUnits(textbook)
  const unitId = resolveUnitId(textbook, grade, semester, unit)
  const unitInfo = units.find((u) => u.id === unitId) || null

  const startQuiz = (cfg) => {
    setConfig(cfg)
    setAnswers([])
    setView('quiz')
  }

  const finishQuiz = (ans) => {
    setAnswers(ans)
    setView('result')
  }

  const goHome = () => {
    setTab('home')
    setView('home')
  }

  const changeTab = (t) => {
    setTab(t)
    setView('home')
  }

  const changeRange = (tb, g, s, u) => {
    setTextbook(tb)
    setGrade(g)
    setSemester(s)
    setUnit(u)
  }

  // 全屏页（练习/结果/游戏详情/练习卷）：不显示顶部导航与底部导航
  if (view === 'quiz' && config) {
    return <QuizView config={config} onFinish={finishQuiz} onQuit={goHome} />
  }
  if (view === 'result') {
    return <ResultView answers={answers} config={config} onRestart={goHome} />
  }
  if (view === 'game') {
    return <GameDetailView gameId={gameId} onBack={() => { setView('home'); setTab('games') }} />
  }
  if (view === 'worksheet' && unitId) {
    return (
      <WorksheetView
        unitId={unitId}
        unitLabel={`${textbook === 'pep' ? `${grade === 1 ? '一年级' : '二年级'}第${semester}学期` : units.find((u) => u.id === unitId)?.name_en || textbook} U${unit} ${unitInfo?.name_en || ''}`}
        onQuit={goHome}
      />
    )
  }

  // 带导航栏的页
  let page
  if (tab === 'games') {
    page = <GamesView onOpen={(id) => { setGameId(id); setView('game') }} />
  } else if (tab === 'memory') {
    page = <MemoryStackView textbook={textbook} />
  } else if (tab === 'book') {
    page = <AccumulationBookView />
  } else if (tab === 'mine') {
    page = <MineView />
  } else {
    page = (
      <HomeView
        textbook={textbook}
        grade={grade}
        semester={semester}
        unit={unit}
        unitInfo={unitInfo}
        onStart={startQuiz}
        onWorksheet={() => setView('worksheet')}
      />
    )
  }

  return (
    <div className="app-shell">
      <TopNav textbook={textbook} grade={grade} semester={semester} unit={unit} onChange={changeRange} />
      <div className="app-content">{page}</div>
      <NavBar tab={tab} onChange={changeTab} />
    </div>
  )
}
