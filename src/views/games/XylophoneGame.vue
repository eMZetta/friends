<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AnimalIcon from '@/components/AnimalIcon.vue'
import GameShell from '@/components/GameShell.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLORS } from '@/lib/colors'
import { centerOf, useIdleHints } from '@/lib/hints'
import { useT, type SongId } from '@/lib/i18n'
import { randInt } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

// C major scale, C5 to C6.
const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]
const BAR_COLORS = [
  COLORS.red,
  COLORS.orange,
  COLORS.yellow,
  COLORS.green,
  '#2ec4b6',
  COLORS.blue,
  COLORS.purple,
  COLORS.pink,
]

// Traditional public-domain melodies, as bar indices (0 = C … 7 = high C).
const SONGS: Record<SongId, number[]> = {
  // Alle meine Entchen
  ducks: [0, 1, 2, 3, 4, 4, 5, 5, 5, 5, 4, 5, 5, 5, 5, 4, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1, 0],
  // Twinkle, Twinkle, Little Star (first line)
  star: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
  // Hänschen klein / Lightly Row (first line)
  row: [4, 2, 2, 3, 1, 1, 0, 1, 2, 3, 4, 4, 4],
}
const SONG_IDS = Object.keys(SONGS) as SongId[]

const t = useT()
const prompt = computed(() => t.value.musicPrompt)

const song = ref<SongId | null>(null)
const step = ref(0)
const hit = ref<boolean[]>(NOTES.map(() => false))
const floaters = ref<{ id: number; bar: number; drift: number }[]>([])
const celebrating = ref(false)

const melody = computed(() => (song.value ? SONGS[song.value] : []))
const nextBar = computed(() => (song.value ? (melody.value[step.value] ?? null) : null))
const progress = computed(() => (melody.value.length ? step.value / melody.value.length : 0))

// Bars get shorter from low to high, like a real xylophone.
function barHeight(i: number) {
  return 100 - (35 * i) / (NOTES.length - 1)
}

let floaterId = 0
const hitTimers = new Map<number, number>()
let doneTimer: number | undefined

function strike(bar: number) {
  sfx.note(bar, NOTES[bar]!)

  hit.value[bar] = true
  window.clearTimeout(hitTimers.get(bar))
  hitTimers.set(bar, window.setTimeout(() => (hit.value[bar] = false), 140))

  const id = floaterId++
  floaters.value = [...floaters.value.slice(-11), { id, bar, drift: Math.random() * 40 - 20 }]
  window.setTimeout(() => (floaters.value = floaters.value.filter((f) => f.id !== id)), 1100)

  // Wrong notes simply sound; only the right one moves the song along.
  if (song.value && bar === nextBar.value) {
    step.value++
    if (step.value >= melody.value.length) {
      doneTimer = window.setTimeout(() => (celebrating.value = true), 700)
    }
  }
}

// One handler on the whole instrument, so several fingers can play at once and
// sliding across the bars plays each one (glissando).
const pointers = new Map<number, number | null>()

function barAt(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-bar]')
  return el ? Number(el.dataset.bar) : null
}

function onDown(e: PointerEvent) {
  if (celebrating.value) return
  const bar = barAt(e.clientX, e.clientY)
  pointers.set(e.pointerId, bar)
  if (bar !== null) strike(bar)
}

function onMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId) || celebrating.value) return
  const bar = barAt(e.clientX, e.clientY)
  if (bar !== null && bar !== pointers.get(e.pointerId)) {
    pointers.set(e.pointerId, bar)
    strike(bar)
  }
}

function onUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
}

function chooseSong(id: SongId) {
  sfx.tap()
  window.clearTimeout(doneTimer)
  if (song.value === id) {
    song.value = null
    return
  }
  song.value = id
  step.value = 0
  say(t.value.songs[id])
}

function songDone() {
  celebrating.value = false
  song.value = null
  step.value = 0
}

const { hint } = useIdleHints({
  game: 'music',
  prompt: () => (song.value ? t.value.songs[song.value] : prompt.value),
  paused: () => celebrating.value,
  target: () => {
    const bar = nextBar.value ?? randInt(0, NOTES.length - 1)
    return centerOf(document.querySelector(`[data-bar="${bar}"]`))
  },
})

onMounted(() => say(prompt.value))

