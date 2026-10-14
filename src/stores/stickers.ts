import { defineStore } from 'pinia'
import { ref } from 'vue'

import { pick } from '@/lib/random'
import { STICKERS, type Sticker } from '@/lib/stickers'

const STORAGE_KEY = 'lumi.stickers'

function load(): string[] {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
    return ids.filter((id) => STICKERS.some((s) => s.id === id))
  } catch {
    return []
  }
}

export const useStickers = defineStore('stickers', () => {
  const collected = ref<string[]>(load())
  /** The most recent sticker, highlighted when the album is opened. */
  const latest = ref<string | null>(null)

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collected.value))
    } catch {
      // Without storage the album only lasts for this session.
    }
  }

  /** Gives a random sticker the child doesn't have yet, or null once the album is full. */
  function award(): Sticker | null {
    const missing = STICKERS.filter((s) => !collected.value.includes(s.id))
    if (!missing.length) return null
    const sticker = pick(missing)
    collected.value.push(sticker.id)
    latest.value = sticker.id
    save()
    return sticker
  }

  function has(id: string) {
    return collected.value.includes(id)
  }

  return { collected, latest, award, has }
})
