import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../icons.jsx'
import {
  initGameGrid,
  moveGrid,
  spawnRandomTile,
  hasValidMoves,
  hasReached2048,
} from '../utils/game2048Logic.js'
import { playTap, playChime } from '../utils/audio.js'

export function Game2048Screen() {
  const [gridState, setGridState] = useState(() => initGameGrid())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('nook-2048-best') || '0', 10) || 0
    } catch {
      return 0
    }
  })
  const [history, setHistory] = useState([])
  const [hasWon, setHasWon] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [mergedCells, setMergedCells] = useState([])
  const [spawnedCell, setSpawnedCell] = useState(null)

  const boardRef = useRef(null)
  const touchStartRef = useRef(null)

  const grid = gridState.grid

  // Show a gentle toast notification
  const showToast = useCallback((msg, duration = 3000) => {
    setToastMessage(msg)
    if (duration > 0) {
      setTimeout(() => {
        setToastMessage((curr) => (curr === msg ? null : curr))
      }, duration)
    }
  }, [])

  // Start new game
  const handleRestart = useCallback(() => {
    playTap()
    const newInit = initGameGrid()
    setGridState(newInit)
    setScore(0)
    setHistory([])
    setHasWon(false)
    setIsGameOver(false)
    setToastMessage(null)
    setMergedCells([])
    setSpawnedCell(null)
  }, [])

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    playTap()
    const lastState = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setGridState({ grid: lastState.grid, spawnedCells: [] })
    setScore(lastState.score)
    setIsGameOver(false)
    setToastMessage(null)
    setMergedCells([])
    setSpawnedCell(null)
  }, [history])

  // Move handler
  const handleMove = useCallback(
    (direction) => {
      if (isGameOver) return

      const { grid: movedGrid, scoreGained, changed, mergedCells: newMergedCells } = moveGrid(
        grid,
        direction
      )

      if (!changed) return // Invalid move in this direction

      playTap()

      // Save previous state for Undo
      setHistory((prev) => [...prev.slice(-30), { grid, score }])

      // Update score and best
      const nextScore = score + scoreGained
      setScore(nextScore)
      if (nextScore > bestScore) {
        setBestScore(nextScore)
        try {
          localStorage.setItem('nook-2048-best', String(nextScore))
        } catch {
          // Ignore storage errors
        }
      }

      // Spawn new tile on random empty cell
      const { grid: finalGrid, spawnedCell: newSpawnedCell } = spawnRandomTile(movedGrid)
      setGridState({ grid: finalGrid, spawnedCells: newSpawnedCell ? [newSpawnedCell] : [] })
      setMergedCells(newMergedCells)
      setSpawnedCell(newSpawnedCell)

      // Check 2048 achievement
      if (!hasWon && hasReached2048(finalGrid)) {
        setHasWon(true)
        setTimeout(() => {
          playChime()
          showToast('Form achieved: 2048', 4000)
        }, 200)
      }

      // Check Game Over
      if (!hasValidMoves(finalGrid)) {
        setIsGameOver(true)
        setTimeout(() => {
          showToast('Space filled in quiet stillness.', 0)
        }, 300)
      }
    },
    [grid, score, bestScore, isGameOver, hasWon, showToast]
  )

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleMove('left')
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleMove('right')
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        handleMove('up')
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        handleMove('down')
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove, handleUndo])

  // Non-passive Touch Swipe listeners attached directly to the board
  useEffect(() => {
    const boardEl = boardRef.current
    if (!boardEl) return

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    const onTouchMove = (e) => {
      // Prevent screen scrolling & bounce during swipe gesture inside board
      if (touchStartRef.current && e.cancelable) {
        e.preventDefault()
      }
    }

    const onTouchEnd = (e) => {
      if (!touchStartRef.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      const minDistance = 20

      if (Math.max(absX, absY) >= minDistance) {
        if (absX > absY) {
          handleMove(dx > 0 ? 'right' : 'left')
        } else {
          handleMove(dy > 0 ? 'down' : 'up')
        }
      }
      touchStartRef.current = null
    }

    const onTouchCancel = () => {
      touchStartRef.current = null
    }

    boardEl.addEventListener('touchstart', onTouchStart, { passive: false })
    boardEl.addEventListener('touchmove', onTouchMove, { passive: false })
    boardEl.addEventListener('touchend', onTouchEnd, { passive: false })
    boardEl.addEventListener('touchcancel', onTouchCancel, { passive: false })

    return () => {
      boardEl.removeEventListener('touchstart', onTouchStart)
      boardEl.removeEventListener('touchmove', onTouchMove)
      boardEl.removeEventListener('touchend', onTouchEnd)
      boardEl.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [handleMove])

  function handleBack(e) {
    e.preventDefault()
    playTap()
    window.location.hash = '/briefing/2048'
  }

  return (
    <div className="g2048-page">
      {/* ── Top Bar ── */}
      <div className="g2048-top-bar">
        <button
          id="g2048-back-btn"
          className="g2048-back-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <div className="g2048-header-center">
          <h1 className="g2048-title">2048</h1>
        </div>

        <div className="g2048-top-actions">
          {history.length > 0 && (
            <button
              id="g2048-undo-btn"
              className="g2048-action-btn"
              onClick={handleUndo}
              aria-label="Undo Last Move"
              title="Undo"
            >
              <Icon name="undo" size={17} />
            </button>
          )}
          <button
            id="g2048-restart-btn"
            className="g2048-action-btn"
            onClick={handleRestart}
            aria-label="Restart Game"
            title="Restart"
          >
            <Icon name="restart" size={17} />
          </button>
        </div>
      </div>

      {/* ── Score Row ── */}
      <div className="g2048-status-card">
        <div className="g2048-stat-pills">
          <div className="g2048-pill">
            <span className="g2048-pill-label">SCORE</span>
            <span className="g2048-pill-val">{score}</span>
          </div>
          <div className="g2048-pill">
            <span className="g2048-pill-label">BEST</span>
            <span className="g2048-pill-val">{bestScore}</span>
          </div>
        </div>
        <p className="g2048-status-tagline">
          {isGameOver
            ? 'Space filled in quiet stillness.'
            : hasWon
            ? 'Form achieved. Continue merging into infinity.'
            : 'Slide to merge equal numbers into harmony.'}
        </p>
      </div>

      {/* ── 4x4 Grid Board ── */}
      <div className="g2048-board-wrap">
        <div
          ref={boardRef}
          className="g2048-board"
          role="grid"
          aria-label="2048 4x4 Board"
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isMerged = mergedCells.some((cell) => cell.r === r && cell.c === c)
              const isNew = spawnedCell && spawnedCell.r === r && spawnedCell.c === c

              let tileClass = 'g2048-slot'
              if (val > 0) {
                tileClass += ` g2048-tile g2048-tile--${val <= 2048 ? val : 'super'}`
                if (isMerged) tileClass += ' g2048-tile--merged'
                if (isNew) tileClass += ' g2048-tile--new'
              } else {
                tileClass += ' g2048-slot--empty'
              }

              return (
                <div
                  key={`cell-${r}-${c}`}
                  className={tileClass}
                  role="gridcell"
                  aria-label={val > 0 ? `Tile ${val}` : 'Empty'}
                >
                  {val > 0 && <span className="g2048-tile-text">{val}</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="g2048-footer">
        {isGameOver ? (
          <button className="g2048-next-btn" onClick={handleRestart}>
            Play Again
          </button>
        ) : (
          <span className="g2048-footer-quote">
            Swipe or use arrow keys to slide.
          </span>
        )}
      </div>

      {/* ── Toast Notification ── */}
      <div
        className={`g2048-toast${toastMessage ? ' g2048-toast--visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </div>
  )
}
