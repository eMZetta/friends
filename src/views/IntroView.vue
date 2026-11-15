<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import GalipMascot from '@/components/GalipMascot.vue'
import { markIntroSeen } from '@/lib/intro'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'

// Der erste Start erzählt den Anfang der Geschichte: Galip versteckt sich hinter dem Hügel und ist schüchtern.
// Das Kind soll ihn ganz sanft antippen, dann kommt er hervor. Wildes Tippen erschreckt ihn und er taucht wieder ab.
// Wer gar nichts tut, dem zeigt sich Galip nach einer Weile von selbst, so bleibt niemand hängen.
const t = useT()
const router = useRouter()

type Step = 'peek' | 'hello' | 'go'
const step = ref<Step>('peek')
const shy = ref(false)
const timers: number[] = []
const taps: number[] = []
let lastTap = 0
let pending: number | undefined

const fireflies = Array.from({ length: 12 }, (_, id) => ({
  id,
  x: `${(id * 37 + 8) % 96}%`,
  y: `${10 + ((id * 23) % 50)}%`,
  size: `${6 + (id % 4) * 3}px`,
  delay: `${-((id * 1.7) % 9)}s`,
  time: `${6 + (id % 5) * 1.4}s`,
}))

const WILD_TAPS = 3
const WILD_WINDOW_MS = 1200
const CALM_MS = 2500
const SHOW_UP_MS = 14000

/** Wie weit Galip hinter dem Hügel steckt: nur Ohren, ganz da, oder erschrocken fast verschwunden. */
const hide = computed(() => (shy.value ? '62%' : step.value === 'peek' ? '50%' : '0%'))

const line = computed(() => {
  if (shy.value) return t.value.shy
  return step.value === 'peek' ? t.value.intro.peek : step.value === 'hello' ? t.value.intro.hello : t.value.intro.go
})

function later(ms: number, fn: () => void) {
  timers.push(window.setTimeout(fn, ms))
}

function comeOut() {
  if (step.value !== 'peek' || shy.value) return
  sfx.tap()
  step.value = 'hello'
  say(t.value.intro.hello)
  later(4200, () => {
    step.value = 'go'
    say(t.value.intro.go)
  })
}

function startle() {
  window.clearTimeout(pending)
  shy.value = true
  say(t.value.shy)
  const check = () => {
    if (Date.now() - lastTap < CALM_MS) return later(500, check)
    shy.value = false
    if (step.value === 'peek') say(t.value.intro.peek)
  }
  later(2000, check)
}

function onPointerDown() {
  const now = Date.now()
  lastTap = now
  while (taps.length && now - taps[0]! > WILD_WINDOW_MS) taps.shift()
  taps.push(now)
  if (step.value === 'peek' && !shy.value && taps.length >= WILD_TAPS) {
    taps.length = 0
    startle()
    return
  }
  // Ein einzelnes, ruhiges Antippen irgendwo genügt: Galip wartet kurz, ob noch mehr Tipps folgen.
  if (step.value === 'peek' && !shy.value) {
    window.clearTimeout(pending)
    pending = window.setTimeout(comeOut, 900)
  }
}

function start() {
  sfx.success()
  markIntroSeen()
  void router.replace({ name: 'home' })
}

onMounted(() => {
  later(700, () => say(t.value.intro.peek))
  later(SHOW_UP_MS, comeOut)
})

onBeforeUnmount(() => {
  timers.forEach((id) => window.clearTimeout(id))
  window.clearTimeout(pending)
})
</script>

<template>
  <main class="intro" @pointerdown="onPointerDown">
    <div class="sunset" />
    <i
      v-for="f in fireflies"
      :key="f.id"
      class="firefly"
      :style="{ left: f.x, top: f.y, '--s': f.size, '--d': f.delay, '--t': f.time }"
    />
    <div class="far" />

    <Transition name="line">
      <p :key="line" class="line" data-testid="intro-line">{{ line }}</p>
    </Transition>

    <button
      class="buddy"
      :class="{ invite: step === 'peek' && !shy }"
      :style="{ '--hide': hide }"
      aria-label="Galip"
      tabindex="-1"
    >
      <GalipMascot :shy="step === 'peek'" :happy="step !== 'peek'" />
    </button>

    <div class="near" />

    <Transition name="go">
      <button v-if="step === 'go'" class="start" :aria-label="t.intro.start" @click="start">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M16 10 L38 24 L16 38 Z" fill="#2c9c7c" stroke="#2c9c7c" stroke-width="6" stroke-linejoin="round" />
        </svg>
      </button>
    </Transition>
  </main>
