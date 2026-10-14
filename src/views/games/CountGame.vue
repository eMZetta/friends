<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import CountItem from '@/components/CountItem.vue'
import GameShell from '@/components/GameShell.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { centerOf, useIdleHints } from '@/lib/hints'
import { useT, type CountThing } from '@/lib/i18n'
import { useLevel } from '@/lib/difficulty'
import { pick, randInt, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

const THINGS: CountThing[] = ['apple', 'star', 'fish', 'flower']

const t = useT()

const levelOf = useLevel()
const round = ref(0)
const thing = ref<CountThing>('apple')
const count = ref(0)
const options = ref<number[]>([])
const tapped = ref<number[]>([])
const wrong = ref<number[]>([])
const celebrating = ref(false)

const prompt = computed(() => t.value.countPrompt(thing.value))

function maxForRound(r: number) {
  if (r < 3) return 3
  if (r < 6) return 5
  if (r < 10) return 7
  return 10
}

function newRound() {
  const max = maxForRound(levelOf(round.value))
  let n = randInt(1, max)
  if (n === count.value) n = (n % max) + 1
  count.value = n
  thing.value = pick(THINGS.filter((x) => x !== thing.value))
  tapped.value = []
  wrong.value = []

  const pool = shuffle(
    Array.from({ length: Math.max(max, 5) }, (_, i) => i + 1).filter((x) => x !== n),
  )
  options.value = [n, ...pool.slice(0, 2)].sort((a, b) => a - b)
  say(prompt.value)
}

/** Tapping the items counts them out loud, which teaches one-to-one correspondence. */
function tapItem(index: number) {
  if (tapped.value.includes(index) || celebrating.value) return
  tapped.value.push(index)
  sfx.tap()
  say(String(tapped.value.length))
}

function tapNumber(i: number) {
  return tapped.value.indexOf(i) + 1
}

function choose(n: number) {
  if (celebrating.value || wrong.value.includes(n)) return
  if (n === count.value) {
    sfx.snap()
    celebrating.value = true
  } else {
    wrong.value.push(n)
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
  game: 'count',
  prompt: () => prompt.value,
  paused: () => celebrating.value,
  target: () => {
    // First show how to count the items one by one, then where the answer goes.
    const next = Array.from({ length: count.value }, (_, i) => i + 1).find((i) => !tapped.value.includes(i))
    const selector = next ? `[data-item="${next}"]` : `[data-answer="${count.value}"]`
    return centerOf(document.querySelector(selector))
  },
})

onMounted(newRound)
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #fff3c4 0%, #d8f3dc 100%)">
    <div class="field">
      <button
        v-for="i in count"
        :key="`${round}-${i}`"
        class="item"
        :data-item="i"
        :class="{ counted: tapped.includes(i) }"
        :style="{ animationDelay: `${i * 60}ms` }"
        @click="tapItem(i)"
      >
        <CountItem :kind="thing" />
        <span v-if="tapped.includes(i)" class="badge">{{ tapNumber(i) }}</span>
      </button>
    </div>

    <div class="answers">
      <button
        v-for="n in options"
        :key="`${round}-${n}`"
        class="answer"
        :data-answer="n"
        :class="{ wrong: wrong.includes(n), right: celebrating && n === count }"
        @click="choose(n)"
      >
        {{ n }}
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.field {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(96%, 900px);
  height: 64%;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 2vmin 3vmin;
}

.item {
  --size: min(17vmin, 160px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  position: relative;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition: transform 0.2s;
}

.item.counted {
  transform: scale(0.88);
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow);
  font-size: 26px;
  font-weight: 800;
  display: grid;
  place-items: center;
  animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.answers {
  position: absolute;
  bottom: 4%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 5vmin;
}

.answer {
  --size: min(20vmin, 150px);
  width: var(--size);
  height: var(--size);
  border-radius: 32px;
  background: #fff;
  border: 6px solid #3a86ff;
  box-shadow: 0 8px 0 #2a64c4;
  font-size: calc(var(--size) * 0.55);
  font-weight: 800;
  color: #2a64c4;
  transition:
    transform 0.12s,
    opacity 0.3s;
}

.answer:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #2a64c4;
}

.answer.wrong {
  opacity: 0.35;
  animation: shake 0.4s;
}

.answer.right {
  background: #3bceac;
  border-color: #2aa88a;
  box-shadow: 0 8px 0 #2aa88a;
  color: #fff;
}

@keyframes pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
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
