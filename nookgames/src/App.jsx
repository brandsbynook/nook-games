import { useEffect, useRef, useState } from 'react'
import { AppShell } from './components/AppShell.jsx'
import { getCollection, getGame } from './data/catalogue.js'
import { BriefingScreen } from './screens/BriefingScreen.jsx'
import { CollectionScreen } from './screens/CollectionScreen.jsx'
import { EditorPickScreen } from './screens/EditorPickScreen.jsx'
import { FifteenPuzzleScreen } from './screens/FifteenPuzzleScreen.jsx'
import { SudokuScreen } from './screens/SudokuScreen.jsx'
import { WordLadderScreen } from './screens/WordLadderScreen.jsx'
import { ReversiScreen } from './screens/ReversiScreen.jsx'
import { LightsOutScreen } from './screens/LightsOutScreen.jsx'
import { TowerOfHanoiScreen } from './screens/TowerOfHanoiScreen.jsx'
import { Game2048Screen } from './screens/Game2048Screen.jsx'
import UntangleScreen from './screens/UntangleScreen';
import MastermindScreen from './screens/MastermindScreen';
import NonogramScreen from './screens/NonogramScreen';
import AnagramsScreen from './screens/AnagramsScreen';
import CrosswordScreen from './screens/CrosswordScreen';
import OneLineScreen from './screens/OneLineScreen';
import ArrowPuzzleScreen from './screens/ArrowPuzzleScreen';
import { ChessScreen } from './screens/ChessScreen.jsx';
import { KnightsTourScreen } from './screens/KnightsTourScreen.jsx';
import { CheckersScreen } from './screens/CheckersScreen.jsx';
import { ShikakuScreen } from './screens/ShikakuScreen.jsx';
import { KakuroScreen } from './screens/KakuroScreen.jsx';
import { SlitherlinkScreen } from './screens/SlitherlinkScreen.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx'
import { InfoScreen } from './screens/InfoScreen.jsx'
import { ProgressScreen } from './screens/ProgressScreen.jsx'
import { SettingsScreen } from './screens/SettingsScreen.jsx'
import {
  getStoredSettings,
  shouldShowFeedbackPrompt,
  markFeedbackResolved,
  markFeedbackDismissed,
} from './utils/storage.js'
import './App.css'

// ═══════════════════════════════════════════════════════════════════
// MINDFUL BREAK OVERLAY
// ═══════════════════════════════════════════════════════════════════

