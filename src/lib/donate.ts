import { Capacitor } from '@capacitor/core'

// The coffee box: optional donations from parents, sold as consumable in-app products through the
// App Store / Google Play. Payment, receipts and identity stay entirely with Apple/Google – the app
// never sees who paid and sends nothing to any server of its own.
// Create the four products (type "consumable" / "managed product") in App Store Connect and
// Play Console with exactly these IDs and CHF prices 2, 5, 10, 20 (see docs/RELEASE.md).

export const COFFEE_AMOUNTS = [2, 5, 10, 20] as const
export type CoffeeAmount = (typeof COFFEE_AMOUNTS)[number]

export type DonationResult = 'thanks' | 'cancelled' | 'error'

export function productId(amount: CoffeeAmount): string {
  return `ch.lumikids.app.coffee${amount}`
}

/** In-app purchases only exist in the store builds, not in the browser. */
export function donationsAvailable(): boolean {
  return Capacitor.isNativePlatform()
}

async function plugin() {
  return (await import('@capgo/native-purchases')).NativePurchases
}

/** Localised prices from the store (e.g. "CHF 5.00"); amounts the store doesn't know are left out. */
export async function loadPrices(): Promise<Partial<Record<CoffeeAmount, string>>> {
  if (!donationsAvailable()) return {}
  try {
    const NativePurchases = await plugin()
    const { isBillingSupported } = await NativePurchases.isBillingSupported()
    if (!isBillingSupported) return {}
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: COFFEE_AMOUNTS.map(productId),
    })
    const prices: Partial<Record<CoffeeAmount, string>> = {}
    for (const amount of COFFEE_AMOUNTS) {
      const product = products.find((p) => p.identifier === productId(amount))
      if (product) prices[amount] = product.priceString
    }
    return prices
  } catch {
    return {}
  }
}

export async function donate(amount: CoffeeAmount): Promise<DonationResult> {
  if (!donationsAvailable()) return 'error'
  try {
    const NativePurchases = await plugin()
    await NativePurchases.purchaseProduct({
      productIdentifier: productId(amount),
      // Android needs consumables to be consumed, otherwise the same amount can't be donated twice.
      isConsumable: true,
    })
    return 'thanks'
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return /cancel/i.test(message) ? 'cancelled' : 'error'
  }
}
