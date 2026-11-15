import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { MAX_TRUST, ROUNDS_PER_HEART, useFriendship } from '@/stores/friendship'
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

describe('rounds', () => {
  it('earns a heart after every few finished rounds', () => {
    const friendship = useFriendship()
    for (let i = 1; i < ROUNDS_PER_HEART; i++) expect(friendship.finishRound()).toBe(false)
    expect(friendship.trust).toBe(0)
    expect(friendship.finishRound()).toBe(true)
    expect(friendship.trust).toBe(1)
  })

  it('remembers the progress towards the next heart', () => {
    useFriendship().finishRound()
    setActivePinia(createPinia())
    expect(useFriendship().rounds).toBe(1)
  })

  it('stops counting once Galip trusts the child fully', () => {
    const friendship = useFriendship()
    for (let i = 0; i < MAX_TRUST * ROUNDS_PER_HEART; i++) friendship.finishRound()
    expect(friendship.trust).toBe(MAX_TRUST)
    expect(friendship.finishRound()).toBe(false)
  })
})

describe('quiet mode', () => {
  it('is on by default so a noise-sensitive dog stays relaxed', () => {
    expect(useSettings().soft).toBe(true)
  })
})
