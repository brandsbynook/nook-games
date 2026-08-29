import { useState, useEffect, useCallback } from 'react'
import { Icon } from '../icons.jsx'
import { playTap, playChime } from '../utils/audio.js'

// ── Puzzle helpers ───────────────────────────────────────────────────────────

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

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

/** Row of the blank tile from the bottom (1-indexed) */
function blankRowFromBottom(tiles) {
  const blankIdx = tiles.indexOf(0)
  return 4 - Math.floor(blankIdx / 4)
}

/** Returns true if the puzzle state is solvable */
function isSolvable(tiles) {
  const inv = countInversions(tiles)
  const bRow = blankRowFromBottom(tiles)
  // 4×4: solvable iff (inversions even AND blank on odd row from bottom)
  //                 OR (inversions odd  AND blank on even row from bottom)
  return (inv % 2 === 0 && bRow % 2 === 1) || (inv % 2 === 1 && bRow % 2 === 0)
}

/** Fisher-Yates shuffle guaranteed to produce a solvable state */
function generateSolvable() {
  const tiles = [...GOAL]
  // Shuffle until solvable and not already solved
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
  } while (!isSolvable(tiles) || tiles.join(',') === GOAL.join(','))
  return tiles
}

/** Returns the index of the blank tile (0) */
function blankIndex(tiles) {
  return tiles.indexOf(0)
}

/** Returns true if tile at `idx` is adjacent to the blank */
function isAdjacentToBlank(idx, blankIdx) {
  const row = Math.floor(idx / 4)
  const col = idx % 4
  const bRow = Math.floor(blankIdx / 4)
  const bCol = blankIdx % 4
  return (
    (Math.abs(row - bRow) === 1 && col === bCol) ||
    (Math.abs(col - bCol) === 1 && row === bRow)
  )
}

/** Check if current state matches goal */
function isSolved(tiles) {
  return tiles.every((t, i) => t === GOAL[i])
}

// ── Component ────────────────────────────────────────────────────────────────

export function FifteenPuzzleScreen() {
  const [tiles, setTiles] = useState(() => generateSolvable())
  const [solved, setSolved] = useState(false)
  const [showToast, setShowToast] = useState(false)
  // Track which tile index was last moved for slide animation
  const [lastMoved, setLastMoved] = useState(null)

  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/briefing/15-puzzle'
  }

  function handleTap(idx) {
    if (solved) return
    const blank = blankIndex(tiles)
    if (!isAdjacentToBlank(idx, blank)) return

    playTap()
    setLastMoved(idx)

    const next = [...tiles]
    next[blank] = next[idx]
    next[idx] = 0
    setTiles(next)

    if (isSolved(next)) {
      setSolved(true)
      setTimeout(() => {
        playChime()
        setShowToast(true)
      }, 200)
    }
  }

  const handleShuffle = useCallback(() => {
    playTap()
    setTiles(generateSolvable())
    setSolved(false)
    setShowToast(false)
    setLastMoved(null)
  }, [])

  // Dismiss toast after 3.5 s
  useEffect(() => {
    if (!showToast) return
    const id = setTimeout(() => setShowToast(false), 3500)
    return () => clearTimeout(id)
  }, [showToast])

  const blank = blankIndex(tiles)

  return (
    <div className="fp-page">
      {/* Header */}
      <div className="fp-header">
        <button
          id="fp-back-btn"
          className="fp-back-btn"
          onClick={handleBack}
          aria-label="Back to briefing"
        >
          <Icon name="back" size={20} />
        </button>
        <div className="fp-header-center">
          <span className="fp-header-title">15 Puzzle</span>
        </div>
        <button
          id="fp-shuffle-btn"
          className="fp-shuffle-btn"
          onClick={handleShuffle}
          aria-label="Shuffle puzzle"
          title="New game"
        >
          ↻
        </button>
      </div>

      {/* Grid */}
      <div className="fp-grid-wrap">
        <div
          className="fp-grid"
          role="grid"
          aria-label="15 Puzzle grid"
        >
          {tiles.map((tile, idx) => {
            const isBlank = tile === 0
            const isMovable = !isBlank && isAdjacentToBlank(idx, blank)
            return (
              <button
                key={`cell-${idx}`}
                className={`fp-tile${isBlank ? ' fp-tile--blank' : ''}${isMovable ? ' fp-tile--movable' : ''}${lastMoved === idx ? ' fp-tile--just-moved' : ''}`}
                onClick={() => handleTap(idx)}
                aria-label={isBlank ? 'Empty space' : `Tile ${tile}`}
                disabled={isBlank || solved}
                tabIndex={isMovable ? 0 : -1}
              >
                {isBlank ? null : tile}
              </button>
            )
          })}
        </div>
      </div>

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