function MindfulBreakOverlay({ intervalMinutes, onResume }) {
  return (
    <div className="brk-backdrop" role="dialog" aria-modal="true" aria-label="Mindful break reminder">
      <div className="brk-card">
        {/* Resting eye glyph */}
        <div className="brk-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12C2 12 5.5 6 12 6s10 6 10 6-3.5 6-10 6S2 12 2 12z"
              stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            {/* Closed lid lines */}
            <path d="M7 16.5C8.5 18 10.2 18.5 12 18.5s3.5-.5 5-2"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>

        <h2 className="brk-title">Time to breathe</h2>
        <p className="brk-message">
          You've been playing for {intervalMinutes}{' '}
          {intervalMinutes === 1 ? 'minute' : 'minutes'}. Take a quiet breath
          or rest your eyes for a moment.
        </p>

        <button
          id="brk-resume-btn"
          className="brk-resume-btn"
          onClick={onResume}
          autoFocus
        >
          Resume
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DUAL-ROUTE FEEDBACK PROMPT
// ═══════════════════════════════════════════════════════════════════

function FeedbackPrompt({ onClose }) {
  function handlePositive() {
    markFeedbackResolved()
    // Open Play Store listing (replace with real URL when published)
    window.open('https://play.google.com/store/apps/details?id=app.nookgames', '_blank', 'noopener')
    onClose()
  }

  function handleNegative() {
    markFeedbackResolved()
    window.location.href = 'mailto:feedback@nookgames.app?subject=Nook%20Games%20Feedback'
    onClose()
  }

  function handleDismiss() {
    markFeedbackDismissed()
    onClose()
  }

  return (
    <div className="fbk-banner" role="dialog" aria-label="Feedback prompt">
      <p className="fbk-question">How is your experience with Nook so far?</p>
      <div className="fbk-actions">
        <button id="fbk-positive-btn" className="fbk-btn fbk-btn--positive" onClick={handlePositive}>
          Quiet &amp; Enjoyable
        </button>
        <button id="fbk-negative-btn" className="fbk-btn fbk-btn--negative" onClick={handleNegative}>
          Needs Work
        </button>
        <button id="fbk-dismiss-btn" className="fbk-btn fbk-btn--dismiss" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  )
}

function parseRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0] || ''
  const path = rawHash.replace(/^\/+/, '')
  const parts = path.split('/').filter(Boolean)

  if (parts.length === 0 || parts[0] === 'home') {
    return { name: 'home' }
  }

  if (parts[0] === 'progress') {
    return { name: 'progress' }
  }

  if (parts[0] === 'info') {
    return { name: 'info' }
  }

  if (parts[0] === 'settings') {
    return { name: 'settings' }
  }

  if (parts[0] === 'editors-pick') {
    return { name: 'editors-pick' }
  }

  if ((parts[0] === 'collection' || parts[0] === 'category') && parts[1]) {
    const rawId = String(parts[1]).toLowerCase()
    // Support legacy redirects
    if (rawId === 'spatial') {
      window.location.replace('#/collection/sequence')
      return { name: 'collection', id: 'sequence' }
    }
    if (rawId === 'words-reasoning' || rawId === 'word-reasoning') {
      window.location.replace('#/collection/words')
      return { name: 'collection', id: 'words' }
    }
    return { name: 'collection', id: rawId }
  }

  // Briefing screen sits between CollectionScreen and GameScreen
  if (parts[0] === 'briefing' && parts[1]) {
    return { name: 'briefing', id: parts[1] }
  }

  // Playable game routes
  if (parts[0] === 'play') {
    const gameId = String(parts[1] || '').toLowerCase()
    if (gameId === '15-puzzle') return { name: 'play-15-puzzle' }
    if (gameId === 'sudoku') return { name: 'play-sudoku' }
    if (gameId === 'word-ladder') return { name: 'play-word-ladder' }
    if (gameId === 'reversi') return { name: 'play-reversi' }
    if (gameId === 'lights-out') return { name: 'play-lights-out' }
    if (gameId === 'shikaku') return { name: 'play-shikaku' }
    if (gameId === 'kakuro') return { name: 'play-kakuro' }
    if (gameId === 'slitherlink') return { name: 'play-slitherlink' }
    if (gameId === 'tower-of-hanoi') return { name: 'play-tower-of-hanoi' }
    if (gameId === '2048') return { name: 'play-2048' }
    if (gameId === 'untangle') return { name: 'play-untangle' }
    if (gameId === 'mastermind') return { name: 'play-mastermind' }
    if (gameId === 'nonogram') return { name: 'play-nonogram' }
    if (gameId === 'anagrams') return { name: 'play-anagrams' }
    if (gameId === 'crossword') return { name: 'play-crossword' }
    if (gameId === 'one-line') return { name: 'play-one-line' }
    if (gameId === 'arrow-puzzle') return { name: 'play-arrow-puzzle' }
    if (gameId === 'chess') return { name: 'play-chess' }
    if (gameId === 'knights-tour' || gameId === 'knightstour') return { name: 'play-knights-tour' }
    if (gameId === 'checkers' || gameId === 'draughts') return { name: 'play-checkers' }
  }

  // Direct game route alias or fallback
  if (parts[0] === '2048' || (parts[0] === 'game' && String(parts[1]).toLowerCase() === '2048')) {
    return { name: 'play-2048' }
  }

  if (
    path === 'play/shikaku' ||
    parts[0] === 'shikaku' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'shikaku') ||
    parts[0] === 'play-shikaku'
  ) {
    return { name: 'play-shikaku' }
  }

  if (
    path === 'play/kakuro' ||
    parts[0] === 'kakuro' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'kakuro') ||
    parts[0] === 'play-kakuro'
  ) {
    return { name: 'play-kakuro' }
  }

  if (
    path === 'play/slitherlink' ||
    parts[0] === 'slitherlink' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'slitherlink') ||
    parts[0] === 'play-slitherlink'
  ) {
    return { name: 'play-slitherlink' }
  }

  if (
    path === 'play/checkers' ||
    parts[0] === 'checkers' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'checkers') ||
    parts[0] === 'play-checkers'
  ) {
    return { name: 'play-checkers' }
  }

  if (
    path === 'play/knights-tour' ||
    parts[0] === 'knights-tour' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'knights-tour') ||
    parts[0] === 'play-knights-tour'
  ) {
    return { name: 'play-knights-tour' }
  }

  if (
    path === 'play/chess' ||
    parts[0] === 'chess' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'chess') ||
    parts[0] === 'play-chess'
  ) {
    return { name: 'play-chess' }
  }

  if (
    path === 'play/untangle' ||
    parts[0] === 'untangle' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'untangle') ||
    parts[0] === 'play-untangle'
  ) {
    return { name: 'play-untangle' }
  }

  if (
    path === 'play/mastermind' ||
    parts[0] === 'mastermind' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'mastermind') ||
    parts[0] === 'play-mastermind'
  ) {
    return { name: 'play-mastermind' }
  }

  if (
    path === 'play/nonogram' ||
    parts[0] === 'nonogram' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'nonogram') ||
    parts[0] === 'play-nonogram'
  ) {
    return { name: 'play-nonogram' }
  }

  if (
    path === 'play/anagrams' ||
    parts[0] === 'anagrams' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'anagrams') ||
    parts[0] === 'play-anagrams'
  ) {
    return { name: 'play-anagrams' }
  }

  if (
    path === 'play/crossword' ||
    parts[0] === 'crossword' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'crossword') ||
    parts[0] === 'play-crossword'
  ) {
    return { name: 'play-crossword' }
  }

  if (
    path === 'play/one-line' ||
    parts[0] === 'one-line' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'one-line') ||
    parts[0] === 'play-one-line'
  ) {
    return { name: 'play-one-line' }
  }

  if (
    path === 'play/arrow-puzzle' ||
    parts[0] === 'arrow-puzzle' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'arrow-puzzle') ||
    parts[0] === 'play-arrow-puzzle'
  ) {
    return { name: 'play-arrow-puzzle' }
  }

  if (parts[0] === 'game' && parts[1]) {
    return { name: 'game', id: parts[1] }
  }

  return { name: 'home' }
}

