import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Icon } from '../components/Icons'
import { GameHeader } from '../components/GameHeader.jsx'
import { DifficultyTabs } from '../components/DifficultyTabs.jsx'
import { GameFooterActions } from '../components/GameFooterActions.jsx'
import { GameCompletionModal } from '../components/GameCompletionModal.jsx'
import {
  createGame,
  getValidMoves,
  makeMove,
  getBotMove,
  UNICODE_PIECES,
} from '../utils/chessLogic.js'
import { playTap, playChime } from '../utils/audio.js'

export function ChessScreen({ onBack }) {
  // Game instance held in ref to avoid re-instantiation across renders
  const gameRef = useRef(null)
  if (!gameRef.current) {
    gameRef.current = createGame()
  }
  const game = gameRef.current

  const [fen, setFen] = useState(() => game.fen())
  const [fenHistory, setFenHistory] = useState(() => [game.fen()])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [difficulty, setDifficulty] = useState('standard')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [isBotThinking, setIsBotThinking] = useState(false)
  const [lastMove, setLastMove] = useState(null)
  const [gameStatus, setGameStatus] = useState({
    inCheck: false,
    isCheckmate: false,
    isDraw: false,
    winner: null,
  })
  const [historyCount, setHistoryCount] = useState(0)
  const botTimerRef = useRef(null)

  const isInspecting = historyIndex < fenHistory.length - 1
  const displayedFen = fenHistory[historyIndex] || fen

  // Read-only game instance for inspecting past boards
  const displayGame = useMemo(() => {
    if (!isInspecting) return game
    const g = createGame()
    try {
      g.load(displayedFen)
    } catch {
      // fallback
    }
    return g
  }, [isInspecting, displayedFen, game])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current)
    }
  }, [])

  // Sync game status
  const updateGameStatus = useCallback(() => {
    const inCheck = game.inCheck()
    const isCheckmate = game.isCheckmate()
    const isDraw = game.isDraw()
    let winner = null

    if (isCheckmate) {
      // If white to move in checkmate, black (bot) won. If black to move, white (user) won.
      winner = game.turn() === 'w' ? 'b' : 'w'
      if (winner === 'w') {
        setTimeout(() => playChime(), 200)
      }
    }

    setGameStatus({
      inCheck,
      isCheckmate,
      isDraw,
      winner,
    })
    setHistoryCount(game.history().length)
  }, [game])

  // Back button handler
  const handleBack = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    if (onBack) {
      onBack()
    } else {
      window.location.hash = '#/briefing/chess'
    }
  }

  // Restart / Reset game
  const handleReset = () => {
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    gameRef.current = createGame()
    const newFen = gameRef.current.fen()
    setFen(newFen)
    setFenHistory([newFen])
    setHistoryIndex(0)
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)
    setLastMove(null)
    setGameStatus({
      inCheck: false,
      isCheckmate: false,
      isDraw: false,
      winner: null,
    })
    setHistoryCount(0)
  }

  // Changing difficulty resets the board cleanly
  const handleDifficultyChange = (newDiff) => {
    if (difficulty === newDiff) return
    playTap()
    setDifficulty(newDiff)
    if (botTimerRef.current) clearTimeout(botTimerRef.current)
    gameRef.current = createGame()
    const newFen = gameRef.current.fen()
    setFen(newFen)
    setFenHistory([newFen])
    setHistoryIndex(0)
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)
    setLastMove(null)
    setGameStatus({
      inCheck: false,
      isCheckmate: false,
      isDraw: false,
      winner: null,
    })
    setHistoryCount(0)
  }

  // Trigger bot's turn
  const triggerBotMove = useCallback(() => {
    setIsBotThinking(true)
    botTimerRef.current = setTimeout(() => {
      if (game.isGameOver()) {
        setIsBotThinking(false)
        updateGameStatus()
        return
      }

      const move = getBotMove(game, difficulty)
      if (move) {
        const result = makeMove(game, move)
        playTap()
        const nextFen = game.fen()
        setFen(nextFen)
        setFenHistory((prev) => {
          const nextHist = [...prev.slice(0, historyIndex + 1), nextFen]
          setHistoryIndex(nextHist.length - 1)
          return nextHist
        })
        setLastMove({ from: move.from, to: move.to })
        updateGameStatus()
      }
      setIsBotThinking(false)
    }, 400)
  }, [game, difficulty, historyIndex, updateGameStatus])

  // Handle square click
  const handleSquareClick = (square) => {
    if (isBotThinking || gameStatus.isCheckmate || gameStatus.isDraw) return

    const piece = game.get(square)
    const isCurrentTurnPiece = piece && piece.color === 'w'

    // If clicking on one of player's pieces
    if (isCurrentTurnPiece) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // Select this piece and compute targets
        setSelectedSquare(square)
        setValidMoves(getValidMoves(game, square))
      }
      return
    }

    // If a piece is already selected and target square is a valid move
    if (selectedSquare && validMoves.includes(square)) {
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q',
      }
      const result = makeMove(game, move)
      if (result.success) {
        playTap()
        setFen(game.fen())
        setLastMove({ from: selectedSquare, to: square })
        setSelectedSquare(null)
        setValidMoves([])
        updateGameStatus()

        // If game is not over, bot moves
        if (!result.isGameOver) {
          triggerBotMove()
        }
      }
      return
    }

    // Clicking elsewhere deselects
    if (selectedSquare) {
      setSelectedSquare(null)
      setValidMoves([])
    }
  }

  // Undo button handler: rolls back bot's move and user's move
  const handleUndo = () => {
    if (isBotThinking || historyCount === 0) return
    playTap()
    if (botTimerRef.current) clearTimeout(botTimerRef.current)

    // If it's user's turn (white) and at least 2 moves have been made, undo both bot and user
    if (game.turn() === 'w' && historyCount >= 2) {
      game.undo() // undo black (bot)
      game.undo() // undo white (user)
    } else {
      game.undo()
    }

    setFen(game.fen())
    setSelectedSquare(null)
    setValidMoves([])
    setIsBotThinking(false)

    // Restore previous move on Undo
    const history = game.history({ verbose: true })
    if (history.length > 0) {
      const last = history[history.length - 1]
      setLastMove({ from: last.from, to: last.to })
    } else {
      setLastMove(null)
    }

    updateGameStatus()
  }

  // Board layout 8x8: rank 8 down to 1 (r: 0..7), file a through h (c: 0..7)
  const rows = [0, 1, 2, 3, 4, 5, 6, 7]
  const cols = [0, 1, 2, 3, 4, 5, 6, 7]

  // Determine turn text
  let statusNotice = ''
  if (gameStatus.isCheckmate) {
    statusNotice = gameStatus.winner === 'w' ? 'Checkmate — Victory' : 'Checkmate — Defeat'
  } else if (gameStatus.isDraw) {
    statusNotice = 'Stalemate — Draw'
  } else if (gameStatus.inCheck) {
    statusNotice = game.turn() === 'w' ? 'Check — Your King is under attack' : 'Check!'
  }

  return (
    <div className="chess-page game-screen-container">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <GameHeader title="Chess" onBack={handleBack} />

      {/* ── Difficulty Selector ─────────────────────────────── */}
      <DifficultyTabs
        currentTier={difficulty}
        onSelectTier={(level) => handleDifficultyChange(level)}
        tiers={[
          { id: 'casual', label: 'Gentle', subtitle: 'Casual' },
          { id: 'standard', label: 'Standard', subtitle: 'Balanced' },
          { id: 'master', label: 'Deep', subtitle: 'Master' },
        ]}
      />

      {/* ── Status Bar ──────────────────────────────────────── */}
      <div className="chess-status-bar">
        <div
          className={`chess-turn-pill ${
            isBotThinking ? 'chess-turn-pill--thinking' : 'chess-turn-pill--player'
          }`}
        >
          <span className="chess-turn-dot" />
          <span className="chess-turn-text">
            {gameStatus.isCheckmate
              ? 'Game Over'
              : gameStatus.isDraw
              ? 'Draw'
              : isBotThinking
              ? 'Contemplating...'
              : 'Your Move'}
          </span>
        </div>

        {statusNotice && (
          <div
            className={`chess-notice ${
              gameStatus.isCheckmate
                ? gameStatus.winner === 'w'
                  ? 'chess-notice--victory'
                  : 'chess-notice--defeat'
                : 'chess-notice--check'
            }`}
          >
            {statusNotice}
          </div>
        )}
      </div>

      {/* ── 8x8 Chess Board ──────────────────────────────────── */}
      <div className="chess-board-wrap">
        <div
          className="chess-board"
          role="grid"
          aria-label="Chess 8x8 Board"
        >
          {rows.map((r) =>
            cols.map((c) => {
              const file = String.fromCharCode(97 + c)
              const rank = 8 - r
              const square = `${file}${rank}`
              const isLight = (r + c) % 2 === 0
              const isDark = !isLight
              const piece = displayGame.get(square)
              const isSelected = selectedSquare === square && !isInspecting
              const isTarget = validMoves.includes(square) && !isInspecting
              const isCapture = isTarget && piece && piece.color !== 'w'
              const isLastMoveSquare =
                lastMove && (lastMove.from === square || lastMove.to === square)
              const isCheckedKing =
                !isInspecting &&
                gameStatus.inCheck &&
                piece &&
                piece.type === 'k' &&
                piece.color === game.turn()

              return (
                <button
                  key={square}
                  id={`chess-sq-${square}`}
                  className={`chess-square ${
                    isLight ? 'chess-square--light' : 'chess-square--dark'
                  } ${isSelected ? 'chess-square--selected' : ''} ${
                    isLastMoveSquare ? 'chess-square--last' : ''
                  } ${isCheckedKing ? 'chess-square--check' : ''}`}
                  onClick={() => handleSquareClick(square)}
                  disabled={isInspecting}
                  aria-label={`${square}: ${
                    piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : 'Empty'
                  }`}
                >
                  {/* Subtle coordinate labels */}
                  {c === 0 && <span className="chess-coord chess-coord--rank">{rank}</span>}
                  {r === 7 && <span className="chess-coord chess-coord--file">{file}</span>}

                  {/* Piece glyph */}
                  {piece && (
                    <span
                      className={`chess-piece chess-piece--${piece.color} ${
                        isSelected ? 'chess-piece--selected' : ''
                      }`}
                    >
                      {UNICODE_PIECES[piece.color][piece.type]}
                    </span>
                  )}

                  {/* Move Hint: Subtle circle dot on empty reachable squares */}
                  {isTarget && !isCapture && <span className="chess-hint-dot" />}

                  {/* Move Hint: Distinct ring around squares with enemy pieces */}
                  {isCapture && <span className="chess-hint-ring" />}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Controls: Reset & Stepper Actions */}
      <div className="chess-footer-controls">
        <GameFooterActions
          onReset={handleReset}
          resetLabel="Restart"
          onStepBack={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
          onStepForward={() => setHistoryIndex((prev) => Math.min(fenHistory.length - 1, prev + 1))}
          canStepBack={historyIndex > 0}
          canStepForward={historyIndex < fenHistory.length - 1}
          stepIndicator={fenHistory.length > 1 ? `Move ${historyIndex}/${fenHistory.length - 1}` : null}
          isInspecting={isInspecting}
          onExitInspection={() => setHistoryIndex(fenHistory.length - 1)}
        />
      </div>

      {/* Universal Completion Modal */}
      <GameCompletionModal
        isOpen={gameStatus.isCheckmate || gameStatus.isDraw}
        title={
          gameStatus.isCheckmate
            ? gameStatus.winner === 'w'
              ? 'Checkmate - Victory'
              : 'Checkmate - Defeat'
            : 'Stalemate - Draw'
        }
        description={
          gameStatus.isCheckmate
            ? gameStatus.winner === 'w'
              ? 'The system yields in stillness.'
              : 'The opponent found checkmate.'
            : 'No legal moves remain in balance.'
        }
        icon={gameStatus.winner === 'w' ? '✓' : '❖'}
        stats={[
          { label: 'Result', value: gameStatus.winner === 'w' ? 'Victory' : gameStatus.winner === 'b' ? 'Defeat' : 'Draw' },
          { label: 'Tier', value: difficulty },
          { label: 'Plies', value: `${fenHistory.length - 1}` },
        ]}
        onNext={handleReset}
        nextLabel="New Game"
        onReplay={handleReset}
        replayLabel="Replay"
        reviewLabel="Review Board"
      />
    </div>
  )
}

export default ChessScreen
