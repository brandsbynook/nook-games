import { useState, useMemo } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
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
  const [historyIndex, setHistoryIndex] = useState(0)
  const [activeHint, setActiveHint] = useState(null)

  const isInspecting = history.length > 0 && historyIndex < history.length - 1
  const displayedHistory = history.slice(0, historyIndex + 1)

  // Visited set and map: 'r,c' -> stepNumber (1-indexed)
  const { visitedSet, visitedMap } = useMemo(() => {
    const set = new Set()
    const map = new Map()
    displayedHistory.forEach((pos, idx) => {
      const key = `${pos.r},${pos.c}`
      set.add(key)
      map.set(key, idx + 1)
    })
    return { visitedSet: set, visitedMap: map }
  }, [displayedHistory])

  const currentPos = displayedHistory.length > 0 ? displayedHistory[displayedHistory.length - 1] : null
  const visitedCount = displayedHistory.length

  // Valid moves from the LIVE tip of the tour
  const liveValidMoves = useMemo(() => {
    if (history.length === 0) return []
    const head = history[history.length - 1]
    const actualVisitedSet = new Set(history.map((p) => `${p.r},${p.c}`))
    return getKnightMoves(head.r, head.c, size, actualVisitedSet)
  }, [history, size])

  const liveValidMoveSet = useMemo(() => {
    return new Set(liveValidMoves.map((m) => `${m.r},${m.c}`))
  }, [liveValidMoves])

  // Game status: 'playing' | 'won' | 'trapped' evaluated strictly against the LIVE tip of the tour
  const gameStatus = useMemo(() => {
    if (history.length === 0) return 'playing'
    return checkGameStatus(history.length, totalSquares, liveValidMoves.length)
  }, [history.length, totalSquares, liveValidMoves.length])

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
    setHistoryIndex(0)
    setActiveHint(null)
  }

  // Change difficulty / size tier
  const handleTierChange = (key) => {
    if (tierKey === key) return
    playTap()
    setTierKey(key)
    setHistory([])
    setHistoryIndex(0)
    setActiveHint(null)
  }

  // Handle square tap
  const handleSquareClick = (r, c) => {
    if (isInspecting) return
    const key = `${r},${c}`

    // Case 1: First placement (game start)
    if (history.length === 0) {
      playTap()
      setHistory([{ r, c }])
      setHistoryIndex(0)
      setActiveHint(null)
      return
    }

    // Case 2: Move knight to valid unvisited square
    if (gameStatus === 'playing' && liveValidMoveSet.has(key)) {
      playTap()
      const nextHistory = [...history, { r, c }]
      setHistory(nextHistory)
      setHistoryIndex(nextHistory.length - 1)
      setActiveHint(null)

      // Check for win
      if (nextHistory.length === totalSquares) {
        setTimeout(() => playChime(), 200)
      }
    }
  }

  // Hint button (Warnsdorff's heuristic)
  const handleHint = () => {
    if (history.length === 0 || gameStatus !== 'playing' || isInspecting) return
    playTap()
    const head = history[history.length - 1]
    const actualVisitedSet = new Set(history.map((p) => `${p.r},${p.c}`))
    const hint = warnsdorffHint(head, size, actualVisitedSet)
    if (hint) {
      setActiveHint(hint)
    }
  }

  const isGameOver = !isInspecting && (gameStatus === 'won' || gameStatus === 'trapped')

  return (
    <div className="kt-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Knight's Tour" onBack={handleBack} />

      {/* ── Tier / Size Selector ────────────────────────────── */}
      <DifficultyTabs
        currentTier={tierKey}
        onSelectTier={(key) => handleTierChange(key)}
        tiers={[
          { id: '5x5', label: 'Gentle', subtitle: '5×5' },
          { id: '6x6', label: 'Standard', subtitle: '6×6' },
          { id: '8x8', label: 'Deep', subtitle: '8×8' },
        ]}
      />

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
            Array.from({ length: size }).map((__, c) => {
              const key = `${r},${c}`
              const isLight = (r + c) % 2 === 0
              const isCurrent = currentPos && currentPos.r === r && currentPos.c === c
              const stepNumber = visitedMap.get(key)
              const isVisited = stepNumber !== undefined
              const isValidCandidate =
                !isInspecting && (history.length === 0 || (!isVisited && liveValidMoveSet.has(key)))
              const isHint = !isInspecting && activeHint && activeHint.r === r && activeHint.c === c

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
                  disabled={isInspecting || (isVisited && !isCurrent)}
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

      {/* ── Action Controls & Stepper ─────────────────────────── */}
      <div className="kt-footer-controls">
        <GameFooterActions
          onReset={handleReset}
          onHint={handleHint}
          canHint={history.length > 0 && gameStatus === 'playing' && !isInspecting}
          resetLabel="Reset"
          hintLabel="Hint"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Step ${historyIndex + 1}/${history.length}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        />
      </div>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={isGameOver}
        title={gameStatus === 'won' ? 'Harmony Achieved' : 'Tour Concluded'}
        description={
          gameStatus === 'won'
            ? 'Full Tour Completed. Every square on the board was visited once and only once.'
            : `No available jumps remain. The tour rests at step ${history.length} of ${totalSquares}.`
        }
        icon={gameStatus === 'won' ? '✓' : '♞'}
        stats={[
          { label: 'Visited', value: `${history.length}/${totalSquares}` },
          { label: 'Board', value: `${size}×${size}` },
        ]}
        onNext={handleReset}
        nextLabel="New Tour"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Tour"
      />
    </div>
  )
}

export default KnightsTourScreen
