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

const prompt = computed(() => t.value.lettersPrompt(animal.value))
const answer = computed(() => initialOf(animal.value, settings.lang))

let timer: number | undefined

function newSet() {
  animal.value = pick(ANIMALS.filter((a) => a !== animal.value))
  // Other letters come from the other animals; each letter appears only once.
  const correct = initialOf(animal.value, settings.lang)
  const others = [...new Set(ANIMALS.map((a) => initialOf(a, settings.lang)))].filter((l) => l !== correct)
  const count = levelOf(round.value) < 2 ? 3 : 4
  letters.value = shuffle([correct, ...shuffle(others).slice(0, count - 1)])
  setId.value++
  done.value = false
  say(prompt.value)
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
  target: () => centerOf(document.querySelector(`[data-letter="${answer.value}"]`)),
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
      <div :key="`animal-${setId}`" class="picture">
        <AnimalIcon :kind="animal" />
      </div>

      <div class="choices">
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
  width: min(34vmin, 300px);
  height: min(34vmin, 300px);
  padding: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3vmin;
}

.letter {
  width: min(20vmin, 180px);
  height: min(20vmin, 180px);
  border-radius: 28%;
  background: #fff;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
  font-size: min(12vmin, 110px);
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
