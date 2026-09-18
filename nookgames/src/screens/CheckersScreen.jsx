import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Icon } from '../icons.jsx'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import {
  initBoard,
  cloneBoard,
  getLegalMovesForPiece,
  hasAnyCaptures,
  applyMove,
  countPieces,
  checkWinner,
  getBotMove,
  BOARD_SIZE,
} from '../utils/checkersLogic.js'
import { playTap, playChime } from '../utils/audio.js'
import { recordGameSession } from '../utils/storage.js'

export function CheckersScreen({ onBack }) {
  const [board, setBoard] = useState(initBoard)
  const [difficulty, setDifficulty] = useState('standard')
  const [turn, setTurn] = useState('white') // 'white' | 'black'
  const [selectedPos, setSelectedPos] = useState(null) // { r, c } | null
  const [multiJumpPiece, setMultiJumpPiece] = useState(null) // { r, c } | null
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null) // { from: {r, c}, to: {r, c} } | null
  const [history, setHistory] = useState([])
  const [winner, setWinner] = useState(null) // 'player' | 'bot' | null

  const botTimerRef = useRef(null)

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [])

  // Record session on winner
  useEffect(() => {
    if (winner) {
      recordGameSession('checkers', winner === 'player')
    }
  }, [winner])

  // Piece counts
  const counts = useMemo(() => countPieces(board), [board])

  // Legal moves for selected piece
  const { legalSteps, legalCaptures } = useMemo(() => {
    if (!selectedPos || turn !== 'white' || isBotThinking || winner) {
      return { legalSteps: [], legalCaptures: [] }
    }

    // If locked into a multi-jump sequence
    if (multiJumpPiece) {
      if (selectedPos.r !== multiJumpPiece.r || selectedPos.c !== multiJumpPiece.c) {
        return { legalSteps: [], legalCaptures: [] }
      }
    }

    const { steps, captures } = getLegalMovesForPiece(board, selectedPos.r, selectedPos.c)
    return { legalSteps: steps, legalCaptures: captures }
  }, [board, selectedPos, turn, isBotThinking, winner, multiJumpPiece])

  const targetMap = useMemo(() => {
    const map = new Map()
    legalSteps.forEach((s) => map.set(`${s.r},${s.c}`, { isCapture: false }))
    legalCaptures.forEach((c) => map.set(`${c.r},${c.c}`, { isCapture: true }))
    return map
  }, [legalSteps, legalCaptures])

  // Check if player has mandatory captures anywhere on board
  const playerMustCapture = useMemo(() => {
    if (turn !== 'white' || isBotThinking || winner) return false
    return hasAnyCaptures(board, 'white')
  }, [board, turn, isBotThinking, winner])

  // Navigation back
  const handleBack = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    if (onBack) {
      onBack()
    } else {
      window.location.hash = '#/briefing/checkers'
    }
  }

  // Restart / Reset
  const handleReset = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    const newBoard = initBoard()
    setBoard(newBoard)
    setTurn('white')
    setSelectedPos(null)
    setMultiJumpPiece(null)
    setIsBotThinking(false)
    setLastMove(null)
    setHistory([])
    setWinner(null)
  }

  // Execute bot turn
  const executeBotTurn = useCallback(
    (currentBoard) => {
      setIsBotThinking(true)

      botTimerRef.current = setTimeout(() => {
        let activeBoard = cloneBoard(currentBoard)
        let botMove = getBotMove(activeBoard, difficulty)

        if (!botMove) {
          // Bot has no moves
          setIsBotThinking(false)
          setWinner('player')
          setTimeout(() => playChime(), 200)
          return
        }

        let from = botMove.from
        let to = botMove.to
        let res = applyMove(activeBoard, from, to)
        activeBoard = res.nextBoard
        let lastFrom = from
        let lastTo = to

        // Handle bot multi-jump chain if available
        while (res.canMultiJump) {
          const nextMoves = getLegalMovesForPiece(activeBoard, to.r, to.c)
          if (nextMoves.captures.length > 0) {
            from = to
            to = { r: nextMoves.captures[0].r, c: nextMoves.captures[0].c }
            res = applyMove(activeBoard, from, to)
            activeBoard = res.nextBoard
            lastTo = to
          } else {
            break
          }
        }

        playTap()
        setBoard(activeBoard)
        setLastMove({ from: lastFrom, to: lastTo })
        setIsBotThinking(false)

        // Check if white player won/lost after bot move
        const winCheck = checkWinner(activeBoard)
        if (winCheck) {
          setWinner(winCheck)
          if (winCheck === 'player') {
            setTimeout(() => playChime(), 200)
          }
        } else {
          setTurn('white')
        }
      }, 350)
    },
    [difficulty]
  )

  // Handle square clicks
  const handleSquareClick = (r, c) => {
    if (turn !== 'white' || isBotThinking || winner) return

    const piece = board[r][c]
    const key = `${r},${c}`

    // 1. Tapping one of player's own pieces
    if (piece && piece.player === 'white') {
      // If locked in multi-jump, cannot select a different piece
      if (multiJumpPiece && (multiJumpPiece.r !== r || multiJumpPiece.c !== c)) {
        return
      }

      if (selectedPos && selectedPos.r === r && selectedPos.c === c) {
        if (!multiJumpPiece) {
          setSelectedPos(null)
        }
      } else {
        setSelectedPos({ r, c })
      }
      return
    }

    // 2. Tapping a valid destination square
    if (selectedPos && targetMap.has(key)) {
      const from = selectedPos
      const to = { r, c }

      // Save previous state for undo
      const priorState = {
        board: cloneBoard(board),
        turn: 'white',
        lastMove,
        winner: null,
      }

      const res = applyMove(board, from, to)
      playTap()

      setBoard(res.nextBoard)
      setLastMove({ from, to })

      // Check if multi-jump continuation is available
      if (res.canMultiJump) {
        setMultiJumpPiece(to)
        setSelectedPos(to)
        // Add to history stack
        setHistory((prev) => [...prev, priorState])
        return
      }

      // Turn completed
      setMultiJumpPiece(null)
      setSelectedPos(null)
      setHistory((prev) => [...prev, priorState])

      // Check winner
      const winCheck = checkWinner(res.nextBoard)
      if (winCheck) {
        setWinner(winCheck)
        if (winCheck === 'player') {
          setTimeout(() => playChime(), 200)
        }
      } else {
        setTurn('black')
        executeBotTurn(res.nextBoard)
      }
    }
  }

  // Handle Undo: rolls back both player's move and bot's reply
  const handleUndo = () => {
    if (isBotThinking || history.length === 0) return
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    // Revert to earliest state before the last round
    const restored = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setBoard(restored.board)
    setTurn(restored.turn)
    setLastMove(restored.lastMove)
    setSelectedPos(null)
    setMultiJumpPiece(null)
    setIsBotThinking(false)
    setWinner(null)
  }

  return (
    <div className="chk-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Checkers" onBack={handleBack} />

      {/* ── Difficulty Tabs ─────────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(diff) => {
          setDifficulty(diff)
          handleReset()
        }}
        tiers={[
          { id: 'gentle', label: 'Gentle', subtitle: 'Casual' },
          { id: 'standard', label: 'Standard', subtitle: 'Tactical' },
          { id: 'deep', label: 'Deep', subtitle: 'Master' },
        ]}
      />

      {/* ── Status Bar & Piece Count Pills ──────────────────── */}
      <div className="chk-status-bar">
        <div className="chk-counts-cluster">
          <div className="chk-count-pill chk-count-pill--white">
            <span className="chk-mini-disc chk-mini-disc--white" />
            <span className="chk-count-val">{counts.white}</span>
            {counts.whiteKings > 0 && (
              <span className="chk-king-tally">({counts.whiteKings}♔)</span>
            )}
          </div>

          <div
            className={`chk-turn-pill ${
              isBotThinking ? 'chk-turn-pill--thinking' : 'chk-turn-pill--player'
            }`}
          >
            <span className="chk-turn-dot" />
            <span className="chk-turn-text">
              {winner
                ? 'Match Concluded'
                : isBotThinking
                ? 'Contemplating...'
                : multiJumpPiece
                ? 'Multi-Jump!'
                : playerMustCapture
                ? 'Jump Required'
                : 'Your Turn'}
            </span>
          </div>

          <div className="chk-count-pill chk-count-pill--black">
            <span className="chk-mini-disc chk-mini-disc--black" />
            <span className="chk-count-val">{counts.black}</span>
            {counts.blackKings > 0 && (
              <span className="chk-king-tally">({counts.blackKings}♔)</span>
            )}
          </div>
        </div>
      </div>

      {/* ── 8x8 Board Container ──────────────────────────────── */}
      <div className="chk-board-wrap">
        <div
          className="chk-board"
          role="grid"
          aria-label="Checkers 8x8 Board"
        >
          {Array.from({ length: BOARD_SIZE }).map((_, r) =>
            Array.from({ length: BOARD_SIZE }).map((_, c) => {
              const isDark = (r + c) % 2 === 1
              const piece = board[r][c]
              const isSelected = selectedPos && selectedPos.r === r && selectedPos.c === c
              const isTarget = targetMap.has(`${r},${c}`)
              const targetInfo = targetMap.get(`${r},${c}`)
              const isLastMoveSquare =
                lastMove &&
                ((lastMove.from.r === r && lastMove.from.c === c) ||
                  (lastMove.to.r === r && lastMove.to.c === c))

              let squareClasses = `chk-square ${isDark ? 'chk-square--dark' : 'chk-square--light'}`
              if (isSelected) squareClasses += ' chk-square--selected'
              if (isLastMoveSquare) squareClasses += ' chk-square--last'

              return (
                <button
                  key={`${r}-${c}`}
                  id={`chk-sq-${r}-${c}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(r, c)}
                  disabled={!isDark}
                  aria-label={`Row ${r + 1}, Column ${c + 1}${
                    piece
                      ? `: ${piece.player === 'white' ? 'White' : 'Black'} ${
                          piece.isKing ? 'King' : 'Man'
                        }`
                      : isTarget
                      ? ': Valid target'
                      : ''
                  }`}
                >
                  {/* Checkers Piece Disc */}
                  {piece && (
                    <div
                      className={`chk-piece chk-piece--${piece.player} ${
                        piece.isKing ? 'chk-piece--king' : ''
                      } ${isSelected ? 'chk-piece--selected' : ''}`}
                    >
                      {piece.isKing && (
                        <span className="chk-crown-glyph" aria-hidden="true">
                          ♔
                        </span>
                      )}
                    </div>
                  )}

                  {/* Move Indicators: Small dot for step, distinct ring for jump capture */}
                  {isTarget && !targetInfo.isCapture && <span className="chk-step-dot" />}
                  {isTarget && targetInfo.isCapture && <span className="chk-capture-ring" />}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Action Controls ─────────────────────────────────── */}
      <GameFooterActions
        onReset={handleReset}
        onUndo={handleUndo}
        canUndo={!isBotThinking && history.length > 0}
        resetLabel="Reset"
        undoLabel="Undo"
      />

      {/* ── Game Over Modal ─────────────────────────────────── */}
      {winner && (
        <div className="chk-modal-backdrop">
          <div className={`chk-modal ${winner === 'player' ? 'chk-modal--won' : 'chk-modal--lost'}`}>
            <h2 className="chk-modal-title">
              {winner === 'player' ? 'HARMONY RESTORED' : 'THE BOARD CLAIMS REST'}
            </h2>
            <p className="chk-modal-text">
              {winner === 'player'
                ? 'All opposing pieces flanked and neutralized. Stillness achieved.'
                : 'The system has claimed the diagonal corridors. Return to quiet contemplation.'}
            </p>
            <div className="chk-modal-actions">
              <button
                id="chk-replay-btn"
                className="chk-modal-btn-primary"
                onClick={handleReset}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer Quote ────────────────────────────────────── */}
      <footer className="chk-footer">
        <p className="chk-quote">The diagonal world has its own laws.</p>
      </footer>
    </div>
  )
}
