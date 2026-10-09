import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { InAppReview } from '@capacitor-community/in-app-review'
import { playTap } from '../utils/audio.js'
import { markReviewPromptResolved, markReviewPromptDismissed } from '../utils/storage.js'

export function ReviewModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        markReviewPromptDismissed()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleEnjoying() {
    playTap()
    markReviewPromptResolved('enjoying')
    const webFallbackUrl = 'https://play.google.com/store/apps/details?id=app.nook.games&showAllReviews=true'

    if (Capacitor.isNativePlatform()) {
      try {
        await InAppReview.requestReview()
      } catch (err) {
        console.warn('InAppReview failed, falling back to store URL', err)
        try {
          window.open(webFallbackUrl, '_blank', 'noopener,noreferrer')
        } catch {
          window.location.href = webFallbackUrl
        }
      }
    } else {
      window.open(webFallbackUrl, '_blank', 'noopener,noreferrer')
    }
    onClose?.()
  }

  function handleNeedsImprovement() {
    playTap()
    markReviewPromptResolved('needs_improvement')
    const mailtoUrl = 'mailto:brandsbynook@gmail.com?subject=nook%20games%20Feedback'
    window.location.href = mailtoUrl
    onClose?.()
  }

  function handleDismiss() {
    playTap()
    markReviewPromptDismissed()
    onClose?.()
  }

  return (
    <div
      className="rev-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rev-modal-title"
      onClick={handleDismiss}
    >
      <div
        className="rev-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          className="rev-modal-close-btn"
          onClick={handleDismiss}
          aria-label="Close review prompt"
        >
          ✕
        </button>

        <div className="rev-modal-content">
          {/* Calming Star Emblem */}
          <div className="rev-modal-badge" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>

          <h2 id="rev-modal-title" className="rev-modal-title">
            How is your experience with nook games?
          </h2>

          <p className="rev-modal-subtitle">
            A quiet sanctuary for your mind. Your thoughts help shape future updates.
          </p>

          <div className="rev-modal-actions">
            {/* Option 1: Enjoying it -> Play Store Review */}
            <button
              type="button"
              id="rev-enjoying-btn"
              className="rev-btn rev-btn--primary"
              onClick={handleEnjoying}
            >
              Enjoying it
            </button>

            {/* Option 2: Needs improvement -> Native Mail Client */}
            <button
              type="button"
              id="rev-needs-improvement-btn"
              className="rev-btn rev-btn--secondary"
              onClick={handleNeedsImprovement}
            >
              Needs improvement
            </button>

            {/* Subtle Dismiss Link */}
            <button
              type="button"
              id="rev-dismiss-btn"
              className="rev-btn rev-btn--tertiary"
              onClick={handleDismiss}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewModal
