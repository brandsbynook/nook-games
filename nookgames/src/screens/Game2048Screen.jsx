import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../icons.jsx'
import {
  initGameTiles,
  moveTiles,
  spawnRandomTileInTiles,
  tilesToGrid,
  hasValidMoves,
  hasReached2048,
} from '../utils/game2048Logic.js'
import { Tile } from '../components/games/2048/Tile.jsx'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession } from '../utils/storage.js'

export function Game2048Screen() {
  const [tiles, setTiles] = useState(() => initGameTiles())
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
  const cleanupTimeoutRef = useRef(null)

  // Derive 4x4 grid matrix for score/valid moves/status checks
  const grid = tilesToGrid(tiles)

  // Clean up animation timeout on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    }
  }, [])

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
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    const newTiles = initGameTiles()
    setTiles(newTiles)
    setScore(0)
    setHistory([])
    setHasWon(false)
    setIsGameOver(false)
    setToastMessage(null)
  }, [])

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    playTap()
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    const lastState = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setTiles(
      lastState.tiles.map((t) => ({
        ...t,
        previousPosition: null,
        isNew: false,
        isMerged: false,
        isDeleting: false,
      }))
    )
    setScore(lastState.score)
    setIsGameOver(false)
    setToastMessage(null)
  }, [history])

  // Move handler
  const handleMove = useCallback(
    (direction) => {
      if (isGameOver) return

      // Process movement and merges on current active tiles
      const { nextTiles, scoreGained, changed } = moveTiles(tiles, direction)

      if (!changed) return // Invalid move in this direction

      playTap()

      // Save previous stable state for Undo
      setHistory((prev) => [
        ...prev.slice(-30),
        { tiles: tiles.filter((t) => !t.isDeleting), score },
      ])

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

      // Spawn new tile into a free position
      const { nextTiles: withSpawn } = spawnRandomTileInTiles(nextTiles)
      setTiles(withSpawn)

      // Schedule cleanup of parent tiles that merged and are now deleting
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
      cleanupTimeoutRef.current = setTimeout(() => {
        setTiles((prev) =>
          prev
            .filter((t) => !t.isDeleting)
            .map((t) => ({ ...t, isMerged: false, isNew: false }))
        )
      }, 190)

      // Check 2048 achievement
      const finalGrid = tilesToGrid(withSpawn)
      let wonThisTurn = false
      if (!hasWon && hasReached2048(finalGrid)) {
        wonThisTurn = true
        setHasWon(true)
        recordGameSession('2048', true)
        setTimeout(() => {
          playChime()
          showToast('Form achieved: 2048', 4000)
        }, 200)
      }

      // Check Game Over
      if (!hasValidMoves(finalGrid)) {
        setIsGameOver(true)
        recordGameSession('2048', hasWon || wonThisTurn)
        setTimeout(() => {
          showToast('Space filled in quiet stillness.', 0)
        }, 300)
      }
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

  // Touch Swipe Event Handlers bound directly to the main 4x4 grid container
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      }
    }
  }

  const handleTouchMove = (e) => {
    // Prevent default scrolling behavior to keep the game locked in place
    if (touchStartRef.current && e.cancelable) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches ? e.changedTouches[0] : null
    if (!touch) {
      touchStartRef.current = null
      return
    }

    const endX = touch.clientX
    const endY = touch.clientY
    const deltaX = endX - touchStartRef.current.x
    const deltaY = endY - touchStartRef.current.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const minDistance = 20

    // Filter accidental taps using threshold
    if (Math.max(absX, absY) >= minDistance) {
      // Determine dominant swipe axis
      if (absX > absY) {
        handleMove(deltaX > 0 ? 'right' : 'left')
      } else {
        handleMove(deltaY > 0 ? 'down' : 'up')
      }
    }

    touchStartRef.current = null
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
  }

  // Non-passive native listener fallback to guarantee touchmove preventDefault
  useEffect(() => {
    const boardEl = boardRef.current
    if (!boardEl) return

    const onNativeTouchMove = (e) => {
      if (touchStartRef.current && e.cancelable) {
        e.preventDefault()
      }
    }

    boardEl.addEventListener('touchmove', onNativeTouchMove, { passive: false })
    return () => {
      boardEl.removeEventListener('touchmove', onNativeTouchMove)
    }
  }, [])

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

      {/* ── 4x4 Grid Board with bound touch handlers ── */}
      <div className="g2048-board-wrap">
        <div
          ref={boardRef}
          className="g2048-board"
          style={{ position: 'relative', aspectRatio: '1' }}
          role="grid"
          aria-label="2048 4x4 Board"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          {/* 16 Static Background Slots */}
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((__, c) => (
              <div
                key={`bg-cell-${r}-${c}`}
                className="g2048-slot g2048-slot--empty"
                role="gridcell"
                aria-label="Empty"
              />
            ))
          )}

          {/* Dynamic Tiles Layer with smooth CSS transform translations */}
          <div
            className="g2048-tiles-container"
            style={{
              position: 'absolute',
              inset: 0,
              padding: '10px',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            {tiles.map((tile) => (
              <Tile key={tile.id} tile={tile} />
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
            Swipe to slide and merge
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

export default Game2048Screen
