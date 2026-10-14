import { defineStore } from 'pinia'
import { ref } from 'vue'

import { GAME_IDS } from '@/lib/games'

const STORAGE_KEY = 'lumi.stats'

export interface GameStats {
  opens: number
  rounds: number
  seconds: number
}

type StatsMap = Record<string, GameStats>

function load(): StatsMap {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StatsMap
    const stats: StatsMap = {}
    for (const id of GAME_IDS) {
      const s = data[id]
      if (s) stats[id] = { opens: s.opens || 0, rounds: s.rounds || 0, seconds: s.seconds || 0 }
    }
    return stats
  } catch {
    return {}
  }
}

/** What the child played, kept on the device only, for the parents' overview. */
export const useStats = defineStore('stats', () => {
  const games = ref<StatsMap>(load())

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games.value))
    } catch {
      // Without storage the overview only covers this session.
    }
  }

  function entry(game: string): GameStats | null {
    if (!(GAME_IDS as readonly string[]).includes(game)) return null
    return (games.value[game] ??= { opens: 0, rounds: 0, seconds: 0 })
  }

  function open(game: string) {
    const e = entry(game)
    if (!e) return
    e.opens++
    save()
  }

  function finishRound(game: string) {
    const e = entry(game)
    if (!e) return
    e.rounds++
    save()
  }

  function addSecond(game: string) {
    const e = entry(game)
    if (!e) return
    e.seconds++
    // Saving every second is cheap but pointless; once every 10 s is enough.
    if (e.seconds % 10 === 0) save()
  }

  function reset() {
    games.value = {}
    save()
  }

  return { games, open, finishRound, addSecond, reset }
})
