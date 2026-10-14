<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { DIFFICULTIES } from '@/lib/difficulty'
import { GAME_IDS, LIMIT_OPTIONS } from '@/lib/games'
import { numberToWords, useT, type Lang } from '@/lib/i18n'
import { hasMusic } from '@/lib/music'
import { randInt } from '@/lib/random'
import { useSettings } from '@/stores/settings'
import { useUsage } from '@/stores/usage'

// Apple's Kids Category requires a parental gate in front of settings and outside links.
// The number is spelled out, so it needs reading skills a 2–5 year old doesn't have yet.

const t = useT()
const settings = useSettings()
const usage = useUsage()

// After a few wrong answers the gate pauses, so a child can't just guess its way in.
const MAX_TRIES = 3
const LOCK_MS = 30_000

const open = ref(false)
const unlocked = ref(false)
const target = ref(0)
const entry = ref('')
const shake = ref(false)
const tries = ref(0)
const lockedUntil = ref(0)
const locked = ref(false)
let lockTimer: number | undefined

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
    tries.value = 0
    newChallenge()
  }, Math.max(0, lockedUntil.value - Date.now()))
}

function show() {
  newChallenge()
  unlocked.value = false
  open.value = true
  if (lockedUntil.value > Date.now()) startLock()
}

function close() {
  open.value = false
}

function press(digit: number) {
  if (locked.value || shake.value || entry.value.length >= 2) return
  entry.value += String(digit)
  if (entry.value.length < 2) return
  if (Number(entry.value) === target.value) {
    tries.value = 0
    unlocked.value = true
  } else {
    shake.value = true
    tries.value++
    if (tries.value >= MAX_TRIES) lockedUntil.value = Date.now() + LOCK_MS
    window.setTimeout(() => {
      shake.value = false
      if (tries.value >= MAX_TRIES) startLock()
      else newChallenge()
    }, 450)
  }
}

onBeforeUnmount(() => window.clearTimeout(lockTimer))

const languages: { id: Lang; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
]
</script>

<template>
  <button class="parents-btn" @click="show">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" stroke="currentColor" stroke-width="2.4" fill="none" />
    </svg>
    {{ t.parents.button }}
  </button>

  <Transition name="fade">
    <div v-if="open" class="backdrop" @click.self="close">
      <div class="panel">
        <template v-if="!unlocked">
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
        </template>

        <template v-else>
          <h2>{{ t.parents.settings }}</h2>
          <div class="row">
            <span>{{ t.parents.language }}</span>
            <div class="toggle">
              <button
                v-for="l in languages"
                :key="l.id"
                :class="{ active: settings.lang === l.id }"
                @click="settings.lang = l.id"
              >
                {{ l.label }}
              </button>
            </div>
          </div>
          <div class="row">
            <span>{{ t.parents.sound }}</span>
            <div class="toggle">
              <button :class="{ active: settings.sound }" @click="settings.sound = true">{{ t.parents.on }}</button>
              <button :class="{ active: !settings.sound }" @click="settings.sound = false">{{ t.parents.off }}</button>
            </div>
          </div>
          <div class="row">
            <span>{{ t.parents.voice }}</span>
            <div class="toggle">
              <button :class="{ active: settings.voice }" @click="settings.voice = true">{{ t.parents.on }}</button>
              <button :class="{ active: !settings.voice }" @click="settings.voice = false">{{ t.parents.off }}</button>
            </div>
          </div>
          <div v-if="hasMusic" class="row">
            <span>{{ t.parents.music }}</span>
            <div class="toggle">
              <button :class="{ active: settings.music }" @click="settings.music = true">{{ t.parents.on }}</button>
              <button :class="{ active: !settings.music }" @click="settings.music = false">{{ t.parents.off }}</button>
            </div>
          </div>
          <div class="row">
            <span>{{ t.parents.difficulty }}</span>
            <div class="toggle">
              <button
                v-for="d in DIFFICULTIES"
                :key="d"
                :class="{ active: settings.difficulty === d }"
                @click="settings.difficulty = d"
              >
                {{ t.parents.levels[d] }}
              </button>
            </div>
          </div>
          <div class="row">
            <span>{{ t.parents.timeLimit }}</span>
            <div class="toggle">
              <button
                v-for="m in LIMIT_OPTIONS"
                :key="m"
                :class="{ active: settings.dailyLimit === m }"
                @click="settings.dailyLimit = m"
              >
                {{ m === 0 ? t.parents.unlimited : m }}
              </button>
            </div>
          </div>
          <div class="row played">
            <span>{{ t.parents.played(usage.minutes) }}</span>
            <button class="reset" @click="usage.reset()">{{ t.parents.resetToday }}</button>
          </div>
          <div class="games">
            <span>{{ t.parents.games }}</span>
            <div class="chips">
              <button
                v-for="g in GAME_IDS"
                :key="g"
                :class="{ active: !settings.hiddenGames.includes(g) }"
                @click="settings.toggleGame(g, GAME_IDS.length)"
              >
                {{ t.games[g] }}
              </button>
            </div>
          </div>
          <p class="about">{{ t.parents.tips }}</p>
          <p class="about">{{ t.parents.about }}</p>
        </template>

        <button class="close" @click="close">{{ t.parents.close }}</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.parents-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  color: #4a5a6e;
  font-size: 15px;
  font-weight: 600;
}

.parents-btn svg {
  width: 18px;
  height: 18px;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(20, 30, 45, 0.55);
  padding: 16px;
}

.panel {
  width: min(460px, 100%);
  max-height: 100%;
  overflow: auto;
  background: var(--white);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
  font-size: 18px;
}

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

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #edf1f5;
  text-align: left;
}

.toggle {
  display: flex;
  background: #eef3f8;
  border-radius: 12px;
  padding: 4px;
}

.toggle button {
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 600;
}

.toggle button.active {
  background: #3a86ff;
  color: #fff;
}

.played {
  font-size: 16px;
  color: #6b7a8c;
}

.reset {
  padding: 6px 12px;
  border-radius: 9px;
  background: #eef3f8;
  font-size: 15px;
  font-weight: 600;
}

.games {
  padding: 12px 0;
  text-align: left;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chips button {
  padding: 8px 14px;
  border-radius: 999px;
  background: #eef3f8;
  color: #8a97a6;
  font-size: 16px;
  font-weight: 600;
  text-decoration: line-through;
}

.chips button.active {
  background: #3a86ff;
  color: #fff;
  text-decoration: none;
}

.about {
  margin-top: 16px;
  color: #6b7a8c;
  font-size: 15px;
}

.close {
  margin-top: 20px;
  padding: 12px 28px;
  border-radius: 999px;
  background: #2d3a4a;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
