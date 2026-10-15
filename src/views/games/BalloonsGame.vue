<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef } from 'vue'

import GameShell from '@/components/GameShell.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { COLOR_IDS, COLORS, type ColorId } from '@/lib/colors'
import { centerOf, useIdleHints } from '@/lib/hints'
import { useT } from '@/lib/i18n'
import { pick, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

interface Balloon {
  id: number
  color: ColorId
  x: number
  y: number
  speed: number
  phase: number
  popped: boolean
  wobble: boolean
}

const GOAL = 5
const MAX_BALLOONS = 7

const t = useT()

const stage = ref<HTMLElement | null>(null)
const size = ref({ w: 1024, h: 600 })
const balloons = shallowRef<Balloon[]>([])
const target = ref<ColorId>('red')
const palette = ref<ColorId[]>([])
const popped = ref(0)
const celebrating = ref(false)

const prompt = computed(() => t.value.balloonsPrompt(target.value))
const balloonW = computed(() => Math.min(Math.max(size.value.w * 0.12, 90), 150))

let nextId = 0
let spawnIn = 0
let lastTime = 0
let raf = 0
let observer: ResizeObserver | null = null

function newRound() {
  target.value = pick(COLOR_IDS.filter((c) => c !== target.value))
  palette.value = [target.value, ...shuffle(COLOR_IDS.filter((c) => c !== target.value)).slice(0, 3)]
  popped.value = 0
  say(prompt.value)
}

function spawn() {
  const w = balloonW.value
  // Bias towards the target colour so there is always something to pop.
  const color = Math.random() < 0.35 ? target.value : pick(palette.value)
  balloons.value.push({
    id: nextId++,
    color,
    x: Math.random() * (size.value.w - w),
    y: size.value.h + 20,
    speed: size.value.h * (0.12 + Math.random() * 0.08),
    phase: Math.random() * Math.PI * 2,
    popped: false,
    wobble: false,
  })
}

function tick(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.1)
  lastTime = now

  if (!celebrating.value) {
    spawnIn -= dt
    if (spawnIn <= 0 && balloons.value.length < MAX_BALLOONS) {
      spawn()
      spawnIn = 0.8 + Math.random() * 0.7
    }
  }

  const h = balloonW.value * 1.6
  for (const b of balloons.value) {
    if (!b.popped) b.y -= b.speed * dt
    b.phase += dt * 1.5
  }
  balloons.value = balloons.value.filter((b) => b.y > -h - 40)
  triggerRef(balloons)
  raf = requestAnimationFrame(tick)
}

function tap(b: Balloon) {
  if (b.popped || celebrating.value) return
  if (b.color === target.value) {
    b.popped = true
    sfx.pop()
    popped.value++
    window.setTimeout(() => {
      balloons.value = balloons.value.filter((x) => x !== b)
    }, 350)
    if (popped.value >= GOAL) {
      window.setTimeout(() => (celebrating.value = true), 400)
    }
  } else {
    b.wobble = true
    sfx.wrong()
    say(t.value.thatIs(b.color))
    window.setTimeout(() => (b.wobble = false), 500)
  }
}

function nextRound() {
  celebrating.value = false
  balloons.value = balloons.value.filter((b) => !b.popped)
  newRound()
}

function balloonStyle(b: Balloon) {
  const sway = Math.sin(b.phase) * 10
  return {
    width: `${balloonW.value}px`,
    height: `${balloonW.value * (5 / 3)}px`,
    transform: `translate3d(${b.x + sway}px, ${b.y}px, 0)`,
  }
}

const { hint } = useIdleHints({
  game: 'balloons',
  prompt: () => prompt.value,
  paused: () => celebrating.value,
  target: () => {
    const h = size.value.h
    const b = balloons.value.find((x) => x.color === target.value && !x.popped && x.y > h * 0.15 && x.y < h * 0.7)
    return b ? centerOf(document.querySelector(`[data-balloon="${b.id}"]`)) : null
  },
})

onMounted(() => {
  if (stage.value) {
    const el = stage.value
    const measure = () => (size.value = { w: el.clientWidth, h: el.clientHeight })
    measure()
    observer = new ResizeObserver(measure)
    observer.observe(el)
  }
  newRound()
  lastTime = performance.now()
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
})
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #8a7be0 0%, #f4a3b4 55%, #ffd9a8 100%)">
    <template #status>
      <ProgressDots :total="GOAL" :done="popped" :color="COLORS[target]" />
    </template>

    <div ref="stage" class="sky">
      <button
        v-for="b in balloons"
        :key="b.id"
        class="balloon"
        :data-balloon="b.id"
        :class="{ popped: b.popped, wobble: b.wobble }"
        :style="balloonStyle(b)"
        @pointerdown="tap(b)"
      >
        <svg viewBox="0 0 60 100" aria-hidden="true">
          <path d="M30 72 Q22 84 32 98" stroke="#6b7a8c" stroke-width="1.5" fill="none" />
          <ellipse cx="30" cy="36" rx="27" ry="33" :fill="COLORS[b.color]" />
          <path d="M25 68 L35 68 L30 74 Z" :fill="COLORS[b.color]" />
          <ellipse cx="19" cy="24" rx="5" ry="10" fill="rgba(255,255,255,0.5)" transform="rotate(20 19 24)" />
        </svg>
        <span v-if="b.popped" class="burst">
          <i v-for="n in 8" :key="n" :style="{ '--a': `${n * 45}deg`, background: COLORS[b.color] }" />
        </span>
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 24px;
}

.balloon {
  position: absolute;
  left: 0;
  top: 0;
  aspect-ratio: 3 / 5;
  touch-action: none;
  will-change: transform;
}

.balloon svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.balloon.popped svg {
  animation: vanish 0.2s forwards;
}

.balloon.wobble svg {
  animation: wobble 0.45s;
}

.burst {
  position: absolute;
  left: 50%;
  top: 36%;
}

.burst i {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -7px;
  border-radius: 50%;
  animation: fly 0.35s ease-out forwards;
}

@keyframes vanish {
  to {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes fly {
  from {
    transform: rotate(var(--a)) translateX(0);
    opacity: 1;
  }
  to {
    transform: rotate(var(--a)) translateX(70px);
    opacity: 0;
  }
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}
</style>
