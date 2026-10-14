import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import type { Lang } from '@/lib/i18n'

const STORAGE_KEY = 'lumi.settings'

interface StoredSettings {
  lang: Lang
  sound: boolean
  voice: boolean
  music: boolean
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

  watch(
    [lang, sound, voice, music],
    () => {
      try {
        const data: StoredSettings = {
          lang: lang.value,
          sound: sound.value,
          voice: voice.value,
          music: music.value,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Storage can be unavailable (private mode); settings then last for the session only.
      }
      document.documentElement.lang = lang.value
    },
    { immediate: true },
  )

  return { lang, sound, voice, music }
})
