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

const t = useT()

const levelOf = useLevel()
const round = ref(0)
const setId = ref(0)
const found = ref(0)
const choices = ref<AnimalKind[]>([])
const target = ref<AnimalKind>('cow')
const cheering = ref<AnimalKind | null>(null)
const wobbling = ref<AnimalKind | null>(null)
const busy = ref(false)
const celebrating = ref(false)

const prompt = computed(() => t.value.animalWhere(target.value))

let timer: number | undefined

function newSet() {
  const count = levelOf(round.value) < 2 ? 3 : 4
  target.value = pick(ANIMALS.filter((a) => a !== target.value))
  choices.value = shuffle([target.value, ...shuffle(ANIMALS.filter((a) => a !== target.value)).slice(0, count - 1)])
  setId.value++
  cheering.value = null
  busy.value = false
  say(prompt.value)
}

function tap(animal: AnimalKind) {
  if (busy.value || celebrating.value) return
  if (animal === target.value) {
    busy.value = true
    cheering.value = animal
    found.value++
    sfx.snap()
    say(t.value.animalSays(animal))
    timer = window.setTimeout(() => {
      if (found.value >= GOAL) celebrating.value = true
      else newSet()
    }, 2200)
  } else {
    // A wrong tap isn't punished: the animal just introduces itself.
    wobbling.value = animal
    sfx.tap()
    say(t.value.animalIs(animal))
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
  game: 'animals',
  prompt: () => prompt.value,
  paused: () => celebrating.value || busy.value,
  target: () => centerOf(document.querySelector(`[data-animal="${target.value}"]`)),
})

onMounted(newSet)
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #c7ecff 0%, #c8f0b8 100%)">
    <template #status>
      <ProgressDots :total="GOAL" :done="found" color="#3bceac" />
    </template>

    <div class="meadow">
      <button
        v-for="(a, i) in choices"
        :key="`${setId}-${a}`"
        class="animal"
        :data-animal="a"
        :class="{ cheer: cheering === a, dim: cheering && cheering !== a, wobble: wobbling === a }"
        :style="{ animationDelay: `${i * 80}ms` }"
        @click="tap(a)"
      >
        <AnimalIcon :kind="a" />
      </button>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.meadow {
  position: absolute;
  inset: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 4vmin;
}

.animal {
  --size: min(24vmin, 220px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: calc(var(--size) * 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.08);
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
  background: #fff;
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
    transform: translateY(0) scale(1.05);
  }
  to {
    transform: translateY(-10%) scale(1.15);
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
