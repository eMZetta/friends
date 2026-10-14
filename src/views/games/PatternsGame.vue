<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import GameShell from '@/components/GameShell.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLOR_IDS, COLORS } from '@/lib/colors'
import { centerOf, useIdleHints } from '@/lib/hints'
import { useT, type ShapeKind } from '@/lib/i18n'
import { useLevel } from '@/lib/difficulty'
import { pick, randInt, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

interface Token {
  kind: ShapeKind
  color: string
}

// A pattern is a repeating unit; letters index into the round's tokens.
const EASY = ['AB']
const MEDIUM = ['AB', 'AAB', 'ABB']
const HARD = ['AAB', 'ABB', 'ABC', 'AABB']

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart', 'hexagon']
const MAX_SHOWN = 8

const t = useT()
const prompt = computed(() => t.value.patternsPrompt)

const levelOf = useLevel()
const round = ref(0)
const sequence = ref<Token[]>([])
const answer = ref<Token | null>(null)
const options = ref<Token[]>([])
const wrong = ref<Token[]>([])
const solved = ref(false)
const celebrating = ref(false)

let timer: number | undefined

function unitsForRound(r: number) {
  if (r < 3) return EASY
  if (r < 7) return MEDIUM
  return HARD
}

function newRound() {
  const unit = pick(unitsForRound(levelOf(round.value)))
  const letters = [...new Set(unit)]

  // Kinds and colours both differ, so the pattern can be read either way.
  const kinds = shuffle(KINDS)
  const colors = shuffle(COLOR_IDS)
  const tokens = letters.map((_, i) => ({ kind: kinds[i]!, color: COLORS[colors[i]!] }))
  const byLetter = (letter: string) => tokens[letters.indexOf(letter)]!

  // Show at least two full repetitions, then stop somewhere inside the next one.
  let shown = unit.length * 2 + randInt(0, unit.length - 1)
  while (shown > MAX_SHOWN) shown -= unit.length
  sequence.value = Array.from({ length: shown }, (_, i) => byLetter(unit[i % unit.length]!))
  answer.value = byLetter(unit[shown % unit.length]!)

  // Always offer three choices; add an outsider when the pattern only has two tokens.
  const extra = { kind: kinds[letters.length]!, color: COLORS[colors[letters.length]!] }
  options.value = shuffle(tokens.length >= 3 ? tokens : [...tokens, extra])
  wrong.value = []
  solved.value = false
}

function choose(token: Token) {
  if (solved.value || wrong.value.includes(token)) return
  if (token === answer.value) {
    solved.value = true
    sfx.snap()
    timer = window.setTimeout(() => (celebrating.value = true), 700)
  } else {
    wrong.value.push(token)
    sfx.wrong()
    say(t.value.tryAgain)
  }
}

function nextRound() {
  celebrating.value = false
  round.value++
  newRound()
}

const { hint } = useIdleHints({
  game: 'patterns',
  prompt: () => prompt.value,
  paused: () => celebrating.value || solved.value,
  target: () => {
    const index = options.value.findIndex((tok) => tok === answer.value)
    return index < 0 ? null : centerOf(document.querySelector(`[data-option="${index}"]`))
  },
})

onMounted(() => {
  newRound()
  say(prompt.value)
})

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #d4f4ff 0%, #fff4d6 100%)">
    <div class="track">
      <div v-for="(tok, i) in sequence" :key="`${round}-${i}`" class="cell" :style="{ animationDelay: `${i * 70}ms` }">
        <ShapeIcon :kind="tok.kind" :color="tok.color" />
      </div>
      <div class="cell slot" :class="{ solved }">
        <ShapeIcon v-if="solved && answer" :kind="answer.kind" :color="answer.color" />
        <span v-else class="question">?</span>
      </div>
    </div>

    <div class="options">
      <button
        v-for="(tok, i) in options"
        :key="`${round}-${i}`"
        class="option"
        :data-option="i"
        :class="{ wrong: wrong.includes(tok), used: solved && tok === answer }"
        @click="choose(tok)"
      >
        <ShapeIcon :kind="tok.kind" :color="tok.color" />
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.track {
  position: absolute;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  width: min(96%, 1100px);
  min-height: 34%;
  padding: 3vmin;
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.6vmin;
}

.cell {
  --size: min(8.5vw, 13vmin, 110px);
  width: var(--size);
  height: var(--size);
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

.slot {
  border-radius: 22px;
  border: 5px dashed #b9c6d4;
  display: grid;
  place-items: center;
  padding: calc(var(--size) * 0.06);
}

.slot.solved {
  border-color: transparent;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.question {
  font-size: calc(var(--size) * 0.55);
  font-weight: 800;
  color: #9aa9ba;
  animation: blink 1.2s ease-in-out infinite alternate;
}

.options {
  position: absolute;
  bottom: 6%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6vmin;
}

.option {
  --size: min(20vmin, 170px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: calc(var(--size) * 0.06);
  border-radius: 32px;
  background: #fff;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.1);
  transition:
    transform 0.12s,
    opacity 0.3s;
}

.option:active {
  transform: translateY(6px);
}

.option.wrong {
  opacity: 0.35;
  animation: shake 0.4s;
}

.option.used {
  opacity: 0;
}

@keyframes pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes blink {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>
