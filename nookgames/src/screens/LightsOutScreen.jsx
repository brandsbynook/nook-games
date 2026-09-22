import { useState, useCallback, useRef, useEffect } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import {
  DIFFICULTY_PRESETS,
  generateSolvableGrid,
  toggleCell,
  isAllOff,
  countActiveLights,
} from '../utils/lightsOutLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function LightsOutScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('standard')

  // Initial puzzle generator helper
  const createPuzzleState = (diffKey) => {
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === diffKey) || DIFFICULTY_PRESETS[1]
    const { grid: newGrid, solutionSteps } = generateSolvableGrid(preset.moves)
    return {
      grid: newGrid,
      solutionVector: solutionSteps,
    }
  }

  const [gameState, setGameState] = useState(() => createPuzzleState('standard'))
  const [initialState, setInitialState] = useState(gameState)
  const [history, setHistory] = useState(() => [gameState])
  const [isSolved, setIsSolved] = useState(false)
  const [hintedCoord, setHintedCoord] = useState(null)

  const hintTimeoutRef = useRef(null)

  const clearHint = useCallback(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
    setHintedCoord(null)
  }, [])

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  // Start new puzzle on difficulty change or new game request
  const startNewPuzzle = useCallback((diffKey) => {
    clearHint()
    const newPuzzle = createPuzzleState(diffKey)
    setGameState(newPuzzle)
    setInitialState(newPuzzle)
    setHistory([newPuzzle])
    setIsSolved(false)
  }, [clearHint])

  // Handle difficulty switch
  function handleDifficultyChange(diffKey) {
    if (diffKey === difficulty) return
    playTap()
    setDifficulty(diffKey)
    startNewPuzzle(diffKey)
  }

  // Handle back navigation
  function handleBack(e) {
    if (e) e.preventDefault()
    playTap()
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = '/briefing/lights-out'
    }
  }

  // Handle restart (reset to initial state of current puzzle)
  function handleRestart() {
    playTap()
    clearHint()
    setGameState(initialState)
    setHistory([initialState])
    setIsSolved(false)
  }

  // Handle undo
  function handleUndo() {
    if (history.length <= 1 || isSolved) return
    playTap()
    clearHint()

    const nextHistory = history.slice(0, -1)
    const prevState = nextHistory[nextHistory.length - 1]
    setHistory(nextHistory)
    setGameState(prevState)
    setIsSolved(false)
  }

  // Handle hint
  function handleHint() {
    if (isSolved || !gameState.solutionVector.length) return
    playTap()
    clearHint()

    // Pick a coordinate from the remaining solution vector
    const randomIndex = Math.floor(Math.random() * gameState.solutionVector.length)
    const target = gameState.solutionVector[randomIndex]
    setHintedCoord(target)

    hintTimeoutRef.current = setTimeout(() => {
      setHintedCoord(null)
      hintTimeoutRef.current = null
    }, 2000)
  }

  // Cell click handler
  function handleCellClick(row, col) {
    if (isSolved) return

    playTap()
    clearHint()

    const key = `${row},${col}`
    const nextGrid = toggleCell(gameState.grid, row, col)

    // Update target solution vector
    const nextSolution = gameState.solutionVector.includes(key)
      ? gameState.solutionVector.filter((coord) => coord !== key)
      : [...gameState.solutionVector, key]

    const nextState = {
      grid: nextGrid,
      solutionVector: nextSolution,
    }

    setGameState(nextState)
    setHistory((prev) => [...prev, nextState])

    // Check if all lights are extinguished
    if (isAllOff(nextGrid)) {
      setIsSolved(true)
      setTimeout(() => {
        playChime()
      }, 300)
    }
  }

  const activeLights = countActiveLights(gameState.grid)
  const movesCount = history.length - 1

  const difficultyTiers = DIFFICULTY_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    subtitle: p.subtitle,
  }))

  const presetLabels = {
    gentle: 'Gentle',
    standard: 'Standard',
    deep: 'Deep',
  }

  return (
    <div className="lo-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Lights Out" onBack={handleBack} />

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(id) => handleDifficultyChange(id)}
        tiers={difficultyTiers}
      />

      {/* ── Status & Info Header ─────────────────────────────── */}
      <div className="lo-status-card">
        <div className="lo-stat-pills">
          <div className="lo-pill">
            <span className="lo-pill-label">Lights On</span>
            <span className="lo-pill-val">{activeLights}</span>
          </div>
          <div className="lo-pill">
            <span className="lo-pill-label">Moves</span>
            <span className="lo-pill-val">{movesCount}</span>
          </div>
        </div>
        <p className="lo-status-tagline">
          {isSolved
            ? 'Silence restored to the grid.'
            : 'Toggle tiles to extinguish all lights.'}
        </p>
      </div>

      {/* ── 5x5 Lights Out Board ─────────────────────────────── */}
      <div className="lo-board-wrap">
        <div className="lo-board" role="grid" aria-label="Lights Out 5x5 Grid">
          {gameState.grid.map((rowArr, r) => (
            <div key={`row-${r}`} className="lo-row" role="row">
              {rowArr.map((isOn, c) => {
                const cellKey = `${r},${c}`
                const isHinted = hintedCoord === cellKey
                return (
                  <button
                    key={`cell-${cellKey}`}
                    className={`lo-cell${isOn ? ' lo-cell--on' : ' lo-cell--off'}${
                      isHinted ? ' lo-cell--hinted' : ''
                    }${isSolved ? ' lo-cell--solved' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={isSolved}
                    aria-label={`Row ${r + 1}, Column ${c + 1}: ${isOn ? 'Light On' : 'Light Off'}`}
                  >
                    <span className="lo-cell-inner" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Controls ─────────────────────────────────── */}
      <div className="lo-footer-controls">
        <GameFooterActions
          onReset={handleRestart}
          resetLabel="Restart"
          onUndo={handleUndo}
          canUndo={movesCount > 0 && !isSolved}
          onHint={handleHint}
          canHint={!isSolved && gameState.solutionVector.length > 0}
        />
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={isSolved}
        title="Grid in Tranquility"
        description="Every light has been peacefully extinguished."
        icon="✓"
        stats={[
          { label: 'Difficulty', value: presetLabels[difficulty] || difficulty },
          { label: 'Moves Taken', value: `${movesCount}` },
        ]}
        onNext={() => startNewPuzzle(difficulty)}
        nextLabel="New Puzzle"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Grid"
      />
    </div>
  )
}

export default LightsOutScreen
