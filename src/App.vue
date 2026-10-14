<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import LumiMascot from '@/components/LumiMascot.vue'
import ParentGate from '@/components/ParentGate.vue'
import { useT } from '@/lib/i18n'
import { startMusic, stopMusic } from '@/lib/music'
import { unlockAudio } from '@/lib/sound'
import { unlockSpeech } from '@/lib/speech'
import { useSettings } from '@/stores/settings'
import { useUsage } from '@/stores/usage'

const settings = useSettings()
const usage = useUsage()
const t = useT()
let unlocked = false
let usageTimer: number | undefined

// Counts play time while the app is in the foreground; stops once the daily limit is reached.
function countUsage() {
  if (document.visibilityState === 'visible' && !usage.limitReached) usage.tick()
}

watch(
  () => usage.limitReached,
  (reached) => {
    if (reached) stopMusic()
    else if (unlocked && settings.music) void startMusic()
  },
)

function unlock() {
  unlocked = true
  unlockAudio()
  unlockSpeech()
  void startMusic()
  window.removeEventListener('pointerdown', unlock, true)
}

watch(
  () => settings.music,
  (on) => {
    if (!on) stopMusic()
    else if (unlocked && !usage.limitReached) void startMusic()
  },
)

// Prevents the iOS long-press magnifier and context menus from stealing toddler taps.
function preventContextMenu(e: Event) {
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('contextmenu', preventContextMenu)
  usageTimer = window.setInterval(countUsage, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(usageTimer)
  window.removeEventListener('pointerdown', unlock, true)
  window.removeEventListener('contextmenu', preventContextMenu)
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <Transition name="page">
    <div v-if="usage.limitReached" class="pause">
      <div class="lumi"><LumiMascot :happy="false" /></div>
      <h1>{{ t.pause.title }}</h1>
      <p>{{ t.pause.text }}</p>
      <ParentGate />
    </div>
  </Transition>
</template>

<style>
.pause {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  background: linear-gradient(180deg, #2d3a6e 0%, #5b4bc4 100%);
  color: #fff;
}

.pause .lumi {
  width: clamp(120px, 24vmin, 240px);
}

.pause h1 {
  margin: 0;
  font-size: clamp(28px, 6vmin, 48px);
}

.pause p {
  margin: 0 0 16px;
  font-size: clamp(18px, 3.5vmin, 26px);
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: scale(1.04);
}

.page-leave-to {
  opacity: 0;
}
</style>
