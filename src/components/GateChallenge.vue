<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { numberToWords, useT } from '@/lib/i18n'
import { randInt } from '@/lib/random'
import { useGate } from '@/stores/gate'
import { useSettings } from '@/stores/settings'

// The number is spelled out, so it needs reading skills a 2–5 year old doesn't have yet.
// After a few wrong answers the gate locks (also across app restarts), so a child can't guess its way in.
// Used for the parents' area and again, with a fresh number, in front of the coffee box.

const emit = defineEmits<{ pass: [] }>()

const t = useT()
const settings = useSettings()
const gate = useGate()

const target = ref(0)
const entry = ref('')
const shake = ref(false)
const locked = ref(false)
let lockTimer: number | undefined
let failTimer: number | undefined

const targetWords = computed(() => numberToWords(target.value, settings.lang))

function newChallenge() {
  let n = randInt(21, 99)
  while (n % 10 === 0) n = randInt(21, 99)
  target.value = n
  entry.value = ''
}

function startLock() {
  locked.value = true
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(() => {
    locked.value = false
    newChallenge()
  }, gate.remaining())
}

function press(digit: number) {
  if (locked.value || shake.value || entry.value.length >= 2) return
  entry.value += String(digit)
  if (entry.value.length < 2) return
  if (Number(entry.value) === target.value) {
    gate.succeed()
    emit('pass')
  } else {
    shake.value = true
    const locks = gate.fail()
    failTimer = window.setTimeout(() => {
      shake.value = false
      if (locks) startLock()
      else newChallenge()
    }, 450)
  }
}

newChallenge()
if (gate.remaining() > 0) startLock()

onBeforeUnmount(() => {
  window.clearTimeout(lockTimer)
  window.clearTimeout(failTimer)
})
</script>

<template>
  <div class="challenge">
    <h2>{{ t.parents.gateTitle }}</h2>
    <p>{{ t.parents.gateAsk }}</p>
    <p v-if="locked" class="words">{{ t.parents.locked }}</p>
    <template v-else>
      <p class="words">{{ targetWords }}</p>
      <div class="entry" :class="{ shake }">
        <span>{{ entry[0] ?? '_' }}</span>
        <span>{{ entry[1] ?? '_' }}</span>
      </div>
      <div class="keypad">
        <button v-for="d in [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]" :key="d" @click="press(d)">{{ d }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 8px;
  font-size: 26px;
}

p {
  margin: 4px 0;
}

.words {
  font-size: 26px;
  font-weight: 700;
  margin: 12px 0;
}

.entry {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.entry span {
  width: 52px;
  border-bottom: 4px solid #c9d3df;
}

.entry.shake {
  animation: shake 0.4s;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.keypad button {
  height: 56px;
  border-radius: 14px;
  background: #eef3f8;
  font-size: 24px;
  font-weight: 700;
}

.keypad button:active {
  background: #d6e2ee;
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