</template>

<style scoped>
.intro {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--dusk-top) 0%, var(--dusk-mid) 58%, var(--dusk-low) 82%);
}

.sunset {
  position: absolute;
  left: 50%;
  bottom: 8%;
  width: 90vmax;
  height: 90vmax;
  transform: translate(-50%, 50%);
  background: radial-gradient(circle, rgba(255, 226, 122, 0.55) 0%, rgba(255, 226, 122, 0) 55%);
}

.firefly {
  position: absolute;
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  background: var(--glow);
  box-shadow:
    0 0 calc(var(--s) * 2) calc(var(--s) * 0.6) rgba(255, 226, 122, 0.75),
    0 0 calc(var(--s) * 5) rgba(255, 226, 122, 0.35);
  animation: wander var(--t) ease-in-out var(--d) infinite alternate;
}

@keyframes wander {
  from {
    transform: translate(0, 0);
    opacity: 0.35;
  }
  to {
    transform: translate(26px, -34px);
    opacity: 1;
  }
}

.far {
  position: absolute;
  left: -15%;
  right: -15%;
  bottom: -40vh;
  height: 62vh;
  border-radius: 50%;
  background: var(--meadow-far);
}

/* Der Hügel vor Galip: Er versteckt sich dahinter. */
.near {
  position: absolute;
  z-index: 3;
  left: -20%;
  right: -20%;
  bottom: -34vh;
  height: 58vh;
  border-radius: 50%;
  background: var(--meadow-near);
  box-shadow: inset 0 14px 0 rgba(255, 255, 255, 0.08);
}

.line {
  position: absolute;
  z-index: 4;
  top: max(5vh, env(safe-area-inset-top));
  left: 50%;
  width: max-content;
  max-width: min(86vw, 820px);
  margin: 0;
  transform: translateX(-50%);
  padding: 0.55em 1.1em;
  border-radius: 28px;
  background: var(--cream);
  box-shadow: var(--shadow);
  color: var(--ink);
  text-align: center;
  font-size: clamp(20px, 4.6vmin, 44px);
  font-weight: 800;
  line-height: 1.2;
}

.buddy {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 21vh;
  width: clamp(160px, 46vmin, 420px);
  margin-left: calc(clamp(160px, 46vmin, 420px) / -2);
  transform: translateY(var(--hide));
  transition: transform 1.4s cubic-bezier(0.3, 0.9, 0.3, 1);
  filter: drop-shadow(0 0 20px rgba(255, 246, 232, 0.5));
}

/* Eine leise Einladung: Galip glimmt sanft, solange er noch wartet. */
.buddy.invite {
  animation: invite 2.4s ease-in-out infinite;
}

@keyframes invite {
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 226, 122, 0.95));
  }
}

.start {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 5vh;
  width: clamp(84px, 14vmin, 130px);
  height: clamp(84px, 14vmin, 130px);
  margin-left: calc(clamp(84px, 14vmin, 130px) / -2);
  border-radius: 50%;
  background: var(--cream);
  box-shadow:
    0 0 30px rgba(255, 226, 122, 0.7),
    var(--shadow);
  display: grid;
  place-items: center;
  animation: bob 1.4s ease-in-out infinite;
}

.start svg {
  width: 52%;
  margin-left: 6%;
}

@keyframes bob {
  50% {
    transform: translateY(-8px);
  }
}

.line-enter-active,
.line-leave-active,
.go-enter-active {
  transition:
    opacity 0.35s,
    transform 0.35s;
}

.line-enter-from,
.line-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.go-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
</style>
