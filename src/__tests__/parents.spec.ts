import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import { GAME_IDS } from '@/lib/games'
import { initialOf } from '@/lib/i18n'
import { LOCK_MS, MAX_TRIES, useGate } from '@/stores/gate'
import { useSettings } from '@/stores/settings'
import { useStats } from '@/stores/stats'
import { useUsage } from '@/stores/usage'

/** Simulates an app restart: new stores, same localStorage. */
function restart() {
  setActivePinia(createPinia())
}

beforeEach(() => {
  localStorage.clear()
  restart()
})

describe('parental gate lock', () => {
  it('locks after the maximum number of wrong answers', () => {
    const gate = useGate()
    const now = 1_000_000
    for (let i = 1; i < MAX_TRIES; i++) expect(gate.fail(now)).toBe(false)
    expect(gate.remaining(now)).toBe(0)
    expect(gate.fail(now)).toBe(true)
    expect(gate.remaining(now)).toBe(LOCK_MS)
    expect(gate.remaining(now + LOCK_MS)).toBe(0)
  })

  it('stays locked across an app restart', () => {
    const gate = useGate()
    for (let i = 0; i < MAX_TRIES; i++) gate.fail()
    restart()
    expect(useGate().remaining()).toBeGreaterThan(0)
  })

  it('starts fresh after the lock ran out or a correct answer', () => {
    const gate = useGate()
    const now = 1_000_000
    for (let i = 0; i < MAX_TRIES; i++) gate.fail(now)
    // One wrong answer after the lock must not lock again right away.
    expect(gate.fail(now + LOCK_MS + 1)).toBe(false)
    gate.succeed()
    expect(gate.tries).toBe(0)
    expect(gate.remaining(now)).toBe(0)
  })
})

describe('daily limit', () => {
  it('never limits when set to 0', () => {
    const usage = useUsage()
    for (let i = 0; i < 100; i++) usage.tick()
    expect(usage.limitReached).toBe(false)
  })

  it('is reached after the configured minutes', () => {
    const settings = useSettings()
    const usage = useUsage()
    settings.dailyLimit = 1
    for (let i = 0; i < 59; i++) usage.tick()
    expect(usage.limitReached).toBe(false)
    usage.tick()
    expect(usage.limitReached).toBe(true)
    expect(usage.minutes).toBe(1)
  })

  it('keeps the play time across restarts and can be reset', () => {
    const usage = useUsage()
    for (let i = 0; i < 90; i++) usage.tick()
    restart()
    expect(useUsage().minutes).toBe(1)
    useUsage().reset()
    expect(useUsage().minutes).toBe(0)
  })
})

describe('hiding games', () => {
  it('hides and shows a game and remembers it', async () => {
    const settings = useSettings()
    settings.toggleGame('memory', GAME_IDS.length)
    expect(settings.hiddenGames).toEqual(['memory'])
    await nextTick() // settings are saved by a watcher
    restart()
    expect(useSettings().hiddenGames).toEqual(['memory'])
    useSettings().toggleGame('memory', GAME_IDS.length)
    expect(useSettings().hiddenGames).toEqual([])
  })

  it('always keeps one game visible', () => {
    const settings = useSettings()
    for (const id of GAME_IDS) settings.toggleGame(id, GAME_IDS.length)
    expect(settings.hiddenGames).toHaveLength(GAME_IDS.length - 1)
  })
})

describe('learning overview', () => {
  it('counts opens, rounds and seconds per game', () => {
    const stats = useStats()
    stats.open('memory')
    stats.finishRound('memory')
    stats.addSecond('memory')
    expect(stats.games.memory).toEqual({ opens: 1, rounds: 1, seconds: 1 })
  })

  it('ignores screens that are not games', () => {
    const stats = useStats()
    stats.open('home')
    stats.addSecond('album')
    expect(stats.games).toEqual({})
  })
})

describe('letters game', () => {
  it('uses the first letter of the animal name', () => {
    expect(initialOf('cow', 'de')).toBe('K')
    expect(initialOf('lion', 'de')).toBe('L')
    expect(initialOf('cow', 'en')).toBe('C')
  })
})
