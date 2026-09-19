import { useState, useCallback } from 'react'
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
  const [grid, setGrid] = useState(() => {
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === 'standard') || DIFFICULTY_PRESETS[1]
    return generateSolvableGrid(preset.moves).grid
  })
  const [initialGrid, setInitialGrid] = useState(grid)
  const [history, setHistory] = useState(() => [grid])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSolved, setIsSolved] = useState(false)

  const isInspecting = historyIndex < history.length - 1
  const displayedGrid = history[historyIndex] || grid

  // Start new puzzle on difficulty change
  const startNewPuzzle = useCallback((diffKey) => {
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === diffKey) || DIFFICULTY_PRESETS[1]
    const { grid: newGrid } = generateSolvableGrid(preset.moves)
    setGrid(newGrid)
    setInitialGrid(newGrid)
    setHistory([newGrid])
    setHistoryIndex(0)
    setIsSolved(false)
  }, [])

  // Handle difficulty switch
  function handleDifficultyChange(diffKey) {
    if (diffKey === difficulty) return
    playTap()
    setDifficulty(diffKey)
    startNewPuzzle(diffKey)
  }

  // Handle back to Briefing
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
    setGrid(initialGrid)
    setHistory([initialGrid])
    setHistoryIndex(0)
    setIsSolved(false)
  }

  // Handle new random puzzle in same difficulty
  function handleNewGame() {
    playTap()
    startNewPuzzle(difficulty)
  }

  // Cell click handler
  function handleCellClick(row, col) {
    if (isSolved || isInspecting) return

    playTap()
    const nextGrid = toggleCell(grid, row, col)
    setGrid(nextGrid)
    setHistory((prev) => {
      const nextHist = [...prev.slice(0, historyIndex + 1), nextGrid]
      setHistoryIndex(nextHist.length - 1)
      return nextHist
    })

    // Check if all lights are off
    if (isAllOff(nextGrid)) {
      setIsSolved(true)
      setTimeout(() => {
        playChime()
      }, 300)
    }
  }

  const activeLights = countActiveLights(displayedGrid)

  const difficultyTiers = DIFFICULTY_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    subtitle: `${p.moves} moves`,
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
            <span className="lo-pill-val">{history.length - 1}</span>
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
          {displayedGrid.map((rowArr, r) => (
            <div key={`row-${r}`} className="lo-row" role="row">
              {rowArr.map((isOn, c) => (
                <button
                  key={`cell-${r}-${c}`}
                  className={`lo-cell${isOn ? ' lo-cell--on' : ' lo-cell--off'}${
                    isSolved ? ' lo-cell--solved' : ''
                  }`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={isSolved || isInspecting}
                  aria-label={`Row ${r + 1}, Column ${c + 1}: ${isOn ? 'Light On' : 'Light Off'}`}
                >
                  <span className="lo-cell-inner" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Actions & Stepper ─────────────────────────── */}
      <div className="lo-footer-controls">
        <GameFooterActions
          onReset={handleRestart}
          resetLabel="Restart"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
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
          { label: 'Moves Taken', value: `${history.length - 1}` },
        ]}
        onNext={handleNewGame}
        nextLabel="New Puzzle"
        onReplay={handleRestart}
        replayLabel="Replay"
        reviewLabel="Review Grid"
      />
    </div>
  )
}

export default LightsOutScreen
