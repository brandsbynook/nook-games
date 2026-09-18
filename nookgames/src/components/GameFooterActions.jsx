import { Icon } from '../icons.jsx'
import { playTap } from '../utils/audio.js'

export function GameFooterActions({
  onReset,
  onUndo,
  onHint,
  onNewGame,
  canUndo = true,
  canHint = true,
  resetLabel = 'Reset',
  undoLabel = 'Undo',
  hintLabel = 'Hint',
  newGameLabel = 'New Game',
  children,
  className = '',
}) {
  return (
    <div className={`game-footer-actions ${className}`.trim()} role="toolbar" aria-label="Game controls">
      {onReset && (
        <button
          type="button"
          className="game-action-btn"
          onClick={() => {
            playTap()
            onReset()
          }}
          aria-label={resetLabel}
        >
          <Icon name="restart" size={16} />
          <span>{resetLabel}</span>
        </button>
      )}

      {onUndo && (
        <button
          type="button"
          className="game-action-btn"
          onClick={() => {
            playTap()
            onUndo()
          }}
          disabled={!canUndo}
          aria-label={undoLabel}
        >
          <Icon name="undo" size={16} />
          <span>{undoLabel}</span>
        </button>
      )}

      {onHint && (
        <button
          type="button"
          className="game-action-btn"
          onClick={() => {
            playTap()
            onHint()
          }}
          disabled={!canHint}
          aria-label={hintLabel}
        >
          <Icon name="hint" size={16} />
          <span>{hintLabel}</span>
        </button>
      )}

      {onNewGame && (
        <button
          type="button"
          className="game-action-btn"
          onClick={() => {
            playTap()
            onNewGame()
          }}
          aria-label={newGameLabel}
        >
          <Icon name="sparkles" size={16} />
          <span>{newGameLabel}</span>
        </button>
      )}

      {children}
    </div>
  )
}
