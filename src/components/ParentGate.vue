<script setup lang="ts">
import { computed, ref } from 'vue'

import { numberToWords, useT, type Lang } from '@/lib/i18n'
import { hasMusic } from '@/lib/music'
import { randInt } from '@/lib/random'
import { useSettings } from '@/stores/settings'

// Apple's Kids Category requires a parental gate in front of settings and outside links.
// The number is spelled out, so it needs reading skills a 2–5 year old doesn't have yet.

const t = useT()
const settings = useSettings()

const open = ref(false)
const unlocked = ref(false)
const target = ref(0)
const entry = ref('')
const shake = ref(false)

const targetWords = computed(() => numberToWords(target.value, settings.lang))

function newChallenge() {
  let n = randInt(21, 99)
  while (n % 10 === 0) n = randInt(21, 99)
  target.value = n
  entry.value = ''
}

function show() {
  newChallenge()
  unlocked.value = false
  open.value = true
}

function close() {
  open.value = false
}

function press(digit: number) {
  if (entry.value.length >= 2) return
  entry.value += String(digit)
  if (entry.value.length < 2) return
  if (Number(entry.value) === target.value) {
    unlocked.value = true
  } else {
    shake.value = true
    window.setTimeout(() => {
      shake.value = false
      newChallenge()
    }, 450)
  }
}

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
          <p class="words">{{ targetWords }}</p>
          <div class="entry" :class="{ shake }">
            <span>{{ entry[0] ?? '_' }}</span>
            <span>{{ entry[1] ?? '_' }}</span>
          </div>
          <div class="keypad">
            <button v-for="d in [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]" :key="d" @click="press(d)">{{ d }}</button>
          </div>
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
