<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AnimalIcon from '@/components/AnimalIcon.vue'
import GameShell from '@/components/GameShell.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { centerOf, useIdleHints } from '@/lib/hints'
import { ANIMALS, useT, type AnimalKind } from '@/lib/i18n'
import { shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

interface Card {
  id: number
  animal: AnimalKind
  open: boolean
  matched: boolean
}

// Pairs per round, and the grid they are laid out in (landscape-friendly).
const LEVELS = [
  { pairs: 2, cols: 4 },
  { pairs: 3, cols: 3 },
  { pairs: 4, cols: 4 },
  { pairs: 6, cols: 4 },
]

const t = useT()
const prompt = computed(() => t.value.memoryPrompt)

const round = ref(0)
const cards = ref<Card[]>([])
const celebrating = ref(false)
const locked = ref(false)

const level = computed(() => LEVELS[Math.min(round.value, LEVELS.length - 1)]!)
const rows = computed(() => Math.ceil(cards.value.length / level.value.cols))

let timer: number | undefined

function newRound() {
  const animals = shuffle(ANIMALS).slice(0, level.value.pairs)
  cards.value = shuffle([...animals, ...animals]).map((animal, id) => ({
    id,
    animal,
    open: false,
    matched: false,
  }))
  locked.value = false
}

function flip(card: Card) {
  if (locked.value || card.open || card.matched || celebrating.value) return
  card.open = true
  sfx.tap()

  const open = cards.value.filter((c) => c.open && !c.matched)
  if (open.length < 2) return

  const [a, b] = open as [Card, Card]
  if (a.animal === b.animal) {
    a.matched = b.matched = true
    sfx.snap()
    say(t.value.animalName(a.animal))
    if (cards.value.every((c) => c.matched)) {
      timer = window.setTimeout(() => (celebrating.value = true), 900)
    }
  } else {
    // Leave both cards visible long enough for a toddler to take them in.
    locked.value = true
    timer = window.setTimeout(() => {
      a.open = b.open = false
      locked.value = false
    }, 1200)
  }
}

function nextRound() {
  celebrating.value = false
  round.value++
  newRound()
}

const { hint } = useIdleHints({
  game: 'memory',
  prompt: () => prompt.value,
  paused: () => celebrating.value || locked.value,
  target: () => {
    // With one card open, point at its partner; otherwise at any closed card.
    const open = cards.value.find((c) => c.open && !c.matched)
    const card = open
      ? cards.value.find((c) => c.animal === open.animal && c !== open)
      : cards.value.find((c) => !c.open && !c.matched)
    return card ? centerOf(document.querySelector(`[data-card="${card.id}"]`)) : null
  },
})

onMounted(() => {
  newRound()
  say(prompt.value)
})

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #e3d9ff 0%, #ffe3f1 100%)">
    <div class="table">
      <div class="grid" :style="{ '--cols': level.cols, '--rows': rows }">
        <button
          v-for="c in cards"
          :key="`${round}-${c.id}`"
          class="card"
          :data-card="c.id"
          :class="{ flipped: c.open || c.matched, matched: c.matched }"
          @click="flip(c)"
        >
          <div class="inner">
            <div class="face back">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="22" fill="#ffe14d" opacity="0.9" />
                <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="4 10" stroke-linecap="round" />
              </svg>
            </div>
            <div class="face front">
              <AnimalIcon :kind="c.animal" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.table {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.grid {
  --card: min(calc((100vw - 140px) / var(--cols)), calc((100vh - 160px) / var(--rows)), 190px);
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--card));
  gap: 18px;
}

.card {
  width: var(--card);
  height: var(--card);
  perspective: 800px;
  -webkit-perspective: 800px;
}

.inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.4s;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.card.flipped .inner {
  transform: rotateY(180deg);
}

.card.matched .inner {
  animation: matched 0.5s 0.4s;
}

.face {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  border: 5px solid #fff;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.1);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: grid;
  place-items: center;
}

.back {
  background: linear-gradient(135deg, #8e7cf0 0%, #5b4bc4 100%);
}

.back svg {
  width: 70%;
  height: 70%;
}

.front {
  background: #fff;
  padding: calc(var(--card) * 0.12);
  transform: rotateY(180deg);
}

@keyframes matched {
  0%,
  100% {
    transform: rotateY(180deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.12);
  }
}
</style>
