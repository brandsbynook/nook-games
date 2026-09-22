import { Icon } from './Icons'
import { playTap } from '../utils/audio.js'

export function GameFooterActions({
  onReset,
  onUndo,
  onHint,
  onNewGame,
  onStepBack,
  onStepForward,
  canUndo = true,
  canHint = true,
  canStepBack = false,
  canStepForward = false,
  stepIndicator = null,
  isInspecting = false,
  onExitInspection = null,
  resetLabel = 'Reset',
  undoLabel = 'Undo',
  hintLabel = 'Hint',
  newGameLabel = 'New Game',
  children,
  className = '',
}) {
  const hasStepper = typeof onStepBack === 'function' || typeof onStepForward === 'function';

  return (
    <div className={`game-footer-actions-wrapper ${isInspecting ? 'game-footer-actions-wrapper--inspecting' : ''}`}>

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

        {hasStepper && (
          <div className="game-history-stepper" role="group" aria-label="Move history navigation">
            <button
              type="button"
              className="game-step-btn"
              onClick={() => {
                playTap()
                onStepBack?.()
              }}
              disabled={!canStepBack}
              aria-label="Previous State"
              title="Previous State (‹)"
            >
              ‹
            </button>

            {stepIndicator && (
              <span className={`game-step-indicator ${isInspecting ? 'active' : ''}`}>
                {stepIndicator}
              </span>
            )}

            <button
              type="button"
              className="game-step-btn"
              onClick={() => {
                playTap()
                onStepForward?.()
              }}
              disabled={!canStepForward}
              aria-label="Next State"
              title="Next State (›)"
            >
              ›
            </button>
          </div>
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
    </div>
  )
}

export default GameFooterActions
