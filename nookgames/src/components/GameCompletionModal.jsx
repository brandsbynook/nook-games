import React, { useState } from 'react';
import { Icon } from './Icons';
import { playTap } from '../utils/audio.js';

export function GameCompletionModal({
  isOpen,
  title = 'Puzzle Complete',
  description = 'Pattern resolved cleanly in silence.',
  icon = '✓',
  onNext,
  nextLabel = 'Next Level',
  onReplay,
  replayLabel = 'Replay',
  reviewLabel = 'Review Board',
  stats,
  extraActions,
  children,
}) {
  const [isReviewing, setIsReviewing] = useState(false);

  if (!isOpen) return null;

  const handleToggleReview = (reviewState) => {
    playTap();
    setIsReviewing(reviewState);
  };

  if (isReviewing) {
    return (
      <div className="game-review-pill" role="region" aria-label="Reviewing solved board">
        <button
          type="button"
          className="game-review-btn game-review-btn--summary"
          onClick={() => handleToggleReview(false)}
          aria-label="View completion summary"
        >
          <Icon name="sparkles" size={14} />
          <span>View Result</span>
        </button>

        <div className="game-review-pill-actions">
          {onReplay && (
            <button
              type="button"
              className="game-review-btn game-review-btn--replay"
              onClick={() => {
                playTap();
                onReplay();
              }}
              aria-label={replayLabel}
            >
              <Icon name="restart" size={13} />
              <span>{replayLabel}</span>
            </button>
          )}

          {onNext && (
            <button
              type="button"
              className="game-review-btn game-review-btn--next"
              onClick={() => {
                playTap();
                onNext();
              }}
              aria-label={nextLabel}
            >
              <span>{nextLabel}</span>
              <Icon name="chevron" size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="game-completion-backdrop"
      onClick={() => handleToggleReview(true)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-completion-title"
    >
      <div
        className="game-completion-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="game-completion-icon">
          {typeof icon === 'string' ? (
            icon.length > 2 ? (
              <Icon name={icon} size={22} />
            ) : (
              <span>{icon}</span>
            )
          ) : (
            icon
          )}
        </div>

        <h2 id="game-completion-title" className="game-completion-title">
          {title}
        </h2>

        {description && (
          <p className="game-completion-desc">{description}</p>
        )}

        {Array.isArray(stats) && stats.length > 0 && (
          <div className="game-completion-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="game-completion-stat-item">
                <span className="game-completion-stat-label">{stat.label}</span>
                <span className="game-completion-stat-val">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {children}

        <div className="game-completion-actions">
          {onNext && (
            <button
              type="button"
              className="game-completion-btn-primary"
              onClick={() => {
                playTap();
                onNext();
              }}
            >
              {nextLabel}
            </button>
          )}

          {onReplay && (
            <button
              type="button"
              className="game-completion-btn-secondary"
              onClick={() => {
                playTap();
                onReplay();
              }}
            >
              {replayLabel}
            </button>
          )}

          <button
            type="button"
            className="game-completion-btn-tertiary"
            onClick={() => handleToggleReview(true)}
            aria-label={reviewLabel}
          >
            <Icon name="eye" size={14} />
            <span>{reviewLabel}</span>
          </button>

          {extraActions}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionModal;