onBeforeUnmount(() => {
  window.clearTimeout(doneTimer)
  hitTimers.forEach((timer) => window.clearTimeout(timer))
})
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #ffe7c2 0%, #ffd1dc 100%)">
    <template #status>
      <div v-if="song" class="song-progress">
        <div class="fill" :style="{ width: `${progress * 100}%` }" />
      </div>
    </template>

    <div
      class="xylo"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @pointerleave="onUp"
    >
      <svg class="rails" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="12" x2="100" y2="25" stroke="#a0673a" stroke-width="16" vector-effect="non-scaling-stroke" />
        <line x1="0" y1="88" x2="100" y2="75" stroke="#a0673a" stroke-width="16" vector-effect="non-scaling-stroke" />
      </svg>

      <div class="bars">
        <div v-for="(color, i) in BAR_COLORS" :key="i" class="lane">
          <div
            class="bar"
            :class="{ hit: hit[i], next: nextBar === i }"
            :data-bar="i"
            :style="{ height: `${barHeight(i)}%`, background: color }"
          >
            <span class="nail top" />
            <span class="nail bottom" />
          </div>
          <span
            v-for="f in floaters.filter((x) => x.bar === i)"
            :key="f.id"
            class="floater"
            :style="{ color, '--drift': `${f.drift}px` }"
          >
            ♪
          </span>
        </div>
      </div>
    </div>

    <div class="songs">
      <button
        v-for="id in SONG_IDS"
        :key="id"
        class="song"
        :class="{ active: song === id }"
        :aria-label="t.songs[id]"
        @click="chooseSong(id)"
      >
        <AnimalIcon v-if="id === 'ducks'" kind="duck" />
        <ShapeIcon v-else-if="id === 'star'" kind="star" :color="COLORS.yellow" />
        <svg v-else viewBox="0 0 100 100" aria-hidden="true">
          <path d="M14 66 H86 L74 86 H26 Z" fill="#a0673a" />
          <path d="M50 12 V62" stroke="#2d3a4a" stroke-width="4" />
          <path d="M53 14 L82 58 H53 Z" fill="#3a86ff" />
          <path d="M47 24 L24 58 H47 Z" fill="#ff5a5f" />
          <path d="M6 92 Q18 84 30 92 T54 92 T78 92 T100 92" stroke="#3a86ff" stroke-width="4" fill="none" />
        </svg>
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="songDone" />
  </GameShell>
</template>

<style scoped>
.xylo {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  width: min(96%, 1000px);
  height: 68%;
  touch-action: none;
}

.rails {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bars {
  position: relative;
  height: 100%;
  display: flex;
  gap: 1.6%;
  padding: 0 1%;
}

.lane {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar {
  position: relative;
  width: 100%;
  border-radius: 18px;
  box-shadow:
    inset 0 -10px 0 rgba(0, 0, 0, 0.12),
    inset 6px 0 0 rgba(255, 255, 255, 0.35),
    0 8px 0 rgba(0, 0, 0, 0.15);
  transition:
    transform 0.08s,
    filter 0.08s;
}

.bar.hit {
  transform: scale(0.95);
  filter: brightness(1.2);
}

.bar.next {
  animation: glow 0.8s ease-in-out infinite alternate;
}

.nail {
  position: absolute;
  left: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-radius: 50%;
  background: #e8e2d6;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.2);
}

.nail.top {
  top: 12%;
}

.nail.bottom {
  bottom: 12%;
}

.floater {
  position: absolute;
  top: 6%;
  font-size: 44px;
  font-weight: 800;
  pointer-events: none;
  text-shadow: 0 2px 0 #fff;
  animation: float-up 1.1s ease-out forwards;
}

.songs {
  position: absolute;
  bottom: 3%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 5vmin;
}

.song {
  --size: min(15vmin, 120px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.1);
  border: 5px solid transparent;
  transition: transform 0.15s;
}

.song:active {
  transform: scale(0.92);
}

.song.active {
  border-color: #ff9f1c;
  transform: scale(1.1);
}

.song svg {
  width: 100%;
  height: 100%;
}

.song-progress {
  width: min(40vw, 360px);
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.song-progress .fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9f1c, #f15bb5);
  border-radius: 999px;
  transition: width 0.2s;
}

@keyframes glow {
  from {
    box-shadow:
      inset 0 -10px 0 rgba(0, 0, 0, 0.12),
      0 0 0 0 rgba(255, 255, 255, 0.9);
  }
  to {
    box-shadow:
      inset 0 -10px 0 rgba(0, 0, 0, 0.12),
      0 0 0 10px rgba(255, 255, 255, 0.9);
    transform: scale(1.04);
  }
}

@keyframes float-up {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(0.6);
  }
  to {
    opacity: 0;
    transform: translate(var(--drift), -90px) scale(1.2);
  }
}
</style>
