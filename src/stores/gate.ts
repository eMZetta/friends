import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'lumi.gate'

export const MAX_TRIES = 3
export const LOCK_MS = 30_000

interface StoredGate {
  tries: number
  lockedUntil: number
}

function load(): StoredGate {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredGate>
    return {
      tries: typeof data.tries === 'number' ? data.tries : 0,
      lockedUntil: typeof data.lockedUntil === 'number' ? data.lockedUntil : 0,
    }
  } catch {
    return { tries: 0, lockedUntil: 0 }
  }
}

/** Wrong answers at the parental gate. The lock survives app restarts, so closing the app doesn't reset it. */
export const useGate = defineStore('gate', () => {
  const stored = load()
  const tries = ref(stored.tries)
  const lockedUntil = ref(stored.lockedUntil)

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tries: tries.value, lockedUntil: lockedUntil.value }))
    } catch {
      // Without storage the lock only lasts for this session.
    }
  }

  /** Milliseconds until the gate accepts answers again; 0 when it is open. */
  function remaining(now = Date.now()) {
    return Math.max(0, lockedUntil.value - now)
  }

  /** Counts a wrong answer; returns true when this one locked the gate. */
  function fail(now = Date.now()) {
    // A lock that has run out starts a fresh set of tries.
    if (lockedUntil.value && remaining(now) === 0) {
      tries.value = 0
      lockedUntil.value = 0
    }
    tries.value++
    const locks = tries.value >= MAX_TRIES
    if (locks) lockedUntil.value = now + LOCK_MS
    save()
    return locks
  }

  function succeed() {
    tries.value = 0
    lockedUntil.value = 0
    save()
  }

  return { tries, lockedUntil, remaining, fail, succeed }
})
