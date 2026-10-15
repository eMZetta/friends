<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

import HintHand from './HintHand.vue'
import type { Hint } from '@/lib/hints'
import { say } from '@/lib/speech'
import { sfx } from '@/lib/sound'

const props = defineProps<{ prompt: string; background: string; hint?: Hint | null }>()

const router = useRouter()

// The home button must be held briefly, so a stray toddler tap doesn't end the game.
const HOLD_MS = 900
const holding = ref(false)
const nudge = ref(false)
let holdTimer: number | undefined

function startHold() {
  holding.value = true
  holdTimer = window.setTimeout(() => {
    holding.value = false
    sfx.tap()
    void router.push({ name: 'home' })
  }, HOLD_MS)
}

function cancelHold() {
  if (!holding.value) return
  holding.value = false
  window.clearTimeout(holdTimer)
  nudge.value = true
  window.setTimeout(() => (nudge.value = false), 400)
}

onBeforeUnmount(() => window.clearTimeout(holdTimer))

function repeatPrompt() {
  sfx.tap()
  say(props.prompt)
}
</script>

<template>
  <main class="shell" :style="{ background }">
    <header class="bar">
      <button
        class="round-btn home"
        :class="{ holding, nudge }"
        aria-label="Home"
        @pointerdown="startHold"
        @pointerup="cancelHold"
        @pointerleave="cancelHold"
        @pointercancel="cancelHold"
      >
        <svg class="ring" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" />
        </svg>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 24 L24 10 L40 24" stroke="#2d3a4a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M13 22 V38 H35 V22" stroke="#2d3a4a" stroke-width="5" fill="#ffd23f" stroke-linejoin="round" />
          <rect x="20" y="28" width="8" height="10" fill="#2d3a4a" rx="2" />
        </svg>
      </button>
      <slot name="status" />
      <button class="round-btn" aria-label="Repeat" @click="repeatPrompt">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 19 H16 L26 10 V38 L16 29 H8 Z" fill="#3a86ff" stroke="#2d3a4a" stroke-width="3" stroke-linejoin="round" />
          <path d="M32 17 Q37 24 32 31" stroke="#2d3a4a" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M37 12 Q46 24 37 36" stroke="#2d3a4a" stroke-width="4" fill="none" stroke-linecap="round" />
        </svg>
      </button>
    </header>
    <div class="stage">
      <slot />
    </div>
    <HintHand v-if="hint" :key="hint.id" :hint="hint" />
  </main>
</template>

<style scoped>
.shell {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: max(16px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
  position: relative;
  z-index: 5;
}

.round-btn {
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 50%;
  background: var(--cream);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
  transition: transform 0.12s;
}

.round-btn:active {
  transform: scale(0.9);
}

.round-btn svg {
  width: 44px;
  height: 44px;
}

.home {
  position: relative;
  touch-action: none;
}

.home .ring {
  position: absolute;
  inset: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  transform: rotate(-90deg);
}

.ring circle {
  fill: none;
  stroke: #3bceac;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 227;
  stroke-dashoffset: 227;
}

.home.holding .ring circle {
  transition: stroke-dashoffset 0.9s linear;
  stroke-dashoffset: 0;
}

.home.nudge {
  animation: nudge 0.4s;
}

@keyframes nudge {
  25% {
    transform: rotate(-8deg);
  }
  75% {
    transform: rotate(8deg);
  }
}

.stage {
  position: relative;
  flex: 1;
  min-height: 0;
}
</style>
