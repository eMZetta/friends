<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import GateChallenge from '@/components/GateChallenge.vue'
import {
  COFFEE_AMOUNTS,
  donate,
  donationsAvailable,
  loadPrices,
  type CoffeeAmount,
  type DonationResult,
} from '@/lib/donate'
import { useT } from '@/lib/i18n'

// Four hurdles keep children out: the parents' gate, a second gate with a new number every time the
// coffee box opens, a confirmation that has to be held, and finally the store's own payment sheet.

const emit = defineEmits<{ back: []; about: [] }>()

const HOLD_MS = 1500
const IDLE_MS = 60_000

const t = useT()
const passed = ref(false)
const chosen = ref<CoffeeAmount | null>(null)
const prices = ref<Partial<Record<CoffeeAmount, string>>>({})
const loading = ref(true)
const busy = ref(false)
const result = ref<DonationResult | null>(null)
const holding = ref(false)
const available = donationsAvailable()
let holdTimer: number | undefined
let idleTimer: number | undefined

// Whoever walks away from the open coffee box leaves it locked again after a minute.
function touch() {
  window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => emit('back'), IDLE_MS)
}

onMounted(async () => {
  touch()
  prices.value = await loadPrices()
  loading.value = false
})

onBeforeUnmount(() => {
  window.clearTimeout(holdTimer)
  window.clearTimeout(idleTimer)
})

function choose(amount: CoffeeAmount) {
  if (!prices.value[amount] || busy.value) return
  touch()
  chosen.value = amount
  result.value = null
}

function startHold() {
  if (busy.value || !chosen.value) return
  touch()
  holding.value = true
  window.clearTimeout(holdTimer)
  holdTimer = window.setTimeout(() => void confirm(), HOLD_MS)
}

function stopHold() {
  holding.value = false
  window.clearTimeout(holdTimer)
}

async function confirm() {
  const amount = chosen.value
  holding.value = false
  if (!amount || busy.value) return
  busy.value = true
  result.value = await donate(amount)
  busy.value = false
  chosen.value = null
}
</script>

<template>
  <div class="coffee" @pointerdown="touch">
    <GateChallenge v-if="!passed" @pass="passed = true" />

    <template v-else>
      <h2>☕ {{ t.coffee.title }}</h2>

      <template v-if="result === 'thanks'">
        <p class="thanks">{{ t.coffee.thanks }}</p>
      </template>

      <template v-else-if="chosen">
        <p class="ask">{{ t.coffee.confirm(prices[chosen] ?? `CHF ${chosen}`) }}</p>
        <p class="small">{{ t.coffee.holdHint }}</p>
        <button
          class="hold"
          :class="{ holding }"
          :disabled="busy"
          @pointerdown.prevent="startHold"
          @pointerup="stopHold"
          @pointerleave="stopHold"
          @pointercancel="stopHold"
        >
          <span class="fill" :style="{ transitionDuration: holding ? `${HOLD_MS}ms` : '0.2s' }" />
          <span class="label">{{ busy ? t.coffee.waiting : t.coffee.hold }}</span>
        </button>
        <button class="link" :disabled="busy" @click="chosen = null">{{ t.coffee.change }}</button>
      </template>

      <template v-else>
        <p>{{ t.coffee.intro }}</p>
        <p v-if="!available" class="small">{{ t.coffee.onlyInApp }}</p>
        <p v-else-if="!loading && !Object.keys(prices).length" class="small">{{ t.coffee.unavailable }}</p>
        <p v-if="result === 'cancelled'" class="small">{{ t.coffee.cancelled }}</p>
        <p v-if="result === 'error'" class="small">{{ t.coffee.failed }}</p>
        <div class="amounts">
          <button v-for="a in COFFEE_AMOUNTS" :key="a" :disabled="!prices[a]" @click="choose(a)">
            {{ prices[a] ?? `CHF ${a}` }}
          </button>
        </div>
        <p class="small">{{ t.coffee.free }}</p>
      </template>

      <button v-if="!chosen" class="link" @click="emit('about')">{{ t.coffee.more }}</button>
    </template>

    <button class="link" @click="emit('back')">{{ t.coffee.back }}</button>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 8px;
  font-size: 26px;
}

p {
  margin: 8px 0;
}

.small {
  font-size: 15px;
  color: #6b7a8c;
}

.ask {
  font-size: 24px;
  font-weight: 700;
}

.thanks {
  font-size: 24px;
  font-weight: 700;
  color: #1f8a4c;
}

.amounts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.amounts button {
  height: 64px;
  border-radius: 16px;
  background: #3a86ff;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.amounts button:disabled {
  background: #d6dde6;
  color: #8a97a6;
}

.hold {
  position: relative;
  width: 100%;
  height: 64px;
  margin: 16px 0 4px;
  overflow: hidden;
  border-radius: 16px;
  background: #d6e2ee;
  font-size: 20px;
  font-weight: 700;
}

.hold .fill {
  position: absolute;
  inset: 0;
  background: #3a86ff;
  transform: scaleX(0);
  transform-origin: left;
  transition-property: transform;
  transition-timing-function: linear;
}

.hold.holding .fill {
  transform: scaleX(1);
}

.hold .label {
  position: relative;
  color: #2d3a4a;
}

.hold.holding .label {
  color: #fff;
}

.link {
  display: block;
  margin: 12px auto 0;
  padding: 8px 14px;
  color: #3a86ff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: underline;
}
</style>
