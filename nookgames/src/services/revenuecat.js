import { Purchases } from '@revenuecat/purchases-capacitor'
import { Capacitor } from '@capacitor/core'

const ENTITLEMENT_IDS = ['patron', 'ateliers_patron']

let isInitialized = false

/**
 * Initializes RevenueCat Purchases on native platforms with the configured public API key.
 */
export async function initRevenueCat() {
  if (isInitialized) return true

  if (!Capacitor.isNativePlatform()) {
    // Purchases-capacitor is only active on native iOS/Android runtimes
    return false
  }

  const apiKey =
    import.meta.env.VITE_REVENUECAT_PUBLIC_KEY ||
    import.meta.env.VITE_REVENUECAT_API_KEY

  if (!apiKey) {
    console.warn('[RevenueCat] Missing VITE_REVENUECAT_PUBLIC_KEY in environment.')
    return false
  }

  try {
    await Purchases.configure({ apiKey })
    isInitialized = true
    return true
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error)
    return false
  }
}

/**
 * Checks if the user currently holds an active 'patron' or 'ateliers_patron' entitlement.
 * @returns {Promise<boolean>}
 */
export async function checkPatronStatus() {
  if (!Capacitor.isNativePlatform() || !isInitialized) {
    // In web / dev mode, check local storage patron status as fallback
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
    // Web / dev fallback simulation
    return { success: true, simulated: true }
  }

  try {
    await initRevenueCat()
    const offerings = await Purchases.getOfferings()
    const currentOffering = offerings?.current

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
    // User cancelled or billing error
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
