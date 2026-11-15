<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, triggerRef } from 'vue'

import BalloonIcon from '@/components/BalloonIcon.vue'
import GameShell from '@/components/GameShell.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { COLOR_IDS, COLORS, type ColorId } from '@/lib/colors'
import { centerOf, useIdleHints } from '@/lib/hints'
import { useT } from '@/lib/i18n'
import { pick, randInt, shuffle } from '@/lib/random'
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
  num?: number
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

// Two kinds of round: pop the balloons of one colour, or pop the numbered balloons in order 1, 2, 3 …
const mode = ref<'color' | 'number'>('color')
const nextNum = ref(1)
const prompt = computed(() => (mode.value === 'number' ? t.value.balloonsOrder : t.value.balloonsPrompt(target.value)))
const balloonW = computed(() => Math.min(Math.max(size.value.w * 0.12, 90), 150))

let nextId = 0
let round = 0
let spawnIn = 0
let lastTime = 0
let raf = 0
let observer: ResizeObserver | null = null

function newRound() {
  target.value = pick(COLOR_IDS.filter((c) => c !== target.value))
  palette.value = [target.value, ...shuffle(COLOR_IDS.filter((c) => c !== target.value)).slice(0, 3)]
  popped.value = 0
  nextNum.value = 1
  // A new kind of round starts with a fresh sky, so no balloon is left over from the old rules.
  balloons.value = []
  mode.value = round > 0 && Math.random() < 0.5 ? 'number' : 'color'
  round++
  say(prompt.value)
}

/** Mostly the number that is needed next, so there is always something to pop. */
function numberForNewBalloon() {
  const needed = nextNum.value
  const onScreen = balloons.value.some((b) => !b.popped && b.num === needed)
  return !onScreen || Math.random() < 0.4 ? needed : randInt(needed, GOAL)
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
    num: mode.value === 'number' ? numberForNewBalloon() : undefined,
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

function popOne(b: Balloon) {
  b.popped = true
  sfx.pop()
  window.setTimeout(() => {
    balloons.value = balloons.value.filter((x) => x !== b)
  }, 350)
}

function tap(b: Balloon) {
  if (b.popped || celebrating.value) return
  if (mode.value === 'number') {
    if (b.num === nextNum.value) {
      popOne(b)
      // Twins with the same number pop along, so no balloon is left over for a number that is done.
      for (const other of balloons.value) if (!other.popped && other.num === b.num) popOne(other)
      popped.value++
      say(String(b.num))
      nextNum.value++
      if (popped.value >= GOAL) window.setTimeout(() => (celebrating.value = true), 500)
    } else {
      b.wobble = true
      sfx.wrong()
      say(String(b.num))
      window.setTimeout(() => (b.wobble = false), 500)
    }
    return
  }
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
    const wanted = (x: Balloon) => (mode.value === 'number' ? x.num === nextNum.value : x.color === target.value)
    const b = balloons.value.find((x) => wanted(x) && !x.popped && x.y > h * 0.15 && x.y < h * 0.7)
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
      <ProgressDots :total="GOAL" :done="popped" :color="mode === 'number' ? '#ffd23f' : COLORS[target]" />
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
        <BalloonIcon :color="b.color">
          <text
            v-if="b.num"
            x="30"
            y="50"
            text-anchor="middle"
            font-size="34"
            font-weight="800"
            fill="#fff"
            stroke="rgba(0,0,0,0.25)"
            stroke-width="1.5"
            paint-order="stroke"
          >
            {{ b.num }}
          </text>
        </BalloonIcon>
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
