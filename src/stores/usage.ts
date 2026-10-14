import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useSettings } from '@/stores/settings'

const STORAGE_KEY = 'lumi.usage'

interface StoredUsage {
  day: string
  seconds: number
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function load(): StoredUsage {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredUsage>
    if (data.day === today() && typeof data.seconds === 'number') return { day: data.day, seconds: data.seconds }
  } catch {
    // Fall through to a fresh day.
  }
  return { day: today(), seconds: 0 }
}

/** Play time per day, kept on the device only. Used for the parents' daily limit. */
export const useUsage = defineStore('usage', () => {
  const settings = useSettings()
  const stored = load()
  const day = ref(stored.day)
  const seconds = ref(stored.seconds)
  /** True while the parents' panel is open: that time doesn't count as play time. */
  const paused = ref(false)

  const minutes = computed(() => Math.floor(seconds.value / 60))
  const limitReached = computed(() => settings.dailyLimit > 0 && seconds.value >= settings.dailyLimit * 60)

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: day.value, seconds: seconds.value }))
    } catch {
      // Without storage the counter only lasts for this session.
    }
  }

  function tick() {
    if (day.value !== today()) {
      day.value = today()
      seconds.value = 0
    }
    seconds.value++
    save()
  }

  function reset() {
    seconds.value = 0
    save()
  }

  return { minutes, seconds, paused, limitReached, tick, reset }
})
