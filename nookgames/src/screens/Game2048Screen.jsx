import { useState, useEffect, useCallback, useRef } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
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

export function Game2048Screen({ onBack }) {
  const [difficulty, setDifficulty] = useState('standard')

  // Board dimensions & targets across tiers:
  // Gentle: 5x5, target 1024 (spacious, low-pressure flow)
  // Standard: 4x4, target 2048 (classic balance)
  // Deep: 4x4, target 4096 (high-density precision)
  const gridSize = difficulty === 'gentle' ? 5 : 4
  const targetGoal = difficulty === 'gentle' ? 1024 : difficulty === 'deep' ? 4096 : 2048

  const [tiles, setTiles] = useState(() => initGameTiles(gridSize))
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

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    }
  }, [])

  const showToast = useCallback((msg, duration = 3000) => {
    setToastMessage(msg)
    if (duration > 0) {
      setTimeout(() => {
        setToastMessage((curr) => (curr === msg ? null : curr))
      }, duration)
    }
  }, [])

  const handleRestart = useCallback((size = gridSize) => {
    playTap()
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    const newTiles = initGameTiles(size)
    setTiles(newTiles)
    setScore(0)
    setHistory([])
    setHasWon(false)
    setIsGameOver(false)
    setToastMessage(null)
  }, [gridSize])

  const handleTierChange = useCallback((tierId) => {
    setDifficulty(tierId)
    const newSize = tierId === 'gentle' ? 5 : 4
    handleRestart(newSize)
  }, [handleRestart])

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

  const handleMove = useCallback(
    (direction) => {
      if (isGameOver) return

      const { nextTiles, scoreGained, changed } = moveTiles(tiles, direction, gridSize)
      if (!changed) return

      playTap()

      setHistory((prev) => [
        ...prev.slice(-30),
        { tiles: tiles.filter((t) => !t.isDeleting), score },
      ])

      const nextScore = score + scoreGained
      setScore(nextScore)
      if (nextScore > bestScore) {
        setBestScore(nextScore)
        try {
          localStorage.setItem('nook-2048-best', String(nextScore))
        } catch {
          // Ignore storage error
        }
      }

      const { nextTiles: withSpawn } = spawnRandomTileInTiles(nextTiles, gridSize)
      setTiles(withSpawn)

      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
      cleanupTimeoutRef.current = setTimeout(() => {
        setTiles((prev) =>
          prev
            .filter((t) => !t.isDeleting)
            .map((t) => ({ ...t, isMerged: false, isNew: false }))
        )
      }, 190)

      const finalGrid = tilesToGrid(withSpawn, gridSize)
      let wonThisTurn = false
      if (!hasWon && hasReached2048(finalGrid, targetGoal, gridSize)) {
        wonThisTurn = true
        setHasWon(true)
        recordGameSession('2048', true)
        setTimeout(() => {
          playChime()
          showToast(`Form achieved: ${targetGoal}`, 4000)
        }, 200)
      }

      if (!hasValidMoves(finalGrid, gridSize)) {
        setIsGameOver(true)
        recordGameSession('2048', hasWon || wonThisTurn)
        setTimeout(() => {
          showToast('Space filled in quiet stillness.', 0)
        }, 300)
      }
    },
    [tiles, score, bestScore, isGameOver, hasWon, showToast, targetGoal, gridSize]
  )

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

    if (Math.max(absX, absY) >= minDistance) {
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
    if (e) e.preventDefault()
    playTap()
    if (typeof onBack === 'function') {
      onBack()
    } else {
      window.location.hash = '#/briefing/2048'
    }
  }

  return (
    <div className="g2048-page game-screen-container">
      <GameHeader title="2048" onBack={handleBack} />

      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={handleTierChange}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: '5×5 · 1024' },
          { id: 'standard', label: 'Standard', subtitle: '4×4 · 2048' },
          { id: 'deep', label: 'Deep', subtitle: '4×4 · 4096' },
        ]}
      />

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

      <div className="g2048-board-wrap">
        <div
          ref={boardRef}
          className="g2048-board"
          style={{
            position: 'relative',
            aspectRatio: '1',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            '--grid-size': gridSize,
          }}
          role="grid"
          aria-label={`2048 ${gridSize}x${gridSize} Board`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((__, c) => (
              <div
                key={`bg-cell-${r}-${c}`}
                className="g2048-slot g2048-slot--empty"
                role="gridcell"
                aria-label="Empty"
              />
            ))
          )}

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
              <Tile key={tile.id} tile={tile} size={gridSize} />
            ))}
          </div>
        </div>
      </div>

      <GameFooterActions
        onReset={() => handleRestart(gridSize)}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        resetLabel="Reset"
        undoLabel="Undo"
      />

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