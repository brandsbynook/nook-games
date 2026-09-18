import { useState, useEffect, useCallback } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { playTap, playChime } from '../utils/audio.js'

// ── Puzzle helpers for dynamic N×N grids ────────────────────────────────────

function getGoal(size) {
  const arr = []
  for (let i = 1; i < size * size; i++) arr.push(i)
  arr.push(0)
  return arr
}

/** Count inversions among non-zero tiles */
function countInversions(tiles) {
  let inversions = 0
  const flat = tiles.filter((t) => t !== 0)
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++
    }
  }
  return inversions
}

/** Returns true if the puzzle state is solvable for given grid size */
function isSolvable(tiles, size) {
  const inv = countInversions(tiles)
  if (size % 2 === 1) {
    // Odd dimensions (3×3, 5×5): solvable iff number of inversions is even
    return inv % 2 === 0
  }
  // Even dimensions (4×4): solvable iff inversion parity matches blank row from bottom
  const blankIdx = tiles.indexOf(0)
  const bRow = size - Math.floor(blankIdx / size)
  return (inv % 2 === 0 && bRow % 2 === 1) || (inv % 2 === 1 && bRow % 2 === 0)
}

/** Fisher-Yates shuffle guaranteed to produce a solvable state */
function generateSolvable(size) {
  const goal = getGoal(size)
  const tiles = [...goal]
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
  } while (!isSolvable(tiles, size) || tiles.join(',') === goal.join(','))
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

/** Check if current state matches goal */
function checkIsSolved(tiles, size) {
  const goal = getGoal(size)
  return tiles.every((t, i) => t === goal[i])
}

// ── Component ────────────────────────────────────────────────────────────────

export function FifteenPuzzleScreen() {
  const [difficulty, setDifficulty] = useState('standard')
  const size = difficulty === 'gentle' ? 3 : difficulty === 'deep' ? 5 : 4

  const [tiles, setTiles] = useState(() => generateSolvable(4))
  const [solved, setSolved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [lastMoved, setLastMoved] = useState(null)

  function handleBack(e) {
    e?.preventDefault?.()
    playTap()
    window.location.hash = '/briefing/15-puzzle'
  }

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff)
    const newSize = diff === 'gentle' ? 3 : diff === 'deep' ? 5 : 4
    setTiles(generateSolvable(newSize))
    setSolved(false)
    setShowToast(false)
    setLastMoved(null)
  }

  function handleTap(idx) {
    if (solved) return
    const blank = blankIndex(tiles)
    if (!isAdjacentToBlank(idx, blank, size)) return

    playTap()
    setLastMoved(idx)

    const next = [...tiles]
    next[blank] = next[idx]
    next[idx] = 0
    setTiles(next)

    if (checkIsSolved(next, size)) {
      setSolved(true)
      setTimeout(() => {
        playChime()
        setShowToast(true)
      }, 200)
    }
  }

  const handleShuffle = useCallback(() => {
    playTap()
    setTiles(generateSolvable(size))
    setSolved(false)
    setShowToast(false)
    setLastMoved(null)
  }, [size])

  // Dismiss toast after 3.5 s
  useEffect(() => {
    if (!showToast) return
    const id = setTimeout(() => setShowToast(false), 3500)
    return () => clearTimeout(id)
  }, [showToast])

  const blank = blankIndex(tiles)

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
          {tiles.map((tile, idx) => {
            const isBlank = tile === 0
            const isMovable = !isBlank && isAdjacentToBlank(idx, blank, size)
            return (
              <button
                key={`cell-${idx}`}
                className={`fp-tile${isBlank ? ' fp-tile--blank' : ''}${isMovable ? ' fp-tile--movable' : ''}${lastMoved === idx ? ' fp-tile--just-moved' : ''}`}
                onClick={() => handleTap(idx)}
                aria-label={isBlank ? 'Empty space' : `Tile ${tile}`}
                disabled={isBlank || solved}
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

      {/* Footer Controls */}
      <GameFooterActions
        onReset={handleShuffle}
        onNewGame={handleShuffle}
        resetLabel="Shuffle"
        newGameLabel="New Game"
      />

      {/* Completion toast */}
      <div
        className={`fp-toast${showToast ? ' fp-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        Ordered with patience.
      </div>
    </div>
  )
}
