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
const prompt = computed(() => t.value.shadowsPrompt)

const levelOf = useLevel()
const round = ref(0)
const setId = ref(0)
const found = ref(0)
const choices = ref<AnimalKind[]>([])
const target = ref<AnimalKind>('cat')
const revealed = ref(false)
const wobbling = ref<AnimalKind | null>(null)
const celebrating = ref(false)

let timer: number | undefined

function newSet() {
  const count = levelOf(round.value) < 2 ? 3 : 4
  target.value = pick(ANIMALS.filter((a) => a !== target.value))
  choices.value = shuffle([target.value, ...shuffle(ANIMALS.filter((a) => a !== target.value)).slice(0, count - 1)])
  setId.value++
  revealed.value = false
  say(prompt.value)
}

function tap(animal: AnimalKind) {
  if (revealed.value || celebrating.value) return
  if (animal === target.value) {
    revealed.value = true
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
  game: 'shadows',
  prompt: () => prompt.value,
  paused: () => celebrating.value || revealed.value,
  target: () => centerOf(document.querySelector(`[data-animal="${target.value}"]`)),
})

onMounted(newSet)
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <GameShell :prompt="prompt" :hint="hint" background="linear-gradient(180deg, #2d3a6e 0%, #8e7cf0 100%)">
    <template #status>
      <ProgressDots :total="GOAL" :done="found" color="#ffd23f" />
    </template>

    <div class="stage-col">
      <div :key="`shadow-${setId}`" class="shadow" :class="{ revealed }">
        <AnimalIcon :kind="target" />
      </div>

      <div class="choices">
        <button
          v-for="(a, i) in choices"
          :key="`${setId}-${a}`"
          class="animal"
          :data-animal="a"
          :class="{ dim: revealed && a !== target, cheer: revealed && a === target, wobble: wobbling === a }"
          :style="{ animationDelay: `${i * 80}ms` }"
          @click="tap(a)"
        >
          <AnimalIcon :kind="a" />
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

.shadow {
  width: min(34vmin, 300px);
  height: min(34vmin, 300px);
  padding: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

.shadow :deep(svg) {
  width: 100%;
  height: 100%;
  filter: brightness(0) opacity(0.7);
  transition: filter 0.5s;
}

.shadow.revealed :deep(svg) {
  filter: none;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3vmin;
}

.animal {
  --size: min(20vmin, 180px);
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: calc(var(--size) * 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
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
