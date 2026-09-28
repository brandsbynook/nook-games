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
  hideOnReview = true,
  isReviewing = false,
  onExitInspection = null,
  resetLabel = 'Reset',
  resetIcon = null,
  undoLabel = 'Undo',
  hintLabel = 'Hint',
  newGameLabel = 'New Game',
  children,
  className = '',
}) {
  const hasStepper = typeof onStepBack === 'function' || typeof onStepForward === 'function';
  const isReviewActive = (hideOnReview && isReviewing) || (hideOnReview && typeof document !== 'undefined' && Boolean(document.querySelector('.game-review-pill')));
  const shouldHideActions = isInspecting || isReviewActive;

  if (shouldHideActions && !hasStepper) {
    return null;
  }

  return (
    <div className={`game-footer-actions-wrapper ${isInspecting ? 'game-footer-actions-wrapper--inspecting' : ''}`}>

      <div className={`game-footer-actions ${className}`.trim()} role="toolbar" aria-label="Game controls">
        {!shouldHideActions && onReset && (
          <button
            type="button"
            className="game-action-btn"
            onClick={() => {
              playTap()
              onReset()
            }}
            aria-label={resetLabel}
          >
            <Icon name={resetIcon || (resetLabel.toLowerCase() === 'rotate' ? 'refresh' : 'restart')} size={16} />
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

        {!shouldHideActions && onUndo && (
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

        {!shouldHideActions && onHint && (
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

        {!shouldHideActions && onNewGame && (
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

        {!shouldHideActions && children}
      </div>
    </div>
  )
}

export default GameFooterActions
