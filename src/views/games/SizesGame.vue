<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AnimalIcon from '@/components/AnimalIcon.vue'
import GameShell from '@/components/GameShell.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { useLevel } from '@/lib/difficulty'
import { centerOf, useIdleHints } from '@/lib/hints'
import { ANIMALS, useT, type AnimalKind } from '@/lib/i18n'
import { pick, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

const GOAL = 3

interface Item {
  animal: AnimalKind
  scale: number
}

const t = useT()

const levelOf = useLevel()
const round = ref(0)
const setId = ref(0)
const found = ref(0)
const items = ref<Item[]>([])
const big = ref(true)
const done = ref(false)
const wobbling = ref<AnimalKind | null>(null)
const celebrating = ref(false)

// Besides "tap the biggest / smallest" there is a sorting round: tap all animals from smallest to biggest.
const mode = ref<'pick' | 'order'>('pick')
const order = ref<AnimalKind[]>([])
const prompt = computed(() =>
  mode.value === 'order' ? t.value.sizesOrderPrompt : t.value.sizesPrompt(big.value, items.value.length),
)
const sorted = computed(() => [...items.value].sort((a, b) => a.scale - b.scale))
const answer = computed(() => {
  if (mode.value === 'order') return sorted.value[order.value.length]?.animal ?? null
  return (big.value ? sorted.value[sorted.value.length - 1] : sorted.value[0])?.animal ?? null
})

let timer: number | undefined

function newSet() {
  // Two clearly different sizes at first; later three, asking for the biggest or smallest.
  mode.value = levelOf(round.value) >= 1 && Math.random() < 0.4 ? 'order' : 'pick'
  const scales = levelOf(round.value) < 3 && mode.value === 'pick' ? [0.55, 1] : [0.45, 0.72, 1]
  order.value = []
  const animals = shuffle(ANIMALS).slice(0, scales.length)
  items.value = shuffle(scales.map((scale, i) => ({ animal: animals[i]!, scale })))
  big.value = pick([true, false])
  setId.value++
  done.value = false
  say(prompt.value)
}

function tap(item: Item) {
  if (done.value || celebrating.value) return
  if (item.animal === answer.value) {
    sfx.snap()
    say(t.value.animalName(item.animal))
    if (mode.value === 'order') {
      order.value.push(item.animal)
      if (order.value.length < items.value.length) return
    }
    done.value = true
    found.value++
    timer = window.setTimeout(() => {
      if (found.value >= GOAL) celebrating.value = true
      else newSet()
    }, 1800)
  } else {
    wobbling.value = item.animal
    sfx.tap()
    say(t.value.tryAgain)
    window.setTimeout(() => (wobbling.value = null), 500)
  }
}

function nextRound() {
  celebrating.value = false
  round.value++
  found.value = 0
  newSet()
}

const { hint } = useIdleHints({
  game: 'sizes',
  prompt: () => prompt.value,
  paused: () => celebrating.value || done.value,
  target: () => centerOf(document.querySelector(`[data-animal="${answer.value}"]`)),
})

onMounted(newSet)
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #ffe9c7 0%, #d8f3dc 100%)">
    <template #status>
      <ProgressDots :total="GOAL" :done="found" color="#ff9f1c" />
    </template>

    <div class="row">
      <button
        v-for="(item, i) in items"
        :key="`${setId}-${item.animal}`"
        class="animal"
        :data-animal="item.animal"
        :class="{
          cheer: done && (mode === 'order' || item.animal === answer),
          dim: done && mode === 'pick' && item.animal !== answer,
          ordered: order.includes(item.animal),
          wobble: wobbling === item.animal,
        }"
        :style="{ '--s': item.scale, animationDelay: `${i * 80}ms` }"
        @click="tap(item)"
      >
        <AnimalIcon :kind="item.animal" />
        <span v-if="mode === 'order' && order.includes(item.animal)" class="badge">{{ order.indexOf(item.animal) + 1 }}</span>
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.row {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: calc(4 * var(--u));
  padding-bottom: calc(8 * var(--u));
}

.animal {
  position: relative;
  width: calc(min(calc(40 * var(--u)), 340px) * var(--s));
  height: calc(min(calc(40 * var(--u)), 340px) * var(--s));
  flex: none;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.animal:active {
  transform: scale(0.94);
}

.animal.cheer {
  animation: cheer 0.45s ease-in-out infinite alternate;
}

.badge {
  position: absolute;
  top: -4%;
  right: -4%;
  display: grid;
  place-items: center;
  width: calc(min(calc(40 * var(--u)), 340px) * 0.22);
  height: calc(min(calc(40 * var(--u)), 340px) * 0.22);
  border-radius: 50%;
  background: #ff9f1c;
  color: #fff;
  font-size: calc(min(calc(40 * var(--u)), 340px) * 0.13);
  font-weight: 800;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
}

.animal.dim {
  opacity: 0.35;
}

.animal.wobble {
  animation: wobble 0.45s;
}

@keyframes pop-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes cheer {
  from {
    transform: translateY(0) scale(1);
  }
  to {
    transform: translateY(-8%) scale(1.1);
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
