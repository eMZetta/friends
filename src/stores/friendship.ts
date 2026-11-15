import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'lumi.friendship'
const ROUNDS_KEY = 'lumi.friendship.rounds'

/** So viele fertige Spielrunden braucht Galip, um dem Kind ein Herz mehr zu vertrauen. */
export const ROUNDS_PER_HEART = 3

/** Wie viele Herzen Galip höchstens zeigt. */
export const MAX_TRUST = 5

function load(): number {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 0), MAX_TRUST) : 0
  } catch {
    return 0
  }
}

function loadRounds(): number {
  try {
    const n = Number(localStorage.getItem(ROUNDS_KEY))
    return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 0), ROUNDS_PER_HEART - 1) : 0
  } catch {
    return 0
  }
}

// Galip vertraut dem Kind mehr, wenn es ruhig und sanft spielt. Die Herzen gehen nie wieder verloren.
export const useFriendship = defineStore('friendship', () => {
  const trust = ref(load())
  const rounds = ref(loadRounds())

  /** Ein Herz mehr; liefert true, wenn damit das letzte Herz erreicht wurde. */
  function grow(): boolean {
    if (trust.value >= MAX_TRUST) return false
    trust.value++
    try {
      localStorage.setItem(STORAGE_KEY, String(trust.value))
    } catch {
      // Ohne Speicher gelten die Herzen nur für diese Sitzung.
    }
    return trust.value === MAX_TRUST
  }

  /**
   * Eine Spielrunde ist fertig: Galip schaut aus der Ferne zu und fasst Vertrauen.
   * Liefert true, wenn dadurch ein Herz dazugekommen ist.
   */
  function finishRound(): boolean {
    if (trust.value >= MAX_TRUST) return false
    rounds.value++
    const earned = rounds.value >= ROUNDS_PER_HEART
    if (earned) {
      rounds.value = 0
      grow()
    }
    try {
      localStorage.setItem(ROUNDS_KEY, String(rounds.value))
    } catch {
      // Ohne Speicher zählt der Fortschritt nur für diese Sitzung.
    }
    return earned
  }

  return { trust, rounds, grow, finishRound }
})
