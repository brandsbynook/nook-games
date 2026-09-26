import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'
import { Capacitor } from '@capacitor/core'

export const REVENUECAT_ANDROID_PUBLIC_KEY = 'goog_KcaJJIFZQOdfcmMHnqhjkdwbZQr'

export const TIP_TIERS = [
  {
    id: 'spark',
    productId: 'nook_games_tip_spark',
    title: 'Quiet Spark',
    subtitle: 'Support indie craft.',
    defaultPrice: '$4.99',
    icon: '✦',
    badge: 'Spark',
  },
  {
    id: 'focus',
    productId: 'nook_games_tip_focus',
    title: 'Steady Ember',
    subtitle: 'Fuel the parlor.',
    defaultPrice: '$6.99',
    icon: '♞',
    badge: 'Ember',
  },
  {
    id: 'atelier',
    productId: 'nook_games_tip_atelier',
    title: 'Atelier Patron',
    subtitle: 'Distraction-free craft.',
    defaultPrice: '$9.99',
    icon: '∆',
    badge: 'Patron',
  },
]

const ENTITLEMENT_IDS = ['patron', 'ateliers_patron']

let isInitialized = false

/**
 * Initializes RevenueCat Purchases on native platforms with the configured public API key.
 * Enables DEBUG logs in development mode.
 */
export async function initRevenueCat() {
  if (isInitialized) return true

  if (!Capacitor.isNativePlatform()) {
    return false
  }

  const apiKey =
    import.meta.env.VITE_REVENUECAT_PUBLIC_KEY ||
    import.meta.env.VITE_REVENUECAT_API_KEY ||
    REVENUECAT_ANDROID_PUBLIC_KEY

  try {
    if (import.meta.env.DEV) {
      try {
        await Purchases.setLogLevel({ level: LOG_LEVEL?.DEBUG || 'DEBUG' })
      } catch (logErr) {
        console.warn('[RevenueCat] Could not set debug log level:', logErr)
      }
    }

    await Purchases.configure({ apiKey })
    isInitialized = true
    return true
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error)
    return false
  }
}

/**
 * Fetches the default offering from RevenueCat and binds the 3 tip packages.
 * Dynamically extracts each package's localized price string.
 * @returns {Promise<Record<string, { priceString: string, package?: object, product?: object }>>}
 */
export async function fetchTipOfferings() {
  const result = {}

  // Populate default fallback prices
  for (const tier of TIP_TIERS) {
    result[tier.id] = {
      priceString: tier.defaultPrice,
      tier,
    }
  }

  if (!Capacitor.isNativePlatform()) {
    return result
  }

  try {
    await initRevenueCat()

    // 1. Fetch offerings — checking 'default' offering first
    const offerings = await Purchases.getOfferings()
    const defaultOffering =
      offerings?.all?.['default'] ||
      offerings?.current ||
      offerings?.all?.[Object.keys(offerings.all || {})[0]]

    const availablePackages = defaultOffering?.availablePackages || []

    for (const tier of TIP_TIERS) {
      const matchedPkg = availablePackages.find((pkg) => {
        const prodId = pkg?.product?.identifier
        const pkgId = pkg?.identifier
        return (
          prodId === tier.productId ||
          pkgId === tier.id ||
          pkgId === `$rc_${tier.id}` ||
          pkgId?.toLowerCase()?.includes(tier.id)
        )
      })

      if (matchedPkg) {
        const price =
          matchedPkg.product?.priceString ||
          matchedPkg.product?.price_string ||
          tier.defaultPrice

        result[tier.id] = {
          priceString: price,
          package: matchedPkg,
          product: matchedPkg.product,
          tier,
        }
      }
    }

    // 2. Query products directly for any tiers still without live packages
    const missingTiers = TIP_TIERS.filter((t) => !result[t.id]?.package)
    if (missingTiers.length > 0) {
      try {
        const prodIds = missingTiers.map((t) => t.productId)
        const { products } = await Purchases.getProducts({ productIdentifiers: prodIds })
        if (Array.isArray(products)) {
          for (const tier of missingTiers) {
            const matchedProd = products.find((p) => p.identifier === tier.productId)
            if (matchedProd) {
              result[tier.id] = {
                priceString:
                  matchedProd.priceString || matchedProd.price_string || tier.defaultPrice,
                product: matchedProd,
                tier,
              }
            }
          }
        }
      } catch (prodErr) {
        console.warn('[RevenueCat] Direct product fetch fallback error:', prodErr)
      }
    }

    return result
  } catch (err) {
    console.warn('[RevenueCat] fetchTipOfferings error:', err)
    return result
  }
}

