import { beforeEach, describe, expect, it } from 'vitest'

import { introSeen, markIntroSeen } from '@/lib/intro'

beforeEach(() => localStorage.clear())

describe('intro', () => {
  it('is shown on the very first start', () => {
    expect(introSeen()).toBe(false)
  })

  it('is not shown again once it was seen', () => {
    markIntroSeen()
    expect(introSeen()).toBe(true)
  })

  it('is skipped for installations that already have progress', () => {
    localStorage.setItem('lumi.stickers', '["lumi"]')
    expect(introSeen()).toBe(true)
  })
})
