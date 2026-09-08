import { useState, useMemo } from 'react'
import { Icon } from '../icons.jsx'
import {
  BOARD_TIERS,
  getKnightMoves,
  warnsdorffHint,
  checkGameStatus,
} from '../utils/knightsTourLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function KnightsTourScreen({ onBack }) {
  const [tierKey, setTierKey] = useState('5x5')
  const tier = BOARD_TIERS[tierKey] || BOARD_TIERS['5x5']
  const size = tier.size
  const totalSquares = tier.totalSquares

  // Move history: array of { r, c }
  const [history, setHistory] = useState([])
  const [activeHint, setActiveHint] = useState(null)

  // Visited set and map: 'r,c' -> stepNumber (1-indexed)
  const { visitedSet, visitedMap } = useMemo(() => {
    const set = new Set()
    const map = new Map()
    history.forEach((pos, idx) => {
      const key = `${pos.r},${pos.c}`
      set.add(key)
      map.set(key, idx + 1)
    })
    return { visitedSet: set, visitedMap: map }
  }, [history])

  const currentPos = history.length > 0 ? history[history.length - 1] : null
  const visitedCount = history.length

  // Valid moves from current position (or any square if game hasn't started)
  const validMoves = useMemo(() => {
    if (history.length === 0) return []
    return getKnightMoves(currentPos.r, currentPos.c, size, visitedSet)
  }, [history.length, currentPos, size, visitedSet])

  const validMoveSet = useMemo(() => {
    return new Set(validMoves.map((m) => `${m.r},${m.c}`))
  }, [validMoves])

  // Game status: 'playing' | 'won' | 'trapped'
  const gameStatus = useMemo(() => {
    if (history.length === 0) return 'playing'
    return checkGameStatus(visitedCount, totalSquares, validMoves.length)
  }, [history.length, visitedCount, totalSquares, validMoves.length])

  // Navigation back
  const handleBack = () => {
    playTap()
    if (onBack) {
      onBack()
    } else {
      window.location.hash = '#/briefing/knights-tour'
    }
  }

  // Reset board
  const handleReset = () => {
    playTap()
    setHistory([])
    setActiveHint(null)
  }

  // Change difficulty / size tier
  const handleTierChange = (key) => {
    if (tierKey === key) return
    playTap()
    setTierKey(key)
    setHistory([])
    setActiveHint(null)
  }

  // Handle square tap
  const handleSquareClick = (r, c) => {
    const key = `${r},${c}`

    // Case 1: First placement (game start)
    if (history.length === 0) {
      playTap()
      setHistory([{ r, c }])
      setActiveHint(null)
      return
    }

    // Case 2: Move knight to valid unvisited square
    if (gameStatus === 'playing' && validMoveSet.has(key)) {
      playTap()
      const nextHistory = [...history, { r, c }]
      setHistory(nextHistory)
      setActiveHint(null)

      // Check for win
      if (nextHistory.length === totalSquares) {
        setTimeout(() => playChime(), 200)
      }
    }
  }

  // Undo move
  const handleUndo = () => {
    if (history.length === 0) return
    playTap()
    setHistory((prev) => prev.slice(0, -1))
    setActiveHint(null)
  }

  // Hint button (Warnsdorff's heuristic)
  const handleHint = () => {
    if (history.length === 0 || gameStatus !== 'playing') return
    playTap()
    const hint = warnsdorffHint(currentPos, size, visitedSet)
    if (hint) {
      setActiveHint(hint)
    }
  }

  return (
    <div className="kt-page">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="kt-top-bar">
        <button
          id="kt-back-btn"
          className="kt-icon-btn"
          onClick={handleBack}
          aria-label="Back to Briefing"
        >
          <Icon name="back" size={20} />
        </button>

        <h1 className="kt-title">KNIGHT&apos;S TOUR</h1>

        <button
          id="kt-reset-btn"
          className="kt-icon-btn"
          onClick={handleReset}
          aria-label="Restart Game"
          title="Restart Game"
        >
          <Icon name="restart" size={18} />
        </button>
      </header>

      {/* ── Tier / Size Selector ────────────────────────────── */}
      <div className="kt-tier-bar" role="group" aria-label="Board Size">
        {Object.keys(BOARD_TIERS).map((key) => {
          const t = BOARD_TIERS[key]
          const isActive = tierKey === key
          return (
            <button
              key={key}
              id={`kt-tier-${key}`}
              className={`kt-tier-btn ${isActive ? 'kt-tier-btn--active' : ''}`}
              onClick={() => handleTierChange(key)}
              aria-pressed={isActive}
            >
              <span className="kt-tier-name">{t.name}</span>
              <span className="kt-tier-size">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Status Pill ─────────────────────────────────────── */}
      <div className="kt-status-bar">
        <div className="kt-counter-pill">
          <span className="kt-counter-accent">{visitedCount}</span>
          <span className="kt-counter-divider">/</span>
          <span className="kt-counter-total">{totalSquares}</span>
          <span className="kt-counter-label">Visited</span>
        </div>
        <p className="kt-instruction">
          {history.length === 0
            ? 'Tap any square to place the Knight'
            : gameStatus === 'won'
            ? 'Full Tour Completed'
            : gameStatus === 'trapped'
            ? 'No jumps remain'
            : 'Contemplate your next jump'}
        </p>
      </div>

      {/* ── Grid Board ──────────────────────────────────────── */}
      <div className="kt-board-wrap">
        <div
          className="kt-board"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
          }}
          role="grid"
          aria-label={`Knight's Tour ${size}x${size} Grid`}
        >
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const key = `${r},${c}`
              const isLight = (r + c) % 2 === 0
              const isCurrent = currentPos && currentPos.r === r && currentPos.c === c
              const stepNumber = visitedMap.get(key)
              const isVisited = stepNumber !== undefined
              const isValidCandidate =
                history.length === 0 || (!isVisited && validMoveSet.has(key))
              const isHint = activeHint && activeHint.r === r && activeHint.c === c

              let squareClasses = `kt-square ${isLight ? 'kt-square--light' : 'kt-square--dark'}`
              if (isCurrent) squareClasses += ' kt-square--current'
              else if (isVisited) squareClasses += ' kt-square--visited'
              else if (isValidCandidate && history.length > 0)
                squareClasses += ' kt-square--valid'
              if (isHint) squareClasses += ' kt-square--hint'

              return (
                <button
                  key={key}
                  id={`kt-sq-${r}-${c}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(r, c)}
                  disabled={isVisited && !isCurrent}
                  aria-label={`Square ${r + 1}, ${c + 1}${
                    isCurrent
                      ? ': Knight'
                      : isVisited
                      ? `: Step ${stepNumber}`
                      : isValidCandidate
                      ? ': Valid move'
                      : ''
                  }`}
                >
                  {/* Current Knight Icon */}
                  {isCurrent && (
                    <span className="kt-knight-glyph" aria-hidden="true">
                      ♞
                    </span>
                  )}

                  {/* Visited Step Number */}
                  {isVisited && !isCurrent && (
                    <span className="kt-step-number">{stepNumber}</span>
                  )}

                  {/* Valid Move Candidate Indicator */}
                  {!isVisited && isValidCandidate && history.length > 0 && (
                    <span className="kt-candidate-dot" />
                  )}

                  {/* Start Prompt Dot */}
                  {history.length === 0 && <span className="kt-start-dot" />}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Action Controls (Undo & Hint) ────────────────────── */}
      <div className="kt-controls">
        <button
          id="kt-undo-btn"
          className="kt-action-btn"
          onClick={handleUndo}
          disabled={history.length === 0}
          aria-label="Undo Move"
        >
          <Icon name="back" size={14} />
          <span>Undo</span>
        </button>

        <button
          id="kt-hint-btn"
          className="kt-action-btn"
          onClick={handleHint}
          disabled={history.length === 0 || gameStatus !== 'playing'}
          aria-label="Show Hint"
        >
          <Icon name="info" size={14} />
          <span>Hint</span>
        </button>
      </div>

      {/* ── End-of-Game Banners ─────────────────────────────── */}
      {gameStatus === 'won' && (
        <div className="kt-modal-backdrop">
          <div className="kt-modal kt-modal--won">
            <h2 className="kt-modal-title">HARMONY ACHIEVED</h2>
            <p className="kt-modal-text">
              Full Tour Completed. Every square on the board was visited once and only once.
            </p>
            <div className="kt-modal-actions">
              <button
                id="kt-replay-btn"
                className="kt-modal-btn-primary"
                onClick={handleReset}
              >
                Replay Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {gameStatus === 'trapped' && (
        <div className="kt-modal-backdrop">
          <div className="kt-modal kt-modal--trapped">
            <h2 className="kt-modal-title">TOUR CONCLUDED</h2>
            <p className="kt-modal-text">
              No available jumps remain. The tour rests at step {visitedCount} of{' '}
              {totalSquares}.
            </p>
            <div className="kt-modal-actions">
              <button
                id="kt-undo-trapped-btn"
                className="kt-modal-btn-primary"
                onClick={handleUndo}
              >
                Undo Last Move
              </button>
              <button
                id="kt-restart-trapped-btn"
                className="kt-modal-btn-secondary"
                onClick={handleReset}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer Quote ────────────────────────────────────── */}
      <footer className="kt-footer">
        <p className="kt-quote">Every square, visited once.</p>
      </footer>
    </div>
  )
}
