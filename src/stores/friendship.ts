import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'lumi.friendship'
const ROUNDS_KEY = 'lumi.friendship.rounds'
const FINALE_KEY = 'lumi.friendship.finale'

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

function loadFinaleSeen(): boolean {
  try {
    return localStorage.getItem(FINALE_KEY) === '1'
  } catch {
    return false
  }
}

// Galip vertraut dem Kind mehr, wenn es ruhig und sanft spielt. Die Herzen gehen nie wieder verloren.
export const useFriendship = defineStore('friendship', () => {
  const trust = ref(load())
  const rounds = ref(loadRounds())
  /** Das Ende der Geschichte (Medaille „Beste Freunde") wurde schon einmal gezeigt. */
  const finaleSeen = ref(loadFinaleSeen())
  /** Die Abschlussszene soll gezeigt werden: beim ersten Mal von selbst, danach auf Wunsch aus dem Album. */
  const finalePending = ref(trust.value >= MAX_TRUST && !finaleSeen.value)

  /** Ein Herz mehr; liefert true, wenn damit das letzte Herz erreicht wurde. */
  function grow(): boolean {
    if (trust.value >= MAX_TRUST) return false
    trust.value++
    try {
      localStorage.setItem(STORAGE_KEY, String(trust.value))
    } catch {
      // Ohne Speicher gelten die Herzen nur für diese Sitzung.
    }
    const complete = trust.value === MAX_TRUST
    if (complete && !finaleSeen.value) finalePending.value = true
    return complete
  }

  function showFinale() {
    if (trust.value >= MAX_TRUST) finalePending.value = true
  }

  function endFinale() {
    finalePending.value = false
    finaleSeen.value = true
    try {
      localStorage.setItem(FINALE_KEY, '1')
    } catch {
      // Ohne Speicher erscheint die Szene beim nächsten Start noch einmal.
    }
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

  return { trust, rounds, finaleSeen, finalePending, grow, finishRound, showFinale, endFinale }
})
