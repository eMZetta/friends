import { describe, expect, it } from 'vitest'

import { COFFEE_AMOUNTS, donate, donationsAvailable, loadPrices, productId } from '@/lib/donate'

describe('coffee box', () => {
  it('offers CHF 2, 5, 10 and 20 with matching store product IDs', () => {
    expect(COFFEE_AMOUNTS).toEqual([2, 5, 10, 20])
    expect(COFFEE_AMOUNTS.map(productId)).toEqual([
      'ch.lumikids.app.coffee2',
      'ch.lumikids.app.coffee5',
      'ch.lumikids.app.coffee10',
      'ch.lumikids.app.coffee20',
    ])
  })

  it('cannot take donations in the browser', async () => {
    expect(donationsAvailable()).toBe(false)
    expect(await loadPrices()).toEqual({})
    expect(await donate(5)).toBe('error')
  })
})
