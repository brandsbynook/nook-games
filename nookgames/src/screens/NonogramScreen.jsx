import { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '../components/Icons'
import { BackButton } from '../components/BackButton.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import {
  CELL_STATES,
  DIFFICULTY_TIERS,
  PUZZLES,
  loadPuzzle,
  isPuzzleSolved,
  checkDeductiveErrors,
  isLineSatisfied,
  createEmptyGrid,
} from '../utils/nonogramLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function NonogramScreen({ onBack } = {}) {
  const initialIndex = useRef(
    Math.floor(Math.random() * (PUZZLES?.beginner?.length || 1))
  )
  const [tier, setTier] = useState('beginner') // 'beginner' | 'intermediate' | 'expert'
  const [puzzleIndex, setPuzzleIndex] = useState(initialIndex.current)
  const [toolMode, setToolMode] = useState('fill') // 'fill' | 'cross'
  
  // Current active puzzle definition
  const [puzzle, setPuzzle] = useState(() => loadPuzzle('beginner', initialIndex.current))
  // Current board state (size x size)
  const [grid, setGrid] = useState(() => createEmptyGrid(puzzle.size))
  // History for inspection
  const [history, setHistory] = useState(() => [createEmptyGrid(puzzle.size)])
  const [historyIndex, setHistoryIndex] = useState(0)
  // Game completion state
  const [isSolved, setIsSolved] = useState(false)
  // Deductive check message
  const [checkFeedback, setCheckFeedback] = useState(null)

  const isInspecting = historyIndex < history.length - 1
  const displayedGrid = history[historyIndex] || grid

  // Dragging state tracking
  const isDraggingRef = useRef(false)
  const dragTargetStateRef = useRef(null)
  const touchedCellsRef = useRef(new Set())

  // Load new puzzle or switch tier
  const initPuzzle = useCallback((newTier, newIndex) => {
    const loaded = loadPuzzle(newTier, newIndex)
    const empty = createEmptyGrid(loaded.size)
    setPuzzle(loaded)
    setGrid(empty)
    setHistory([empty])
    setHistoryIndex(0)
    setIsSolved(false)
    setCheckFeedback(null)
    isDraggingRef.current = false
  }, [])

  // Handle tier switch
  const handleTierChange = (newTier) => {
    if (newTier === tier) return
    playTap()
    setTier(newTier)
    const count = PUZZLES[newTier]?.length || 1
    const randIdx = Math.floor(Math.random() * count)
    setPuzzleIndex(randIdx)
    initPuzzle(newTier, randIdx)
  }

  // Handle previous/next puzzle navigation
  const handlePrevPuzzle = () => {
    playTap()
    const nextIdx = (puzzleIndex - 1 + puzzle.totalInTier) % puzzle.totalInTier
    setPuzzleIndex(nextIdx)
    initPuzzle(tier, nextIdx)
  }

  const handleNextPuzzle = () => {
    playTap()
    const nextIdx = (puzzleIndex + 1) % puzzle.totalInTier
    setPuzzleIndex(nextIdx)
    initPuzzle(tier, nextIdx)
  }

  // Reset board
  const handleReset = () => {
    playTap()
    const empty = createEmptyGrid(puzzle.size)
    setGrid(empty)
    setHistory([empty])
    setHistoryIndex(0)
    setIsSolved(false)
    setCheckFeedback(null)
  }

  // Deductive check assistant (pure logic assistance)
  const handleCheck = () => {
    if (isSolved || isInspecting) return
    playTap()
    const result = checkDeductiveErrors(grid, puzzle.solution)
    setCheckFeedback(result)
  }

  // Undo last action
  const handleUndo = () => {
    if (isSolved || isInspecting || historyIndex === 0) return
    playTap()
    const prevIdx = historyIndex - 1
    const prevGrid = history[prevIdx]
    setHistoryIndex(prevIdx)
    setGrid(prevGrid)
    setCheckFeedback(null)
  }

  // Back navigation
  const handleBack = useCallback(
    (e) => {
      if (e) e.preventDefault()
      playTap()
      if (typeof onBack === 'function') {
        onBack()
      } else {
        window.location.hash = '#/briefing/nonogram'
      }
    },
    [onBack]
  )

  // Cell interaction handlers
  const handleCellPointerDown = (r, c, e) => {
    if (isSolved || isInspecting) return
    e.preventDefault()

    // Determine target state based on tool mode and initial cell state
    const currentVal = grid[r][c]
    let targetVal = CELL_STATES.EMPTY

    if (toolMode === 'fill') {
      targetVal = currentVal === CELL_STATES.FILLED ? CELL_STATES.EMPTY : CELL_STATES.FILLED
    } else {
      // cross mode
      targetVal = currentVal === CELL_STATES.CROSSED ? CELL_STATES.EMPTY : CELL_STATES.CROSSED
    }

    // Update single cell
    const newGrid = grid.map((row) => [...row])
    newGrid[r][c] = targetVal
    setGrid(newGrid)
    setHistory((prev) => {
      const nextHist = [...prev.slice(0, historyIndex + 1), newGrid]
      setHistoryIndex(nextHist.length - 1)
      return nextHist
    })
    setCheckFeedback(null)
    playTap()

    // Start drag
    isDraggingRef.current = true
    dragTargetStateRef.current = targetVal
    touchedCellsRef.current = new Set([`${r},${c}`])

    // Check if solved immediately
    if (isPuzzleSolved(newGrid, puzzle.solution)) {
      setIsSolved(true)
      isDraggingRef.current = false
      playChime()
    }
  }

  const handleCellPointerEnter = (r, c) => {
    if (!isDraggingRef.current || isSolved || isInspecting) return
    const key = `${r},${c}`
    if (touchedCellsRef.current.has(key)) return

    touchedCellsRef.current.add(key)
    const targetVal = dragTargetStateRef.current

    setGrid((prev) => {
      const next = prev.map((row) => [...row])
      next[r][c] = targetVal
      setHistory((hPrev) => {
        const nextHist = [...hPrev.slice(0, historyIndex + 1), next]
        setHistoryIndex(nextHist.length - 1)
        return nextHist
      })
      if (isPuzzleSolved(next, puzzle.solution)) {
        setIsSolved(true)
        isDraggingRef.current = false
        playChime()
      }
      return next
    })
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    dragTargetStateRef.current = null
    touchedCellsRef.current.clear()
  }

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  // Calculate satisfied lines for header dimming
  const satisfiedRows = puzzle.rowClues.map((clues, r) =>
    isLineSatisfied(displayedGrid[r], clues)
  )

  const satisfiedCols = puzzle.colClues.map((clues, c) => {
    const col = []
    for (let r = 0; r < puzzle.size; r++) {
      col.push(displayedGrid[r][c])
    }
    return isLineSatisfied(col, clues)
  })

  return (
    <div className="ng-page">
      {/* ── Top Header Bar ──────────────────────────────────── */}
      <header className="ng-top-bar">
        <BackButton
          id="ng-back-btn"
          className="ng-action-btn"
          onClick={handleBack}
          ariaLabel="Back to Briefing"
          title="Back to Briefing"
        />

        <div className="ng-header-center">
          <h1 className="ng-title">Nonogram</h1>
          <span className="ng-subtitle">
            {puzzle.size}×{puzzle.size} Picross
          </span>
        </div>

        <div className="ng-top-actions">
          <button
            id="ng-undo-btn"
            className="ng-action-btn"
            onClick={handleUndo}
            disabled={isSolved || history.length === 0}
            aria-label="Undo move"
            title="Undo"
          >
            <Icon name="undo" size={16} />
          </button>
          <button
            id="ng-check-btn"
            className="ng-action-btn"
            onClick={handleCheck}
            disabled={isSolved}
            aria-label="Check deductive errors"
            title="Check Consistency"
          >
            <Icon name="pencil" size={16} />
          </button>
          <button
            id="ng-reset-btn"
            className="ng-action-btn"
            onClick={handleReset}
            aria-label="Reset puzzle"
            title="Restart"
          >
            <Icon name="restart" size={18} />
          </button>
        </div>
      </header>

      {/* ── Segmented Difficulty Selector ───────────────────── */}
      <div className="ng-difficulty-bar" role="tablist" aria-label="Difficulty Mode">
        {Object.values(DIFFICULTY_TIERS).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tier}
            className={`ng-diff-btn${t.id === tier ? ' ng-diff-btn--active' : ''}`}
            onClick={() => handleTierChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Puzzle Carousel Navigator ───────────────────────── */}
      <div className="ng-puzzle-nav">
        <button
          className="ng-nav-arrow"
          onClick={handlePrevPuzzle}
          aria-label="Previous puzzle"
        >
          ‹
        </button>
        <div className="ng-puzzle-info">
          <span className="ng-puzzle-title">
            {isSolved ? puzzle.title : `Pattern ${puzzleIndex + 1}`}
          </span>
          <span className="ng-puzzle-progress">
            {puzzleIndex + 1} of {puzzle.totalInTier}
          </span>
        </div>
        <button
          className="ng-nav-arrow"
          onClick={handleNextPuzzle}
          aria-label="Next puzzle"
        >
          ›
        </button>
      </div>

      {/* ── Deductive Check Feedback Pill ───────────────────── */}
      {checkFeedback && (
        <div
          className={`ng-feedback-pill ${
            checkFeedback.hasErrors ? 'ng-feedback-pill--error' : 'ng-feedback-pill--ok'
          }`}
          role="status"
        >
          <span>{checkFeedback.message}</span>
          <button
            className="ng-feedback-close"
            onClick={() => setCheckFeedback(null)}
            aria-label="Dismiss feedback"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Nonogram Board (Clues + Interactive Grid) ────────── */}
      <main className="ng-board-container" role="main">
        <div className={`ng-board ng-board--size-${puzzle.size}`}>
          {/* Top-Left Corner Spacer */}
          <div className="ng-corner-spacer" aria-hidden="true" />

          {/* Top Column Clues */}
          <div
            className="ng-col-clues-header"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
            aria-label="Column Clues"
          >
            {puzzle.colClues.map((clues, colIdx) => {
              const isColSatisfied = satisfiedCols[colIdx]
              const isThick = (colIdx + 1) % 5 === 0 && colIdx < puzzle.size - 1

              return (
                <div
                  key={`col-clue-${colIdx}`}
                  className={`ng-col-clue-item${
                    isColSatisfied ? ' ng-clue--satisfied' : ''
                  }${isThick ? ' ng-border-right-thick' : ''}`}
                >
                  {clues.map((clue, idx) => (
                    <span key={`cc-${colIdx}-${idx}`} className="ng-clue-num">
                      {clue}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Left Row Clues */}
          <div
            className="ng-row-clues-sidebar"
            style={{ gridTemplateRows: `repeat(${puzzle.size}, 1fr)` }}
            aria-label="Row Clues"
          >
            {puzzle.rowClues.map((clues, rowIdx) => {
              const isRowSatisfied = satisfiedRows[rowIdx]
              const isThick = (rowIdx + 1) % 5 === 0 && rowIdx < puzzle.size - 1

              return (
                <div
                  key={`row-clue-${rowIdx}`}
                  className={`ng-row-clue-item${
                    isRowSatisfied ? ' ng-clue--satisfied' : ''
                  }${isThick ? ' ng-border-bottom-thick' : ''}`}
                >
                  {clues.map((clue, idx) => (
                    <span key={`rc-${rowIdx}-${idx}`} className="ng-clue-num">
                      {clue}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Interactive Cell Grid */}
          <div
            className="ng-grid"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
              gridTemplateRows: `repeat(${puzzle.size}, 1fr)`,
            }}
            role="grid"
            aria-label="Nonogram grid"
          >
            {displayedGrid.map((row, r) =>
              row.map((cellState, c) => {
                const isThickRight = (c + 1) % 5 === 0 && c < puzzle.size - 1
                const isThickBottom = (r + 1) % 5 === 0 && r < puzzle.size - 1

                let cellClass = 'ng-cell--empty'
                if (cellState === CELL_STATES.FILLED) {
                  cellClass = 'ng-cell--filled'
                } else if (cellState === CELL_STATES.CROSSED) {
                  cellClass = 'ng-cell--crossed'
                }

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    type="button"
                    role="gridcell"
                    className={`ng-cell ${cellClass}${
                      isThickRight ? ' ng-border-right-thick' : ''
                    }${isThickBottom ? ' ng-border-bottom-thick' : ''}`}
                    onPointerDown={(e) => handleCellPointerDown(r, c, e)}
                    onPointerEnter={() => handleCellPointerEnter(r, c)}
                    aria-label={`Row ${r + 1}, Column ${c + 1}: ${
                      cellState === CELL_STATES.FILLED
                        ? 'Filled'
                        : cellState === CELL_STATES.CROSSED
                        ? 'Crossed'
                        : 'Empty'
                    }`}
                    disabled={isInspecting}
                  >
                    {cellState === CELL_STATES.CROSSED && !isSolved && (
                      <span className="ng-cell-cross">×</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* ── Dual-Action Control Dock ─────────────────────────── */}
      <footer className="ng-dock">
        <div className="ng-controls-row">
          <button
            type="button"
            className={`ng-tool-btn${toolMode === 'fill' ? ' ng-tool-btn--active' : ''}`}
            onClick={() => {
              playTap()
              setToolMode('fill')
            }}
            aria-pressed={toolMode === 'fill'}
            disabled={isInspecting || isSolved}
          >
            <span className="ng-tool-icon ng-tool-icon--fill" />
            <span>Fill</span>
          </button>

          <button
            type="button"
            className={`ng-tool-btn${toolMode === 'cross' ? ' ng-tool-btn--active' : ''}`}
            onClick={() => {
              playTap()
              setToolMode('cross')
            }}
            aria-pressed={toolMode === 'cross'}
            disabled={isInspecting || isSolved}
          >
            <span className="ng-tool-icon ng-tool-icon--cross">×</span>
            <span>Mark</span>
          </button>
        </div>

        <GameFooterActions
          onReset={handleReset}
          resetLabel="Restart"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < history.length - 1}
          stepIndicator={history.length > 1 ? `Step ${historyIndex}/${history.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(history.length - 1)}
        />
      </footer>

      {/* ── Universal Completion Modal ── */}
      <GameCompletionModal
        isOpen={isSolved}
        title={puzzle.title}
        description="The hidden picture has revealed itself in full clarity."
        icon="✓"
        stats={[
          { label: 'Tier', value: tier },
          { label: 'Grid', value: `${puzzle.size}×${puzzle.size}` },
          { label: 'Actions', value: `${history.length - 1}` },
        ]}
        onNext={handleNextPuzzle}
        nextLabel="Next Puzzle"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Art"
      />
    </div>
  )
}

export default NonogramScreen
