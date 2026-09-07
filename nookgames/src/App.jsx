import { useEffect, useState } from 'react'
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
import { HomeScreen } from './screens/HomeScreen.jsx'
import { InfoScreen } from './screens/InfoScreen.jsx'
import { ProgressScreen } from './screens/ProgressScreen.jsx'
import { SettingsScreen } from './screens/SettingsScreen.jsx'
import './App.css'

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
    return { name: 'collection', id: parts[1] }
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
    if (gameId === 'lights-out' || gameId === 'shikaku') return { name: 'play-lights-out' }
    if (gameId === 'tower-of-hanoi') return { name: 'play-tower-of-hanoi' }
    if (gameId === '2048') return { name: 'play-2048' }
    if (gameId === 'untangle') return { name: 'play-untangle' }
  }

  // Direct game route alias or fallback
  if (parts[0] === '2048' || (parts[0] === 'game' && String(parts[1]).toLowerCase() === '2048')) {
    return { name: 'play-2048' }
  }

  if (
    path === 'play/untangle' ||
    parts[0] === 'untangle' ||
    (parts[0] === 'game' && String(parts[1]).toLowerCase() === 'untangle') ||
    parts[0] === 'play-untangle'
  ) {
    return { name: 'play-untangle' }
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

  return <HomeScreen />
}

function App() {
  const [route, setRoute] = useState(parseRoute)

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

  return (
    <AppShell navActive={navActive}>
      <Screen route={route} />
    </AppShell>
  )
}

export default App
