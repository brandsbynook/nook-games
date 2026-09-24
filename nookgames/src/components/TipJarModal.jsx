import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Purchases } from '@revenuecat/purchases-capacitor'
import { playTap, playChime } from '../utils/audio.js'

export const TIP_TIERS = [
  {
    id: 'spark',
    title: 'Pawn',
    subtitle: 'A quiet gesture of appreciation',
    price: '$4.99',
    icon: '♟',
    productIds: ['nook_games_tip_spark', 'nook_tip_leaf', 'tip_spark'],
  },
  {
    id: 'focus',
    title: 'Knight',
    subtitle: 'Fair value for the full game suite',
    price: '$6.99',
    icon: '♞',
    productIds: ['nook_games_tip_focus', 'nook_tip_hearth', 'tip_focus'],
  },
  {
    id: 'atelier',
    title: 'Keeper',
    subtitle: 'Sustains independent, tracker-free craft',
    price: '$9.99',
    icon: '◬',
    productIds: ['nook_games_tip_atelier', 'nook_tip_sanctuary', 'tip_atelier'],
  },
]

export function TipJarModal({ isOpen, onClose }) {
  const [selectedTierId, setSelectedTierId] = useState('focus')
  const [liveStoreItems, setLiveStoreItems] = useState({})
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTierId('focus')
      setIsSuccess(false)
      setIsPurchasing(false)
      setErrorMessage(null)
      return
    }

    let isMounted = true

    async function fetchStorePrices() {
      if (!Capacitor.isNativePlatform()) return

      try {
        const itemMap = {}

        // 1. Check Offerings first
        try {
          const offerings = await Purchases.getOfferings()
          const currentPackages = offerings?.current?.availablePackages || []

          for (const tier of TIP_TIERS) {
            const matchedPkg = currentPackages.find((pkg) => {
              const prodId = pkg?.product?.identifier || pkg?.identifier
              return tier.productIds.includes(prodId)
            })
            if (matchedPkg) {
              itemMap[tier.id] = {
                priceString: matchedPkg.product?.priceString || matchedPkg.product?.price_string || tier.price,
                package: matchedPkg,
                product: matchedPkg.product,
              }
            }
          }
        } catch {
          // Offerings fallback
        }

        // 2. Query products directly for any tiers not matched yet
        const missingTiers = TIP_TIERS.filter((tier) => !itemMap[tier.id])
        if (missingTiers.length > 0) {
          const allProductIds = missingTiers.flatMap((t) => t.productIds)
          try {
            const res = await Purchases.getProducts({ productIdentifiers: allProductIds })
            const products = res?.products || []

            for (const tier of missingTiers) {
              const matchedProd = products.find((prod) => tier.productIds.includes(prod.identifier))
              if (matchedProd) {
                itemMap[tier.id] = {
                  priceString: matchedProd.priceString || matchedProd.price_string || tier.price,
                  product: matchedProd,
                }
              }
            }
          } catch {
            // Products fallback
          }
        }

        if (isMounted) {
          setLiveStoreItems(itemMap)
        }
      } catch (err) {
        console.warn('RevenueCat price fetch skipped or failed:', err)
      }
    }

    fetchStorePrices()

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
  const currentPrice = liveStoreItems[selectedTier.id]?.priceString || selectedTier.price

  async function handlePurchase() {
    if (isPurchasing) return
    playTap()
    setIsPurchasing(true)
    setErrorMessage(null)

    const liveItem = liveStoreItems[selectedTier.id]

    if (Capacitor.isNativePlatform()) {
      try {
        if (liveItem?.package) {
          await Purchases.purchasePackage({ aPackage: liveItem.package })
        } else if (liveItem?.product) {
          await Purchases.purchaseStoreProduct({ product: liveItem.product })
        } else {
          // Attempt direct product query and purchase
          const prodId = selectedTier.productIds[0]
          const { products } = await Purchases.getProducts({ productIdentifiers: [prodId] })
          if (products && products.length > 0) {
            await Purchases.purchaseStoreProduct({ product: products[0] })
          } else {
            throw new Error('Product not found in store.')
          }
        }

        playChime()
        setIsSuccess(true)
      } catch (err) {
        // Handle user cancellation gracefully
        const isUserCancelled =
          err?.userCancelled === true ||
          err?.code === '1' ||
          err?.code === 1 ||
          err?.message?.toLowerCase().includes('cancel')

        if (!isUserCancelled) {
          console.error('Tip purchase error:', err)
          setErrorMessage(err?.message || 'Unable to complete contribution. Please try again.')
        }
      } finally {
        setIsPurchasing(false)
      }
    } else {
      // Graceful simulated delay for Web test environment
      setTimeout(() => {
        setIsPurchasing(false)
        playChime()
        setIsSuccess(true)
      }, 600)
    }
  }

  function handleSelectTier(tierId) {
    if (isPurchasing) return
    playTap()
    setSelectedTierId(tierId)
    setErrorMessage(null)
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
        {/* Top-Right Close Button */}
        <button
          type="button"
          className="tip-modal-close-btn"
          onClick={() => {
            playTap()
            onClose?.()
          }}
          disabled={isPurchasing}
          aria-label="Close tip jar"
        >
          ✕
        </button>

        {isSuccess ? (
          /* ── Clean Success State ──────────────────────────────── */
          <div className="tip-modal-success">
            <div className="tip-modal-success-icon" aria-hidden="true">
              ✦
            </div>
            <h2 id="tip-modal-title" className="tip-modal-title">
              Thank you so much.
            </h2>
            <p className="tip-modal-success-desc">
              Your quiet generosity keeps nook games free of ads, tracking, and noise.
            </p>
            <button
              type="button"
              className="tip-modal-action-btn"
              onClick={() => {
                playTap()
                onClose?.()
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Main Contribution Tier Selection ────────────────── */
          <div className="tip-modal-content">
            <div className="tip-modal-header">
              <div className="tip-modal-badge-icon" aria-hidden="true">
                ✦
              </div>
              <h2 id="tip-modal-title" className="tip-modal-title">
                Tip Jar
              </h2>
              <p className="tip-modal-subtitle">
                Support quiet craftsmanship and ad-free games
              </p>
            </div>

            {errorMessage && (
              <div className="tip-modal-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* 3-Column Selectable Grid */}
            <div className="tip-modal-grid" role="radiogroup" aria-label="Contribution Tiers">
              {TIP_TIERS.map((tier) => {
                const isSelected = selectedTierId === tier.id
                const displayPrice = liveStoreItems[tier.id]?.priceString || tier.price

                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`tip-tier-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectTier(tier.id)}
                    disabled={isPurchasing}
                  >
                    <div className="tip-tier-icon" aria-hidden="true">
                      {tier.icon}
                    </div>
                    <span className="tip-tier-title">{tier.title}</span>
                    <span className="tip-tier-price">{displayPrice}</span>
                    <span className="tip-tier-sub">{tier.subtitle}</span>
                  </button>
                )
              })}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="tip-modal-action-btn"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? 'Processing...' : `Leave a ${currentPrice} Tip`}
            </button>

            {/* Reassuring Subtitle */}
            <p className="tip-modal-footnote">
              One-time contribution • No subscriptions
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TipJarModal
