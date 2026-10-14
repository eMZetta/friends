<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import { startMusic, stopMusic } from '@/lib/music'
import { unlockAudio } from '@/lib/sound'
import { unlockSpeech } from '@/lib/speech'
import { useSettings } from '@/stores/settings'

const settings = useSettings()
let unlocked = false

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
    else if (unlocked) void startMusic()
  },
)

// Prevents the iOS long-press magnifier and context menus from stealing toddler taps.
function preventContextMenu(e: Event) {
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('contextmenu', preventContextMenu)
})

onBeforeUnmount(() => {
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
</template>

<style>
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
