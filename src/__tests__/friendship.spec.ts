import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { MAX_TRUST, useFriendship } from '@/stores/friendship'
import { useSettings } from '@/stores/settings'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('friendship', () => {
  it('grows one heart at a time and reports the last one', () => {
    const friendship = useFriendship()
    for (let i = 1; i < MAX_TRUST; i++) expect(friendship.grow()).toBe(false)
    expect(friendship.grow()).toBe(true)
    expect(friendship.trust).toBe(MAX_TRUST)
    expect(friendship.grow()).toBe(false)
    expect(friendship.trust).toBe(MAX_TRUST)
  })

  it('keeps the hearts after a restart', () => {
    useFriendship().grow()
    useFriendship().grow()
    setActivePinia(createPinia())
    expect(useFriendship().trust).toBe(2)
  })
})

describe('quiet mode', () => {
  it('is on by default so a noise-sensitive dog stays relaxed', () => {
    expect(useSettings().soft).toBe(true)
  })
})
