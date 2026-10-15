import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'lumi.friendship'

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

// Galip vertraut dem Kind mehr, wenn es ruhig und sanft spielt. Die Herzen gehen nie wieder verloren.
export const useFriendship = defineStore('friendship', () => {
  const trust = ref(load())

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

  return { trust, grow }
})
