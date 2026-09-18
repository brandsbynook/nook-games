import { useState, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import {
  DIFFICULTY_PRESETS,
  generateSolvableGrid,
  toggleCell,
  isAllOff,
  countActiveLights,
} from '../utils/lightsOutLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function LightsOutScreen({ onBack }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [grid, setGrid] = useState(() => generateSolvableGrid(5).grid)
  const [initialGrid, setInitialGrid] = useState(grid)
  const [moveCount, setMoveCount] = useState(0)
  const [isSolved, setIsSolved] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Start new puzzle on difficulty change
  const startNewPuzzle = useCallback((diffKey) => {
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === diffKey) || DIFFICULTY_PRESETS[1]
    const { grid: newGrid } = generateSolvableGrid(preset.moves)
    setGrid(newGrid)
    setInitialGrid(newGrid)
    setMoveCount(0)
    setIsSolved(false)
    setShowToast(false)
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
    setMoveCount(0)
    setIsSolved(false)
    setShowToast(false)
  }

  // Handle new random puzzle in same difficulty
  function handleNewGame() {
    playTap()
    startNewPuzzle(difficulty)
  }

  // Cell click handler
  function handleCellClick(row, col) {
    if (isSolved) return

    playTap()
    const nextGrid = toggleCell(grid, row, col)
    setGrid(nextGrid)
    setMoveCount((prev) => prev + 1)

    // Check if all lights are off
    if (isAllOff(nextGrid)) {
      setIsSolved(true)
      setTimeout(() => {
        playChime()
        setShowToast(true)
      }, 300)
    }
  }

  const activeLights = countActiveLights(grid)

  return (
    <div className="lo-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="lo-top-bar">
        <button
          id="lo-back-btn"
          className="lo-back-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="lo-header-center">
          <h1 className="lo-title">Lights Out</h1>
          <div className="lo-presets-bar">
            {DIFFICULTY_PRESETS.map((p) => (
              <button
                key={p.id}
                className={`lo-preset-btn${p.id === difficulty ? ' lo-preset-btn--active' : ''}`}
                onClick={() => handleDifficultyChange(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          id="lo-restart-btn"
          className="lo-restart-btn"
          onClick={handleRestart}
          aria-label="Restart Puzzle"
          title="Restart"
        >
          <Icon name="restart" size={18} />
        </button>
      </div>

      {/* ── Status & Info Header ─────────────────────────────── */}
      <div className="lo-status-card">
        <div className="lo-stat-pills">
          <div className="lo-pill">
            <span className="lo-pill-label">Lights On</span>
            <span className="lo-pill-val">{activeLights}</span>
          </div>
          <div className="lo-pill">
            <span className="lo-pill-label">Moves</span>
            <span className="lo-pill-val">{moveCount}</span>
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
          {grid.map((rowArr, r) => (
            <div key={`row-${r}`} className="lo-row" role="row">
              {rowArr.map((isOn, c) => (
                <button
                  key={`cell-${r}-${c}`}
                  className={`lo-cell${isOn ? ' lo-cell--on' : ' lo-cell--off'}${
                    isSolved ? ' lo-cell--solved' : ''
                  }`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={isSolved}
                  aria-label={`Row ${r + 1}, Column ${c + 1}: ${isOn ? 'Light On' : 'Light Off'}`}
                >
                  <span className="lo-cell-inner" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="lo-footer">
        {isSolved ? (
          <button className="lo-next-btn" onClick={handleNewGame}>
            New Puzzle
          </button>
        ) : (
          <span className="lo-footer-quote">
            Turn all lights completely off to restore dark tranquility.
          </span>
        )}
      </div>

      {/* ── Completion Toast ─────────────────────────────────── */}
      <div
        className={`lo-toast${showToast ? ' lo-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Silence restored to the grid.
      </div>
    </div>
  )
}

export default LightsOutScreen
