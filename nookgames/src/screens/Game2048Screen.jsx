import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../icons.jsx'
import {
  initTiles,
  moveTiles,
  spawnTile,
  cleanMergedTiles,
  hasValidMoves,
  hasReached2048,
  resetTileIdCounter,
} from '../utils/game2048Logic.js'
import { playTap, playChime } from '../utils/audio.js'

export function Game2048Screen() {
  const [tiles, setTiles] = useState(() => initTiles())
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

  const boardRef = useRef(null)
  const touchStartRef = useRef(null)
  const isAnimatingRef = useRef(false)
  const cleanupTimerRef = useRef(null)

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
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    const newTiles = initTiles()
    setTiles(newTiles)
    setScore(0)
    setHistory([])
    setHasWon(false)
    setIsGameOver(false)
    setToastMessage(null)
    isAnimatingRef.current = false
  }, [])

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isAnimatingRef.current) return
    playTap()
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    const lastState = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setTiles(cleanMergedTiles(lastState.tiles))
    setScore(lastState.score)
    setIsGameOver(false)
    setToastMessage(null)
    isAnimatingRef.current = false
  }, [history])

  // Move handler
  const handleMove = useCallback(
    (direction) => {
      if (isGameOver || isAnimatingRef.current) return

      // Clean any pending merged tiles from previous move
      const currentCleanTiles = cleanMergedTiles(tiles)
      const { tiles: movedTiles, scoreGained, changed } = moveTiles(currentCleanTiles, direction)

      if (!changed) return // Invalid move in this direction

      playTap()
      isAnimatingRef.current = true

      // Save previous state for Undo
      setHistory((prev) => [...prev.slice(-30), { tiles: currentCleanTiles, score }])

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

      // Spawn new tile immediately so it arrives with the move
      const { tiles: withSpawned } = spawnTile(movedTiles)
      setTiles(withSpawned)

      // Clean up merged-away source tiles after 120ms transition
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = setTimeout(() => {
        setTiles((prev) => cleanMergedTiles(prev))
        isAnimatingRef.current = false

        // Check 2048 achievement
        if (!hasWon && hasReached2048(withSpawned)) {
          setHasWon(true)
          playChime()
          showToast('Form achieved: 2048', 4000)
        }

        // Check Game Over
        if (!hasValidMoves(withSpawned)) {
          setIsGameOver(true)
          showToast('Space filled in quiet stillness.', 0)
        }
      }, 130)
    },
    [tiles, score, bestScore, isGameOver, hasWon, showToast]
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
      // Prevent screen scrolling & bounce during swipe gesture
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
          {/* Background Empty Cells */}
          <div className="g2048-grid-bg" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div key={`bg-${idx}`} className="g2048-cell g2048-cell--empty" />
            ))}
          </div>

          {/* Coordinate-based Sliding Tile Layer */}
          <div className="g2048-tile-container" aria-live="polite">
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={`g2048-tile-item${tile.mergedInto ? ' g2048-tile-item--merged-into' : ''}`}
                style={{
                  '--row': tile.row,
                  '--col': tile.col,
                }}
              >
                <div
                  className={`g2048-tile g2048-tile--${tile.value <= 2048 ? tile.value : 'super'}${
                    tile.isNew ? ' g2048-tile--new' : ''
                  }${tile.isMerged ? ' g2048-tile--merged' : ''}`}
                  role="gridcell"
                  aria-label={`Tile ${tile.value}`}
                >
                  <span className="g2048-tile-text">{tile.value}</span>
                </div>
              </div>
            ))}
          </div>
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
