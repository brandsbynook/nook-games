import { useState, useEffect, useCallback, useRef } from 'react'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
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
  const [history, setHistory] = useState(() => [{ tiles: initGameTiles(gridSize), score: 0 }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [hasWon, setHasWon] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const isInspecting = historyIndex < history.length - 1
  const displayedTiles = (isInspecting && history[historyIndex] ? history[historyIndex].tiles : tiles)
  const displayedScore = (isInspecting && history[historyIndex] ? history[historyIndex].score : score)

  const boardRef = useRef(null)
  const touchStartRef = useRef(null)
  const cleanupTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    }
  }, [])

  const handleRestart = useCallback((size = gridSize) => {
    playTap()
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current)
    const newTiles = initGameTiles(size)
    setTiles(newTiles)
    setScore(0)
    setHistory([{ tiles: newTiles, score: 0 }])
    setHistoryIndex(0)
    setHasWon(false)
    setIsGameOver(false)
  }, [gridSize])

  const handleTierChange = useCallback((tierId) => {
    setDifficulty(tierId)
    const newSize = tierId === 'gentle' ? 5 : 4
    handleRestart(newSize)
  }, [handleRestart])

  const handleMove = useCallback(
    (direction) => {
      if (isGameOver || isInspecting) return

      const { nextTiles, scoreGained, changed } = moveTiles(tiles, direction, gridSize)
      if (!changed) return

      playTap()

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

      setHistory((prev) => {
        const nextHist = [
          ...prev.slice(0, historyIndex + 1),
          { tiles: withSpawn.filter((t) => !t.isDeleting), score: nextScore },
        ]
        setHistoryIndex(nextHist.length - 1)
        return nextHist
      })

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
        }, 200)
      }

      if (!hasValidMoves(finalGrid, gridSize)) {
        setIsGameOver(true)
        recordGameSession('2048', hasWon || wonThisTurn)
      }
    },
    [tiles, score, bestScore, isGameOver, isInspecting, hasWon, targetGoal, gridSize, historyIndex]
  )

  useEffect(() => {
    function handleKeyDown(e) {
      if (isInspecting) return
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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleMove, isInspecting])

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
            <span className="g2048-pill-val">{displayedScore}</span>
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
            {displayedTiles.map((tile) => (
              <Tile key={tile.id} tile={tile} size={gridSize} />
            ))}
          </div>
        </div>
      </div>

      <div className="g2048-footer-controls">
        <GameFooterActions
          onReset={() => handleRestart(gridSize)}
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
        isOpen={isGameOver || hasWon}
        title={hasWon ? `Harmonious ${targetGoal}` : 'Space Filled'}
        description={
          hasWon
            ? `Target tile of ${targetGoal} successfully formed.`
            : 'No more valid slides available on the lattice.'
        }
        icon={hasWon ? '✓' : '❖'}
        stats={[
          { label: 'Score', value: `${score}` },
          { label: 'Best', value: `${bestScore}` },
          { label: 'Moves', value: `${history.length - 1}` },
        ]}
        onNext={() => handleRestart(gridSize)}
        nextLabel="New Board"
        onReplay={() => handleRestart(gridSize)}
        replayLabel="Replay"
        reviewLabel="Review Board"
      />
    </div>
  )
}

export default Game2048Screen