<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AnimalIcon from '@/components/AnimalIcon.vue'
import GameShell from '@/components/GameShell.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import RewardBurst from '@/components/RewardBurst.vue'
import { useLevel } from '@/lib/difficulty'
import { centerOf, useIdleHints } from '@/lib/hints'
import { ANIMALS, initialOf, useT, type AnimalKind } from '@/lib/i18n'
import { pick, shuffle } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import { useSettings } from '@/stores/settings'

const GOAL = 3

const t = useT()
const settings = useSettings()

const levelOf = useLevel()
const round = ref(0)
const setId = ref(0)
const found = ref(0)
const animal = ref<AnimalKind>('cat')
const letters = ref<string[]>([])
const done = ref(false)
const wobbling = ref<string | null>(null)
const celebrating = ref(false)

// Two ways round: see the animal and pick its first letter, or see the letter and pick an animal.
const mode = ref<'letter' | 'animal'>('letter')
const animalChoices = ref<AnimalKind[]>([])
const prompt = computed(() =>
  mode.value === 'animal' ? t.value.lettersFind(answer.value) : t.value.lettersPrompt(animal.value),
)
const answer = computed(() => initialOf(animal.value, settings.lang))

let timer: number | undefined

function newSet() {
  animal.value = pick(ANIMALS.filter((a) => a !== animal.value))
  if (Math.random() < 0.7) mode.value = mode.value === 'letter' ? 'animal' : 'letter'
  const count = levelOf(round.value) < 2 ? 3 : 4
  if (mode.value === 'animal') {
    // Only one of the animals starts with the letter, so there is a single right answer.
    const letter = initialOf(animal.value, settings.lang)
    const others = ANIMALS.filter((a) => initialOf(a, settings.lang) !== letter)
    animalChoices.value = shuffle([animal.value, ...shuffle(others).slice(0, count - 1)])
    setId.value++
    done.value = false
    say(prompt.value)
    return
  }
  // Other letters come from the other animals; each letter appears only once.
  const correct = initialOf(animal.value, settings.lang)
  const others = [...new Set(ANIMALS.map((a) => initialOf(a, settings.lang)))].filter((l) => l !== correct)
  letters.value = shuffle([correct, ...shuffle(others).slice(0, count - 1)])
  setId.value++
  done.value = false
  say(prompt.value)
}

function tapAnimal(a: AnimalKind) {
  if (done.value || celebrating.value) return
  if (a === animal.value) {
    done.value = true
    found.value++
    sfx.snap()
    say(t.value.lettersIs(a))
    timer = window.setTimeout(() => {
      if (found.value >= GOAL) celebrating.value = true
      else newSet()
    }, 2200)
  } else {
    wobbling.value = a
    sfx.tap()
    say(t.value.animalIs(a))
    window.setTimeout(() => (wobbling.value = null), 500)
  }
}

function tap(letter: string) {
  if (done.value || celebrating.value) return
  if (letter === answer.value) {
    done.value = true
    found.value++
    sfx.snap()
    say(t.value.lettersIs(animal.value))
    timer = window.setTimeout(() => {
      if (found.value >= GOAL) celebrating.value = true
      else newSet()
    }, 2200)
  } else {
    // A wrong tap just says the letter, so the child hears it either way.
    wobbling.value = letter
    sfx.tap()
    say(letter)
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
  game: 'letters',
  prompt: () => prompt.value,
  paused: () => celebrating.value || done.value,
  target: () =>
    centerOf(
      document.querySelector(mode.value === 'animal' ? `[data-animal="${animal.value}"]` : `[data-letter="${answer.value}"]`),
    ),
})

onMounted(newSet)
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #ffe0e0 0%, #fff3c4 100%)">
    <template #status>
      <ProgressDots :total="GOAL" :done="found" color="#ff5a5f" />
    </template>

    <div class="stage-col">
      <div v-if="mode === 'animal'" :key="`letter-${setId}`" class="picture big-letter">{{ answer }}</div>
      <div v-else :key="`animal-${setId}`" class="picture">
        <AnimalIcon :kind="animal" />
      </div>

      <div v-if="mode === 'animal'" class="choices">
        <button
          v-for="(a, i) in animalChoices"
          :key="`${setId}-${a}`"
          class="pick"
          :data-animal="a"
          :class="{ cheer: done && a === animal, dim: done && a !== animal, wobble: wobbling === a }"
          :style="{ animationDelay: `${i * 80}ms` }"
          @click="tapAnimal(a)"
        >
          <AnimalIcon :kind="a" />
        </button>
      </div>

      <div v-else class="choices">
        <button
          v-for="(l, i) in letters"
          :key="`${setId}-${l}`"
          class="letter"
          :data-letter="l"
          :class="{ cheer: done && l === answer, dim: done && l !== answer, wobble: wobbling === l }"
          :style="{ animationDelay: `${i * 80}ms` }"
          @click="tap(l)"
        >
          {{ l }}
        </button>
      </div>
    </div>

    <RewardBurst :show="celebrating" @done="nextRound" />
  </GameShell>
</template>

<style scoped>
.stage-col {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.picture {
  width: min(calc(34 * var(--u)), 300px);
  height: min(calc(34 * var(--u)), 300px);
  padding: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(3 * var(--u));
}

.big-letter {
  display: grid;
  place-items: center;
  font-size: min(calc(22 * var(--u)), 200px);
  font-weight: 800;
  color: #ff5a5f;
}

.pick {
  display: grid;
  place-items: center;
  width: min(calc(20 * var(--u)), 180px);
  height: min(calc(20 * var(--u)), 180px);
  padding: calc(min(calc(20 * var(--u)), 180px) * 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.pick:active {
  transform: scale(0.94);
}

.pick.cheer {
  animation: cheer 0.45s ease-in-out infinite alternate;
  background: #fff;
}

.pick.dim {
  opacity: 0.35;
}

.pick.wobble {
  animation: wobble 0.45s;
}

.letter {
  width: min(calc(20 * var(--u)), 180px);
  height: min(calc(20 * var(--u)), 180px);
  border-radius: 28%;
  background: #fff;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
  font-size: min(calc(12 * var(--u)), 110px);
  font-weight: 800;
  color: #ff5a5f;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.letter:active {
  transform: scale(0.94);
}

.letter.cheer {
  animation: cheer 0.45s ease-in-out infinite alternate;
  background: #ffe14d;
}

.letter.dim {
  opacity: 0.35;
}

.letter.wobble {
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
