import { useState, useCallback } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import { playTap, playChime } from '../utils/audio.js'

// ── Puzzle helpers for dynamic N×N grids ────────────────────────────────────

function getGoal(size) {
  const arr = []
  for (let i = 1; i < size * size; i++) arr.push(i)
  arr.push(0)
  return arr
}

/** Check if current state matches goal */
function checkIsSolved(tiles, size) {
  const goal = getGoal(size)
  return tiles.every((t, i) => t === goal[i])
}

/** Deterministic random walk generator guaranteed to produce a solvable state without freezing */
function generateSolvable(size) {
  const goal = getGoal(size)
  const tiles = [...goal]
  let blank = tiles.length - 1
  let lastMove = -1

  // Number of valid slides to thoroughly randomize the board
  const stepCount = size === 3 ? 60 : size === 5 ? 140 : 100

  for (let step = 0; step < stepCount; step++) {
    const row = Math.floor(blank / size)
    const col = blank % size
    const neighbors = []

    if (row > 0) neighbors.push(blank - size)
    if (row < size - 1) neighbors.push(blank + size)
    if (col > 0) neighbors.push(blank - 1)
    if (col < size - 1) neighbors.push(blank + 1)

    // Avoid immediate oscillation back to previous square
    const validMoves = neighbors.filter((pos) => pos !== lastMove)
    const target =
      validMoves.length > 0
        ? validMoves[Math.floor(Math.random() * validMoves.length)]
        : neighbors[Math.floor(Math.random() * neighbors.length)]

    tiles[blank] = tiles[target]
    tiles[target] = 0
    lastMove = blank
    blank = target
  }

  // Edge case: if randomly returned to exact solved state, make one more adjacent swap
  if (checkIsSolved(tiles, size)) {
    const swapTarget = blank === 0 ? 1 : 0
    tiles[blank] = tiles[swapTarget]
    tiles[swapTarget] = 0
  }

  return tiles
}

/** Returns the index of the blank tile (0) */
function blankIndex(tiles) {
  return tiles.indexOf(0)
}

/** Returns true if tile at `idx` is adjacent to the blank */
function isAdjacentToBlank(idx, blankIdx, size) {
  const row = Math.floor(idx / size)
  const col = idx % size
  const bRow = Math.floor(blankIdx / size)
  const bCol = blankIdx % size
  return (
    (Math.abs(row - bRow) === 1 && col === bCol) ||
    (Math.abs(col - bCol) === 1 && row === bRow)
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function FifteenPuzzleScreen() {
  const [difficulty, setDifficulty] = useState('standard')
  const size = difficulty === 'gentle' ? 3 : difficulty === 'deep' ? 5 : 4

  const [history, setHistory] = useState(() => [generateSolvable(4)])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [solved, setSolved] = useState(false)
  const [lastMoved, setLastMoved] = useState(null)

  const isInspecting = historyIndex < history.length - 1
  const currentTiles = history[history.length - 1]
  const displayedTiles = history[historyIndex] || currentTiles

  function handleBack(e) {
    e?.preventDefault?.()
    playTap()
    window.location.hash = '/briefing/15-puzzle'
  }

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff)
    const newSize = diff === 'gentle' ? 3 : diff === 'deep' ? 5 : 4
    const newTiles = generateSolvable(newSize)
    setHistory([newTiles])
    setHistoryIndex(0)
    setSolved(false)
    setLastMoved(null)
  }

  function handleTap(idx) {
    if (solved || isInspecting) return
    const blank = blankIndex(currentTiles)
    if (!isAdjacentToBlank(idx, blank, size)) return

    playTap()
    setLastMoved(idx)

    const next = [...currentTiles]
    next[blank] = next[idx]
    next[idx] = 0
    setHistory((prev) => [...prev, next])
    setHistoryIndex((prev) => prev + 1)

    if (checkIsSolved(next, size)) {
      setSolved(true)
      setTimeout(() => {
        playChime()
      }, 200)
    }
  }

  const handleShuffle = useCallback(() => {
    playTap()
    const newTiles = generateSolvable(size)
    setHistory([newTiles])
    setHistoryIndex(0)
    setSolved(false)
    setLastMoved(null)
  }, [size])

  const blank = blankIndex(displayedTiles)

  const tierNames = {
    gentle: 'Gentle (3×3)',
    standard: 'Standard (4×4)',
    deep: 'Deep (5×5)',
  }

  return (
    <div className="fp-page game-screen-container">
      {/* Top Header */}
      <GameHeader title="15 Puzzle" onBack={handleBack} />

      {/* Difficulty Tabs */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleDifficultyChange}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: '3×3' },
          { id: 'standard', label: 'Standard', subtitle: '4×4' },
          { id: 'deep', label: 'Deep', subtitle: '5×5' },
        ]}
      />

      {/* Grid */}
      <div className="fp-grid-wrap">
        <div
          className="fp-grid"
          role="grid"
          aria-label={`${size}x${size} Sliding Puzzle grid`}
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
          }}
        >
          {displayedTiles.map((tile, idx) => {
            const isBlank = tile === 0
            const isMovable = !isBlank && isAdjacentToBlank(idx, blank, size)
            return (
              <button
                key={`cell-${idx}`}
                className={`fp-tile${isBlank ? ' fp-tile--blank' : ''}${isMovable ? ' fp-tile--movable' : ''}${lastMoved === idx ? ' fp-tile--just-moved' : ''}`}
                onClick={() => handleTap(idx)}
                aria-label={isBlank ? 'Empty space' : `Tile ${tile}`}
                disabled={isBlank || solved || isInspecting}
                tabIndex={isMovable ? 0 : -1}
                style={{
                  fontSize: size === 5 ? '15px' : size === 4 ? '18px' : '22px',
                }}
              >
                {isBlank ? null : tile}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Controls & History Stepper */}
      <GameFooterActions
        onReset={handleShuffle}
        resetLabel="Shuffle"
        onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
        onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
        canStepBack={historyIndex > 0}
        canStepForward={historyIndex < history.length - 1}
        stepIndicator={history.length > 1 ? `Move ${historyIndex}/${history.length - 1}` : null}
        isInspecting={isInspecting}
        onExitInspection={() => setHistoryIndex(history.length - 1)}
      />

      {/* Universal Completion Modal */}
      <GameCompletionModal
        isOpen={solved}
        title="Ordered with Patience"
        description="All numbered tiles have slid into sequential harmony."
        icon="✓"
        stats={[
          { label: 'Grid Size', value: `${size}×${size}` },
          { label: 'Tier', value: tierNames[difficulty] || difficulty },
          { label: 'Moves', value: `${history.length - 1}` },
        ]}
        onNext={handleShuffle}
        nextLabel="New Shuffle"
        reviewLabel="Review Grid"
      />
    </div>
  )
}

export default FifteenPuzzleScreen
