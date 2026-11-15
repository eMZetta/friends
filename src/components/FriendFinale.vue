<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FriendMedal from './FriendMedal.vue'
import GalipMascot from './GalipMascot.vue'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import { MAX_TRUST, useFriendship } from '@/stores/friendship'

// Das Ende von Galips Geschichte: Alle Herzen sind voll, Galip schenkt dem Kind die Medaille „Beste Freunde".
// Wurde das letzte Herz in einem Spiel verdient, wartet die Szene, bis die Belohnung vorbei ist.
const t = useT()
const friendship = useFriendship()
const route = useRoute()

const show = ref(false)
/** Erst nach einer kurzen Weile lässt sich die Szene schließen, damit wildes Tippen sie nicht gleich wegwischt. */
const ready = ref(false)
let timer: number | undefined
let readyTimer: number | undefined

const hearts = Array.from({ length: 14 }, (_, id) => ({
  id,
  x: `${6 + ((id * 29) % 88)}%`,
  scale: 0.7 + (id % 4) * 0.25,
  delay: `${-((id * 0.7) % 6)}s`,
  time: `${5 + (id % 4)}s`,
}))

watch(
  () => friendship.finalePending,
  (pending) => {
    window.clearTimeout(timer)
    if (!pending) {
      show.value = false
      return
    }
    const calm = route.name === 'home' || route.name === 'album'
    timer = window.setTimeout(
      () => {
        show.value = true
        ready.value = false
        sfx.success()
        say(t.value.bestFriends, t.value.story[MAX_TRUST]!)
        readyTimer = window.setTimeout(() => (ready.value = true), 2500)
      },
      calm ? 600 : 4300,
    )
  },
  { immediate: true },
)

function close() {
  if (!ready.value) return
  sfx.tap()
  friendship.endFinale()
}

onBeforeUnmount(() => {
  window.clearTimeout(timer)
  window.clearTimeout(readyTimer)
})
</script>

<template>
  <Transition name="finale">
    <div v-if="show" class="finale" role="dialog" :aria-label="t.bestFriends" @click="close">
      <svg
        v-for="h in hearts"
        :key="h.id"
        class="rise"
        viewBox="0 0 32 30"
        aria-hidden="true"
        :style="{ left: h.x, '--k': h.scale, '--d': h.delay, '--t': h.time }"
      >
        <path d="M16 28 C4 19 2 12 2 8.5 A7 7 0 0 1 16 6 A7 7 0 0 1 30 8.5 C30 12 28 19 16 28 Z" />
      </svg>
      <h1>{{ t.bestFriends }}</h1>
      <div class="stage">
        <div class="galip"><GalipMascot happy /></div>
        <div class="medal"><FriendMedal /></div>
      </div>
      <p>{{ t.story[MAX_TRUST] }}</p>
      <button class="ok" :class="{ ready }" :aria-label="t.back" @click.stop="close">
        <svg viewBox="0 0 32 30" aria-hidden="true">
          <path d="M16 28 C4 19 2 12 2 8.5 A7 7 0 0 1 16 6 A7 7 0 0 1 30 8.5 C30 12 28 19 16 28 Z" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.finale {
  position: fixed;
  inset: 0;
  z-index: 95;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2vmin;
  padding: 16px;
  text-align: center;
  color: var(--cream);
  background: radial-gradient(circle at 50% 78%, #ffb77e 0%, #d9709a 38%, #4b3f9e 100%);
}

h1 {
  margin: 0;
  z-index: 1;
  font-size: clamp(36px, 10vmin, 96px);
  font-weight: 800;
  line-height: 1;
  text-shadow:
    0 0 18px rgba(255, 226, 122, 0.9),
    0 0 42px rgba(255, 226, 122, 0.45);
  animation: pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
}

.stage {
  z-index: 1;
  position: relative;
  width: min(54vmin, 420px);
  aspect-ratio: 1;
}

.galip {
  position: absolute;
  inset: 0 12% 14%;
  filter: drop-shadow(0 0 24px rgba(255, 246, 232, 0.65));
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

/* Die Medaille fällt Galip vor die Brust und pendelt dort leicht. */
.medal {
  position: absolute;
  left: 50%;
  bottom: -2%;
  width: 26%;
  margin-left: -13%;
  transform-origin: 50% 0;
  filter: drop-shadow(0 6px 10px rgba(30, 18, 70, 0.4));
  animation:
    drop-in 0.8s 0.9s cubic-bezier(0.3, 1.5, 0.5, 1) backwards,
    swing 3s 1.7s ease-in-out infinite;
}

p {
  margin: 0;
  z-index: 1;
  max-width: 24em;
  font-size: clamp(18px, 3.6vmin, 30px);
  font-weight: 800;
  animation: pop 0.6s 1.4s backwards;
}

.ok {
  z-index: 1;
  width: clamp(64px, 10vmin, 92px);
  height: clamp(64px, 10vmin, 92px);
  margin-top: 1vmin;
  border-radius: 50%;
  background: var(--cream);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 0.4s,
    transform 0.4s;
  pointer-events: none;
}

.ok.ready {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.ok svg {
  width: 52%;
  fill: #ff6b8b;
}

.rise {
  position: absolute;
  bottom: -60px;
  width: calc(32px * var(--k));
  fill: #ff6b8b;
  opacity: 0;
  animation: rise var(--t) linear var(--d) infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(-115vh);
    opacity: 0;
  }
}

@keyframes pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}

@keyframes drop-in {
  from {
    transform: translateY(-60vh) rotate(-30deg);
    opacity: 0;
  }
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
}

.finale-enter-active,
.finale-leave-active {
  transition: opacity 0.5s;
}

.finale-enter-from,
.finale-leave-to {
  opacity: 0;
}
</style>
