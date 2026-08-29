import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell.jsx'
import { getCollection, getGame } from './data/catalogue.js'
import { BriefingScreen } from './screens/BriefingScreen.jsx'
import { CollectionScreen } from './screens/CollectionScreen.jsx'
import { EditorPickScreen } from './screens/EditorPickScreen.jsx'
import { FifteenPuzzleScreen } from './screens/FifteenPuzzleScreen.jsx'
import { SudokuScreen } from './screens/SudokuScreen.jsx'
import { HomeScreen } from './screens/HomeScreen.jsx'
import { InfoScreen } from './screens/InfoScreen.jsx'
import { ProgressScreen } from './screens/ProgressScreen.jsx'
import { SettingsScreen } from './screens/SettingsScreen.jsx'
import './App.css'

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  const parts = hash.split('/').filter(Boolean)

  if (parts.length === 0) {
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

  if (parts[0] === 'collection' && parts[1]) {
    return { name: 'collection', id: parts[1] }
  }

  // Briefing screen sits between CollectionScreen and GameScreen
  if (parts[0] === 'briefing' && parts[1]) {
    return { name: 'briefing', id: parts[1] }
  }

  // Playable game routes
  if (parts[0] === 'play' && parts[1] === '15-puzzle') {
    return { name: 'play-15-puzzle' }
  }

  if (parts[0] === 'play' && parts[1] === 'sudoku') {
    return { name: 'play-sudoku' }
  }

  if (parts[0] === 'game' && parts[1]) {
    return { name: 'game', id: parts[1] }
  }

  return { name: 'home' }
}

function Screen({ route }) {
  if (route.name === 'progress') {
    return <ProgressScreen />
  }

  if (route.name === 'info') {
    return <InfoScreen />
  }

  if (route.name === 'settings') {
    return <SettingsScreen />
  }

  return <HomeScreen />
}

function App() {
  const [route, setRoute] = useState(parseRoute)

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

  return (
    <AppShell navActive={navActive}>
      <Screen route={route} />
    </AppShell>
  )
}

export default App
