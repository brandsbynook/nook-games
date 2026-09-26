import { useState, useEffect } from 'react'
import { TIP_TIERS, fetchTipOfferings, purchaseTip } from '../services/revenuecat.js'
import { playTap, playChime } from '../utils/audio.js'

export { TIP_TIERS }

function SparkOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3C12 7.8 7.8 12 3 12C7.8 12 12 16.2 12 21C12 16.2 16.2 12 21 12C16.2 12 12 7.8 12 3Z" />
    </svg>
  )
}

function KnightOutlineIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 20.5h15" />
      <path d="M6 18h12" />
      <path d="M6.5 18c0-3.5 1.5-5 2.2-6-1-.5-2.7-1.7-2.7-3s1-1.5 2-1.5h2c1-1.2 1.7-3 2.5-4.5.6-.7 1.5-.3 1.2.7l-.4 1.8c2.7 1.5 4.7 5.5 4.7 12.5" />
      <path d="M14 9.5c1 2.2 1 5.2 1 8.5" />
      <circle cx="9.5" cy="9.5" r="0.75" />
    </svg>
  )
}

function AtelierArchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V10.5C5 6.9 8.1 4 12 4s7 2.9 7 6.5V21" />
      <path d="M8.5 21V11.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5V21" />
    </svg>
  )
}

function renderTierIcon(tierId) {
  if (tierId === 'spark') return <SparkOutlineIcon />
  if (tierId === 'focus') return <KnightOutlineIcon />
  if (tierId === 'atelier') return <AtelierArchIcon />
  return <SparkOutlineIcon />
}

export function TipJarModal({ isOpen, onClose, onSuccessToast }) {
  const [selectedTierId, setSelectedTierId] = useState('focus')
  const [tierDataMap, setTierDataMap] = useState({})
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fetch live offerings and localized prices when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedTierId('focus')
      setIsPurchasing(false)
      setErrorMessage(null)
      setIsSuccess(false)
      return
    }

    let isMounted = true

    async function loadOfferings() {
      try {
        const liveMap = await fetchTipOfferings()
        if (isMounted && liveMap) {
          setTierDataMap(liveMap)
        }
      } catch (err) {
        console.warn('[TipJarModal] Price fetch error:', err)
      }
    }

    loadOfferings()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !isPurchasing) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPurchasing, onClose])

  if (!isOpen) return null

  const selectedTier = TIP_TIERS.find((t) => t.id === selectedTierId) || TIP_TIERS[1]
  const currentItem = tierDataMap[selectedTier.id]
  const currentPrice = currentItem?.priceString || selectedTier.defaultPrice

  async function handleSelectTier(tierId) {
    if (isPurchasing) return
    playTap()
    setSelectedTierId(tierId)
    setErrorMessage(null)
  }

  async function handlePurchase() {
    if (isPurchasing) return
    playTap()
    setIsPurchasing(true)
    setErrorMessage(null)

    const itemToPurchase = tierDataMap[selectedTier.id] || {
      productId: selectedTier.productId,
      tier: selectedTier,
    }

    try {
      const result = await purchaseTip(itemToPurchase)

      if (result.success) {
        playChime()
        setIsSuccess(true)
        if (typeof onSuccessToast === 'function') {
          onSuccessToast('Thank you for supporting the parlor.')
        }
      } else if (result.userCancelled) {
        // Dismiss silently without any error alerts as requested
      } else if (result.error) {
        const message =
          result.error?.message ||
          'Unable to complete transaction. Please check your connection and try again.'
        setErrorMessage(message)
      }
    } catch (err) {
      console.error('[TipJarModal] Purchase uncaught error:', err)
      setErrorMessage('Unable to connect to Google Play. Please try again.')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div
      className="tip-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-modal-title"
      onClick={() => {
        if (!isPurchasing) onClose?.()
      }}
    >
      <div
        className="tip-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          className="tip-modal-close-btn"
          onClick={() => {
            playTap()
            onClose?.()
          }}
          disabled={isPurchasing}
          aria-label="Close modal"
        >
          ✕
        </button>

        {isSuccess ? (
          /* ── Quiet Success State ──────────────────────────────── */
          <div className="tip-modal-success">
            <div className="tip-modal-success-icon" aria-hidden="true">
              ✦
            </div>
            <h2 id="tip-modal-title" className="tip-modal-title">
              Thank you for your support.
            </h2>
            <p className="tip-modal-success-desc">
              Your quiet generosity helps keep nook games completely distraction-free, tracker-free, and ad-free.
            </p>
            <button
              type="button"
              className="tip-modal-action-btn"
              onClick={() => {
                playTap()
                onClose?.()
              }}
            >
              Return to Parlor
            </button>
          </div>
        ) : (
          /* ── Main Contribution Selection ──────────────────────── */
          <div className="tip-modal-content">
            <header className="tip-modal-header">
              <div className="tip-modal-badge-icon" aria-hidden="true">
                ✦
              </div>
              <h2 id="tip-modal-title" className="tip-modal-title">
                Support the Parlor
              </h2>
              <p className="tip-modal-subtitle">
                Distraction-free, ad-free indie games. If you enjoy your time here, consider leaving a small tip.
              </p>
            </header>

            {errorMessage && (
              <div className="tip-modal-error" role="alert">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 3 Active Consumable Tip Packages (Horizontal Side-by-Side Layout) */}
            <div className="tip-modal-tiers-list" role="radiogroup" aria-label="Support Tiers">
              {TIP_TIERS.map((tier) => {
                const isSelected = selectedTierId === tier.id
                const livePrice = tierDataMap[tier.id]?.priceString || tier.defaultPrice

                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`tip-tier-item${isSelected ? ' is-selected' : ''}`}
                    onClick={() => handleSelectTier(tier.id)}
                    disabled={isPurchasing}
                  >
                    <div className="tip-tier-icon-wrap" aria-hidden="true">
                      {renderTierIcon(tier.id)}
                    </div>

                    <div className="tip-tier-body">
                      <span className="tip-tier-title">{tier.title}</span>
                    </div>

                    <div className="tip-tier-footer">
                      <span className="tip-tier-price-pill">{livePrice}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Primary Action Button with subtle spinner */}
            <button
              type="button"
              className="tip-modal-action-btn"
              onClick={handlePurchase}
              disabled={isPurchasing}
              id="tip-modal-submit-btn"
            >
              {isPurchasing ? (
                <span className="tip-spinner-wrap">
                  <span className="tip-spinner" aria-hidden="true" />
                  <span>Connecting to Google Play...</span>
                </span>
              ) : (
                `Leave a ${currentPrice} Tip`
              )}
            </button>

            <footer className="tip-modal-footnote">
              One-time tip • Repeatable anytime • No subscriptions
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}

export default TipJarModal
