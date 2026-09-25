import { useState, useEffect } from 'react'
import { TIP_TIERS, fetchTipOfferings, purchaseTip } from '../services/revenuecat.js'
import { playTap, playChime } from '../utils/audio.js'

export { TIP_TIERS }

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

            {/* 3 Active Consumable Tip Packages */}
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
                    <div className="tip-tier-left">
                      <span className="tip-tier-icon" aria-hidden="true">
                        {tier.icon}
                      </span>
                      <div className="tip-tier-texts">
                        <div className="tip-tier-title-row">
                          <span className="tip-tier-title">{tier.title}</span>
                        </div>
                        <span className="tip-tier-desc">{tier.subtitle}</span>
                      </div>
                    </div>

                    <div className="tip-tier-right">
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
