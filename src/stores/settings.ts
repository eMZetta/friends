import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { DIFFICULTIES, type Difficulty } from '@/lib/difficulty'
import type { Lang } from '@/lib/i18n'

const STORAGE_KEY = 'lumi.settings'

interface StoredSettings {
  lang: Lang
  sound: boolean
  voice: boolean
  music: boolean
  hiddenGames: string[]
  dailyLimit: number
  difficulty: Difficulty
}

function defaultLang(): Lang {
  return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

function load(): Partial<StoredSettings> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredSettings>
  } catch {
    return {}
  }
}

export const useSettings = defineStore('settings', () => {
  const stored = load()
  const lang = ref<Lang>(stored.lang ?? defaultLang())
  const sound = ref(stored.sound ?? true)
  const voice = ref(stored.voice ?? true)
  const music = ref(stored.music ?? true)
  /** Games the parents hid from the home screen. */
  const hiddenGames = ref<string[]>(Array.isArray(stored.hiddenGames) ? stored.hiddenGames : [])
  /** Minutes per day before Lumi takes a break; 0 means no limit. */
  const dailyLimit = ref(typeof stored.dailyLimit === 'number' ? stored.dailyLimit : 0)

  const difficulty = ref<Difficulty>(
    DIFFICULTIES.includes(stored.difficulty as Difficulty) ? (stored.difficulty as Difficulty) : 'normal',
  )

  watch(
    [lang, sound, voice, music, hiddenGames, dailyLimit, difficulty],
    () => {
      try {
        const data: StoredSettings = {
          lang: lang.value,
          sound: sound.value,
          voice: voice.value,
          music: music.value,
          hiddenGames: hiddenGames.value,
          dailyLimit: dailyLimit.value,
          difficulty: difficulty.value,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Storage can be unavailable (private mode); settings then last for the session only.
      }
      document.documentElement.lang = lang.value
    },
    { immediate: true, deep: true },
  )

  function toggleGame(id: string, total: number) {
    if (hiddenGames.value.includes(id)) {
      hiddenGames.value = hiddenGames.value.filter((g) => g !== id)
    } else if (hiddenGames.value.length < total - 1) {
      // At least one game always stays visible.
      hiddenGames.value = [...hiddenGames.value, id]
    }
  }

  return { lang, sound, voice, music, hiddenGames, dailyLimit, difficulty, toggleGame }
})