function Screen({ route }) {
  const navigate = (path) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`
  }

  if (route.name === 'progress') {
    return <ProgressScreen />
  }

  if (route.name === 'info') {
    return <InfoScreen />
  }

  if (route.name === 'settings') {
    return <SettingsScreen />
  }

  if (route.name === 'play-untangle') {
    return <UntangleScreen onBack={() => navigate('briefing/untangle')} />
  }

  if (route.name === 'play-mastermind') {
    return <MastermindScreen onBack={() => navigate('briefing/mastermind')} />
  }

  if (route.name === 'play-nonogram') {
    return <NonogramScreen onBack={() => navigate('briefing/nonogram')} />
  }

  if (route.name === 'play-anagrams') {
    return <AnagramsScreen onBack={() => navigate('briefing/anagrams')} />
  }

  if (route.name === 'play-crossword') {
    return <CrosswordScreen onBack={() => navigate('briefing/crossword')} />
  }

  if (route.name === 'play-one-line') {
    return <OneLineScreen onBack={() => navigate('briefing/one-line')} />
  }

  if (route.name === 'play-arrow-puzzle') {
    return <ArrowPuzzleScreen onBack={() => navigate('briefing/arrow-puzzle')} />
  }

  if (route.name === 'play-shikaku') {
    return <ShikakuScreen onBack={() => navigate('briefing/shikaku')} />
  }

  if (route.name === 'play-kakuro') {
    return <KakuroScreen onBack={() => navigate('briefing/kakuro')} />
  }

  if (route.name === 'play-slitherlink') {
    return <SlitherlinkScreen onBack={() => navigate('briefing/slitherlink')} />
  }

  return <HomeScreen />
}

function App() {
  const [route, setRoute] = useState(parseRoute)

  // ── Mindful break state ──────────────────────────────────────────
  const [showBreak, setShowBreak] = useState(false)
  const elapsedRef = useRef(0) // minutes elapsed, tracked in memory only

  useEffect(() => {
    // Tick every 60 seconds
    const id = setInterval(() => {
      const { breakInterval } = getStoredSettings()
      if (!breakInterval || breakInterval <= 0) return
      elapsedRef.current += 1
      if (elapsedRef.current >= breakInterval) {
        setShowBreak(true)
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  function handleBreakResume() {
    setShowBreak(false)
    elapsedRef.current = 0
  }

  // ── Feedback prompt state ────────────────────────────────────────
  const [showFeedback, setShowFeedback] = useState(() => shouldShowFeedbackPrompt())

  const navigate = (path) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`
  }

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navActive =
    route.name === 'progress' ||
    route.name === 'info' ||
    route.name === 'settings'
      ? route.name
      : 'home'

  // Dedicated screen routes (render with their own calibrated headers & frames)
  if (route.name === 'briefing') {
    const match = getGame(route.id)
    if (match) {
      return <BriefingScreen game={match.game} collection={match.collection} />
    }
  }

  if (route.name === 'collection') {
    const collection = getCollection(route.id)
    if (collection) {
      return <CollectionScreen collection={collection} />
    }
  }

  if (route.name === 'editors-pick') {
    return <EditorPickScreen />
  }

  if (route.name === 'play-15-puzzle') {
    return <FifteenPuzzleScreen />
  }

  if (route.name === 'play-sudoku') {
    return <SudokuScreen />
  }

  if (route.name === 'play-word-ladder') {
    return <WordLadderScreen />
  }

  if (route.name === 'play-reversi') {
    return <ReversiScreen />
  }

  if (route.name === 'play-lights-out') {
    return <LightsOutScreen />
  }

  if (route.name === 'play-tower-of-hanoi') {
    return <TowerOfHanoiScreen />
  }

  if (route.name === 'play-2048') {
    return <Game2048Screen />
  }

  if (route.name === 'play-untangle') {
    return <UntangleScreen onBack={() => navigate('briefing/untangle')} />
  }

  if (route.name === 'play-mastermind') {
    return <MastermindScreen onBack={() => navigate('briefing/mastermind')} />
  }

  if (route.name === 'play-nonogram') {
    return <NonogramScreen onBack={() => navigate('briefing/nonogram')} />
  }

  if (route.name === 'play-anagrams') {
    return <AnagramsScreen onBack={() => navigate('briefing/anagrams')} />
  }

  if (route.name === 'play-crossword') {
    return <CrosswordScreen onBack={() => navigate('briefing/crossword')} />
  }

  if (route.name === 'play-one-line') {
    return <OneLineScreen onBack={() => navigate('briefing/one-line')} />
  }

  if (route.name === 'play-arrow-puzzle') {
    return <ArrowPuzzleScreen onBack={() => navigate('briefing/arrow-puzzle')} />
  }

  if (route.name === 'play-chess') {
    return <ChessScreen onBack={() => navigate('briefing/chess')} />
  }

  if (route.name === 'play-knights-tour') {
    return <KnightsTourScreen onBack={() => navigate('briefing/knights-tour')} />
  }

  if (route.name === 'play-checkers') {
    return <CheckersScreen onBack={() => navigate('briefing/checkers')} />
  }

  if (route.name === 'play-shikaku') {
    return <ShikakuScreen onBack={() => navigate('briefing/shikaku')} />
  }

  return (
    <>
      <AppShell navActive={navActive}>
        <Screen route={route} />
        {/* Feedback prompt — shown inside the scroll area above bottom nav */}
        {showFeedback && (
          <FeedbackPrompt onClose={() => setShowFeedback(false)} />
        )}
      </AppShell>

      {/* Mindful break overlay — rendered above everything */}
      {showBreak && (
        <MindfulBreakOverlay
          intervalMinutes={getStoredSettings().breakInterval}
          onResume={handleBreakResume}
        />
      )}
    </>
  )
}

export default App