/**
 * Purchases a consumable tip package or product.
 * Returns { success: true } on completion, { userCancelled: true } if cancelled, or { success: false, error }.
 * @param {object} item - Tip item containing package or product
 * @returns {Promise<{ success: boolean, userCancelled?: boolean, customerInfo?: object, error?: any }>}
 */
export async function purchaseTip(item) {
  if (!Capacitor.isNativePlatform()) {
    // Simulated purchase for development / browser environments
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { success: true, simulated: true }
  }

  try {
    await initRevenueCat()
    let purchaseResult = null

    if (item?.package) {
      purchaseResult = await Purchases.purchasePackage({ aPackage: item.package })
    } else if (item?.product) {
      purchaseResult = await Purchases.purchaseStoreProduct({ product: item.product })
    } else if (item?.productId) {
      const { products } = await Purchases.getProducts({ productIdentifiers: [item.productId] })
      if (products && products.length > 0) {
        purchaseResult = await Purchases.purchaseStoreProduct({ product: products[0] })
      } else {
        throw new Error('Tip tier product not available in store.')
      }
    } else {
      throw new Error('Invalid package selected for purchase.')
    }

    return {
      success: true,
      customerInfo: purchaseResult?.customerInfo,
      transaction: purchaseResult?.transaction,
    }
  } catch (error) {
    const isUserCancelled =
      error?.userCancelled === true ||
      error?.code === 1 ||
      error?.code === '1' ||
      error?.message?.toLowerCase().includes('cancel') ||
      error?.message?.toLowerCase().includes('user cancelled')

    if (isUserCancelled) {
      return { success: false, userCancelled: true }
    }

    console.error('[RevenueCat] purchaseTip error:', error)
    return { success: false, userCancelled: false, error }
  }
}

/**
 * Checks if the user currently holds an active 'patron' or 'ateliers_patron' entitlement.
 * @returns {Promise<boolean>}
 */
export async function checkPatronStatus() {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    try {
      return localStorage.getItem('nook_patron_status') === 'true'
    } catch {
      return false
    }
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    const activeEntitlements = customerInfo?.entitlements?.active || {}
    const hasPatron = ENTITLEMENT_IDS.some((id) => Boolean(activeEntitlements[id]))
    return hasPatron
  } catch (error) {
    console.warn('[RevenueCat] checkPatronStatus error:', error)
    try {
      return localStorage.getItem('nook_patron_status') === 'true'
    } catch {
      return false
    }
  }
}

/**
 * Fetches the current offering lifetime package and triggers the native purchase flow.
 * @returns {Promise<{ success: boolean, customerInfo?: object, error?: any }>}
 */
export async function purchasePatron() {
  if (!Capacitor.isNativePlatform()) {
    return { success: true, simulated: true }
  }

  try {
    await initRevenueCat()
    const offerings = await Purchases.getOfferings()
    const currentOffering = offerings?.current || offerings?.all?.['default']

    if (!currentOffering) {
      throw new Error('No current offerings configured in RevenueCat.')
    }

    const lifetimePkg =
      currentOffering.lifetime ||
      currentOffering.availablePackages?.[0]

    if (!lifetimePkg) {
      throw new Error('No available lifetime package in current offering.')
    }

    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: lifetimePkg,
    })

    const activeEntitlements = customerInfo?.entitlements?.active || {}
    const hasPatron = ENTITLEMENT_IDS.some((id) => Boolean(activeEntitlements[id]))

    return { success: hasPatron, customerInfo }
  } catch (error) {
    console.error('[RevenueCat] purchasePatron error:', error)
    return { success: false, error }
  }
}

/**
 * Restores user purchases and returns the updated entitlement status.
 * @returns {Promise<{ success: boolean, isPatron: boolean, customerInfo?: object, error?: any }>}
 */
export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) {
    const status = localStorage.getItem('nook_patron_status') === 'true'
    return { success: true, isPatron: status, simulated: true }
  }

  try {
    await initRevenueCat()
    const { customerInfo } = await Purchases.restorePurchases()
    const activeEntitlements = customerInfo?.entitlements?.active || {}
    const hasPatron = ENTITLEMENT_IDS.some((id) => Boolean(activeEntitlements[id]))

    return { success: true, isPatron: hasPatron, customerInfo }
  } catch (error) {
    console.error('[RevenueCat] restorePurchases error:', error)
    return { success: false, isPatron: false, error }
  }
}
