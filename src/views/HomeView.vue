<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AnimalIcon from '@/components/AnimalIcon.vue'
import CountItem from '@/components/CountItem.vue'
import GalipMascot from '@/components/GalipMascot.vue'
import ParentGate from '@/components/ParentGate.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLORS } from '@/lib/colors'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import { MAX_TRUST, useFriendship } from '@/stores/friendship'
import { useSettings } from '@/stores/settings'
import { useStickers } from '@/stores/stickers'

const t = useT()
const router = useRouter()
const happy = ref(false)
const stickers = useStickers()
const settings = useSettings()
const friendship = useFriendship()

const tiles = [
  { route: 'shapes', key: 'shapes', color: '#ffb3c7' },
  { route: 'count', key: 'count', color: '#ffe08a' },
  { route: 'balloons', key: 'balloons', color: '#b8e8a8' },
  { route: 'animals', key: 'animals', color: '#a8dcf5' },
  { route: 'memory', key: 'memory', color: '#d4c8ff' },
  { route: 'patterns', key: 'patterns', color: '#ffc9a3' },
  { route: 'music', key: 'music', color: '#ffd1dc' },
  { route: 'shadows', key: 'shadows', color: '#c9c3f5' },
  { route: 'sizes', key: 'sizes', color: '#c6ecc0' },
  { route: 'paint', key: 'paint', color: '#ffe3a8' },
  { route: 'letters', key: 'letters', color: '#ffc6c6' },
] as const

// Jede Kachel bekommt eine andere Form, damit die Startseite wie ein Holzspielzeug-Set wirkt statt wie ein Raster.
const SHAPES = ['squircle', 'arch', 'round', 'leaf'] as const

const fireflies = Array.from({ length: 14 }, (_, id) => ({
  id,
  x: `${(id * 37 + 8) % 96}%`,
  y: `${12 + ((id * 23) % 58)}%`,
  size: `${6 + (id % 4) * 3}px`,
  delay: `${-((id * 1.7) % 9)}s`,
  time: `${6 + (id % 5) * 1.4}s`,
}))

const visibleTiles = computed(() => tiles.filter((tile) => !settings.hiddenGames.includes(tile.key)))

function play(route: (typeof tiles)[number]['route']) {
  sfx.tap()
  say(t.value.games[route])
  void router.push({ name: route })
}

function openAlbum() {
  sfx.tap()
  void router.push({ name: 'album' })
}

// Galip geht auf Entdeckungstour: Er trabt von selbst gemütlich über den Bildschirm, in jede Richtung.
// Ein Tipp auf den Hintergrund wirft einen Ball, den er holt. Es ist immer nur ein Ball unterwegs,
// weitere Tipps werden ignoriert, damit es ruhig bleibt.
// Galip ist ängstlich: Wildes Tippen erschreckt ihn, er läuft weg und versteckt sich in einer Ecke.
// Wird es wieder ruhig, kommt er langsam zurück und vertraut dem Kind ein Herz mehr.
const galipEl = ref<HTMLElement>()
const ball = ref<{ x: number; y: number } | null>(null)
const dog = ref({ dx: 0, dy: 0, ms: 0 })
const pose = ref<'front' | 'side' | 'back'>('front')
const flip = ref(false)
const walking = ref(false)
const shy = ref(false)
const hearts = ref<{ id: number; x: number; y: number }[]>([])
const SPEED = 0.17 // Pixel pro Millisekunde: ruhiges Tempo
const FLEE_SPEED = 0.32
const COME_BACK_SPEED = 0.07 // sehr langsam und vorsichtig
const WILD_TAPS = 5 // so viele Tipps innerhalb von 1,5 Sekunden erschrecken ihn
const CALM_MS = 3500
const taps: number[] = []
let lastTap = 0
let heartId = 0
const timers: number[] = []
let run = 0
let fetching = false

function wait(ms: number) {
  return new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)))
}

/** Mittelpunkt, an dem Galip in der Ruheposition steht (Layout-Position, ohne Verschiebung). */
function restCenter(el: HTMLElement) {
  const parent = (el.offsetParent as HTMLElement).getBoundingClientRect()
  return { x: parent.left + el.offsetLeft + el.offsetWidth / 2, y: parent.top + el.offsetTop + el.offsetHeight / 2 }
}

/** Läuft zu einem Punkt, dreht sich in Laufrichtung und liefert die Dauer in Millisekunden. */
function walkTo(x: number, y: number, noseToTarget = false, speed = SPEED): number {
  const el = galipEl.value
  if (!el) return 0
  const rest = restCenter(el)
  const w = el.offsetWidth
  const h = el.offsetHeight
  const from = { x: rest.x + dog.value.dx, y: rest.y + dog.value.dy }
  const vx = x - from.x
  const vy = y - from.y
  const sideways = Math.abs(vx) >= Math.abs(vy)

  // Bei der Seitenansicht sitzt die Nase vorn: Der Ball soll dort landen, nicht in der Mitte.
  const nose = noseToTarget && sideways ? Math.sign(vx) * w * 0.36 : 0
  const tx = Math.min(Math.max(x - nose, w / 2), window.innerWidth - w / 2)
  const ty = Math.min(Math.max(y, h / 2), window.innerHeight - h / 2)
  const ms = Math.min(Math.max(Math.hypot(tx - from.x, ty - from.y) / speed, 900), 8000)

  pose.value = sideways ? 'side' : vy > 0 ? 'front' : 'back'
  flip.value = sideways && vx < 0
  walking.value = true
  dog.value = { dx: tx - rest.x, dy: ty - rest.y, ms }
  return ms
}

function stand() {
  walking.value = false
  pose.value = 'front'
  flip.value = false
}

async function explore(token: number) {
  const el = galipEl.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  while (token === run) {
    await wait(1500 + Math.random() * 2500)
    if (token !== run) return
    const m = el.offsetWidth * 0.6
    const ms = walkTo(m + Math.random() * (window.innerWidth - 2 * m), m + Math.random() * (window.innerHeight - 2 * m))
    await wait(ms + 150)
    if (token !== run) return
    stand()
  }
}

/** Lässt ein paar Herzen aus Galip aufsteigen und zählt das Vertrauen hoch. */
function earnHeart() {
  const el = galipEl.value
  if (el) {
    const rest = restCenter(el)
    const x = rest.x + dog.value.dx
    const y = rest.y + dog.value.dy - el.offsetHeight * 0.3
    const added = [-1, 0, 1].map((i) => ({ id: ++heartId, x: x + i * 34, y: y - Math.abs(i) * 8 }))
    hearts.value.push(...added)
    void wait(2400).then(() => (hearts.value = hearts.value.filter((h) => !added.some((a) => a.id === h.id))))
  }
  if (friendship.grow()) say(t.value.friend)
}

async function startle(x: number, y: number) {
  const el = galipEl.value
  if (!el) return
  const token = ++run
  fetching = true
  ball.value = null
  happy.value = false
  shy.value = true
  say(t.value.shy)

  // Weg von der Stelle, an der gerade wild getippt wurde: in die entfernteste Ecke.
  const w = el.offsetWidth * 0.6
  const h = el.offsetHeight * 0.6
  const cx = x < window.innerWidth / 2 ? window.innerWidth - w : w
  const cy = y < window.innerHeight / 2 ? window.innerHeight - h : h
  await wait(walkTo(cx, cy, false, FLEE_SPEED) + 200)
  if (token !== run) return
  stand()

  // Er bleibt dort, bis das Kind mindestens ein paar Sekunden lang nicht mehr getippt hat.
  await wait(2000)
  while (token === run && Date.now() - lastTap < CALM_MS) await wait(400)
  if (token !== run) return

  // Langsam und vorsichtig zurück; auf halbem Weg wird er mutiger.
  const rest = restCenter(el)
  const ms = walkTo(rest.x, rest.y, false, COME_BACK_SPEED)
  await wait(ms / 2)
  if (token !== run) return
  shy.value = false
  await wait(ms / 2 + 100)
  if (token !== run) return

  stand()
  happy.value = true
  earnHeart()
  await wait(2000)
  if (token !== run) return
  happy.value = false
  fetching = false
  void explore(token)
}

function onPointerDown(e: PointerEvent) {
  if ((e.target as HTMLElement).closest('.backdrop')) return
  const now = Date.now()
  lastTap = now
  while (taps.length && now - taps[0]! > 1500) taps.shift()
  taps.push(now)
  if (shy.value) return
  if (taps.length >= WILD_TAPS) {
    taps.length = 0
    void startle(e.clientX, e.clientY)
    return
  }
  void throwBall(e)
}

async function throwBall(e: PointerEvent) {
  if (fetching || !galipEl.value || (e.target as HTMLElement).closest('button')) return
  fetching = true
  const token = ++run
  sfx.tap()
  ball.value = { x: e.clientX, y: e.clientY }

  await wait(500) // der Ball fällt und hüpft
  if (token !== run) return
  const ms = walkTo(e.clientX, e.clientY, true)
  await wait(ms + 100)
  if (token !== run) return

  ball.value = null
  sfx.snap()
  stand()
  happy.value = true
  earnHeart()
  await wait(1600)
  if (token !== run) return
  happy.value = false
  fetching = false
  void explore(token)
}

onMounted(() => void explore(run))
onBeforeUnmount(() => {
  run++
  timers.forEach((id) => window.clearTimeout(id))
})

function greet() {
  sfx.tap()
  say(t.value.hello)
  happy.value = true
  window.setTimeout(() => (happy.value = false), 1600)
}
</script>

<template>
  <main class="home" @pointerdown="onPointerDown">
    <div class="sunset" />
    <i
      v-for="f in fireflies"
      :key="f.id"
      class="firefly"
      :style="{ left: f.x, top: f.y, '--s': f.size, '--d': f.delay, '--t': f.time }"
    />
    <div class="meadow far" />
    <div class="meadow near" />

    <header class="top">
      <div class="brand">
        <h1 class="logo">
          <span v-for="(ch, i) in 'Galip'" :key="i" :style="{ animationDelay: `${i * 0.15}s` }">{{ ch }}</span>
        </h1>
        <p class="age" data-testid="age-badge">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <ellipse cx="20" cy="26" rx="9" ry="7.5" />
            <circle cx="9" cy="17" r="4" />
            <circle cx="16" cy="10" r="4" />
            <circle cx="24" cy="10" r="4" />
            <circle cx="31" cy="17" r="4" />
          </svg>
          {{ t.parents.ageBadge(t.parents.levels[settings.difficulty]) }}
        </p>
        <p class="trust" :aria-label="t.hearts" data-testid="trust">
          <svg
            v-for="n in MAX_TRUST"
            :key="n"
            viewBox="0 0 32 30"
            :class="{ full: n <= friendship.trust }"
            aria-hidden="true"
          >
            <path d="M16 28 C4 19 2 12 2 8.5 A7 7 0 0 1 16 6 A7 7 0 0 1 30 8.5 C30 12 28 19 16 28 Z" />
          </svg>
        </p>
      </div>
      <ParentGate />
    </header>

    <section class="content">
      <button
        ref="galipEl"
        class="galip"
        :class="{ away: dog.dx || dog.dy }"
        aria-label="Galip"
        :style="{ transform: `translate(${dog.dx}px, ${dog.dy}px)`, transitionDuration: `${dog.ms}ms` }"
        @click="greet"
      >
        <GalipMascot :happy="happy" :shy="shy" :pose="pose" :flip="flip" :walking="walking" />
      </button>

      <nav class="tiles">
        <button
          v-for="(tile, i) in visibleTiles"
          :key="tile.key"
          class="tile"
          :class="SHAPES[i % SHAPES.length]"
          :style="{ background: tile.color }"
          @click="play(tile.route)"
        >
          <div class="art">
            <template v-if="tile.key === 'shapes'">
              <div class="mini"><ShapeIcon kind="star" :color="COLORS.yellow" /></div>
              <div class="mini"><ShapeIcon kind="circle" :color="COLORS.blue" /></div>
              <div class="mini"><ShapeIcon kind="triangle" :color="COLORS.red" /></div>
            </template>
            <template v-else-if="tile.key === 'count'">
              <div v-for="n in 3" :key="n" class="mini numbered">
                <CountItem kind="apple" />
                <b>{{ n }}</b>
              </div>
            </template>
            <template v-else-if="tile.key === 'animals'">
              <div class="mini"><AnimalIcon kind="cow" /></div>
              <div class="mini"><AnimalIcon kind="cat" /></div>
              <div class="mini"><AnimalIcon kind="duck" /></div>
            </template>
            <template v-else-if="tile.key === 'memory'">
              <div class="mini card-back" />
              <div class="mini card-front"><AnimalIcon kind="pig" /></div>
              <div class="mini card-front"><AnimalIcon kind="pig" /></div>
            </template>
            <template v-else-if="tile.key === 'patterns'">
              <div class="mini small"><ShapeIcon kind="circle" :color="COLORS.red" /></div>
              <div class="mini small"><ShapeIcon kind="square" :color="COLORS.blue" /></div>
              <div class="mini small"><ShapeIcon kind="circle" :color="COLORS.red" /></div>
              <div class="mini small question">?</div>
            </template>
            <template v-else-if="tile.key === 'music'">
              <svg viewBox="0 0 100 70" class="xylo-art" aria-hidden="true">
                <rect
                  v-for="(c, i) in ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const"
                  :key="c"
                  :x="4 + i * 16"
                  :y="4 + i * 3"
                  width="13"
                  :height="62 - i * 6"
                  rx="4"
                  :fill="COLORS[c]"
                />
              </svg>
            </template>
            <template v-else-if="tile.key === 'shadows'">
              <div class="mini shadow-art"><AnimalIcon kind="cat" /></div>
              <div class="mini"><AnimalIcon kind="cat" /></div>
            </template>
            <template v-else-if="tile.key === 'sizes'">
              <div class="mini tall"><AnimalIcon kind="pig" /></div>
              <div class="mini tiny"><AnimalIcon kind="pig" /></div>
            </template>
            <template v-else-if="tile.key === 'letters'">
              <div class="mini"><AnimalIcon kind="cow" /></div>
              <div class="mini letter">K</div>
            </template>
            <template v-else-if="tile.key === 'paint'">
              <svg viewBox="0 0 100 70" class="xylo-art" aria-hidden="true">
                <path d="M8 50 Q28 8 48 40 T92 22" :stroke="COLORS.red" stroke-width="10" fill="none" stroke-linecap="round" />
                <path d="M12 62 Q40 36 62 58 T92 48" :stroke="COLORS.blue" stroke-width="10" fill="none" stroke-linecap="round" />
              </svg>
            </template>
            <template v-else>
              <svg v-for="c in ['red', 'blue', 'green'] as const" :key="c" viewBox="0 0 60 100" class="mini balloon">
                <path d="M30 70 Q24 85 32 98" stroke="#7a8796" stroke-width="2" fill="none" />
                <ellipse cx="30" cy="36" rx="26" ry="32" :fill="COLORS[c]" />
                <path d="M26 66 L34 66 L30 72 Z" :fill="COLORS[c]" />
                <ellipse cx="20" cy="24" rx="5" ry="9" fill="rgba(255,255,255,0.5)" />
              </svg>
            </template>
          </div>
          <span class="label">{{ t.games[tile.key] }}</span>
        </button>
      </nav>
    </section>

    <svg
      v-for="h in hearts"
      :key="h.id"
      class="heart-float"
      :style="{ left: `${h.x}px`, top: `${h.y}px` }"
      viewBox="0 0 32 30"
      aria-hidden="true"
    >
      <path d="M16 28 C4 19 2 12 2 8.5 A7 7 0 0 1 16 6 A7 7 0 0 1 30 8.5 C30 12 28 19 16 28 Z" />
    </svg>

    <svg
      v-if="ball"
      :key="`${ball.x}-${ball.y}`"
      class="ball"
      :style="{ left: `${ball.x}px`, top: `${ball.y}px` }"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <ellipse cx="24" cy="44" rx="14" ry="3.5" fill="#3a2c5e" opacity="0.25" />
      <circle cx="24" cy="24" r="20" fill="#c8e84a" />
      <path d="M8 14 Q24 24 8 34 M40 14 Q24 24 40 34" stroke="#fff6e8" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="17" cy="15" rx="5" ry="3" fill="#fff" opacity="0.45" />
    </svg>

    <button class="album-btn" :class="{ fresh: stickers.latest }" aria-label="Album" @click="openAlbum">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <rect x="14" y="12" width="72" height="78" rx="10" fill="#ff9f1c" stroke="#2d3a4a" stroke-width="5" />
        <rect x="24" y="12" width="8" height="78" fill="#d87a00" />
        <path
          d="M60 30 L65.6 43.2 L79.8 44.2 L69 53.4 L72.4 67.2 L60 59.8 L47.6 67.2 L51 53.4 L40.2 44.2 L54.4 43.2 Z"
          fill="#ffe14d"
          stroke="#2d3a4a"
          stroke-width="3"
          stroke-linejoin="round"
        />
      </svg>
      <span v-if="stickers.collected.length" class="badge">{{ stickers.collected.length }}</span>
    </button>
  </main>
</template>

<style scoped>
.home {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--dusk-top) 0%, var(--dusk-mid) 58%, var(--dusk-low) 82%);
  display: flex;
  flex-direction: column;
  padding: max(16px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
}

/* Tiefstehende Sonne hinter den Hügeln */
.sunset {
  position: absolute;
  left: 50%;
  bottom: 8%;
  width: 90vmax;
  height: 90vmax;
  transform: translate(-50%, 50%);
  background: radial-gradient(circle, rgba(255, 226, 122, 0.55) 0%, rgba(255, 226, 122, 0) 55%);
}

.meadow {
  position: absolute;
  left: -15%;
  right: -15%;
  border-radius: 50%;
}

.meadow.far {
  bottom: -40vh;
  height: 62vh;
  background: var(--meadow-far);
}

.meadow.near {
  left: -30%;
  right: 20%;
  bottom: -46vh;
  height: 62vh;
  background: var(--meadow-near);
}

.ball {
  position: absolute;
  z-index: 3;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  pointer-events: none;
  animation: drop 0.55s cubic-bezier(0.3, 0, 0.7, 1);
}

@keyframes drop {
  0% {
    transform: translateY(-70px);
    opacity: 0;
  }
  60% {
    transform: translateY(0);
    opacity: 1;
  }
  78% {
    transform: translateY(-14px);
  }
  100% {
    transform: translateY(0);
  }
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

.top {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.age {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px 4px 12px;
  border-radius: 999px;
  background: var(--cream);
  color: var(--ink);
  font-size: clamp(16px, 2.6vmin, 24px);
  font-weight: 800;
  box-shadow: 0 4px 0 rgba(58, 44, 94, 0.18);
}

.age svg {
  width: 1.3em;
  height: 1.3em;
  fill: #b98650;
}

.trust {
  margin: 0;
  display: flex;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--cream);
  box-shadow: 0 4px 0 rgba(58, 44, 94, 0.18);
}

.trust svg {
  width: clamp(18px, 3vmin, 28px);
  fill: none;
  stroke: #d9709a;
  stroke-width: 2.5;
  transition: fill 0.6s;
}

.trust svg.full {
  fill: #ff6b8b;
  stroke: #ff6b8b;
}

.heart-float {
  position: absolute;
  z-index: 5;
  width: 34px;
  margin: -17px 0 0 -17px;
  fill: #ff6b8b;
  pointer-events: none;
  animation: float-up 2.2s ease-out forwards;
}

@keyframes float-up {
  from {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  to {
    transform: translateY(-90px) scale(1);
    opacity: 0;
  }
}

.logo {
  margin: 0;
  font-size: clamp(48px, 9vmin, 92px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 1px;
  color: var(--cream);
  text-shadow:
    0 0 18px rgba(255, 226, 122, 0.9),
    0 0 42px rgba(255, 226, 122, 0.45);
}

.logo span {
  display: inline-block;
  animation: bob 2.4s ease-in-out infinite;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.content {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3vw;
}

.galip {
  position: relative;
  z-index: 4;
  width: clamp(170px, 32vmin, 340px);
  flex: none;
  transition: transform 1.3s cubic-bezier(0.45, 0.05, 0.3, 1);
  filter: drop-shadow(0 0 20px rgba(255, 246, 232, 0.6));
}

/* Unterwegs ist Galip nicht antippbar, damit er keine Kacheln blockiert. */
.galip.away {
  pointer-events: none;
}

.tiles {
  --tile: clamp(110px, min(12vw, 22vh), 220px);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: calc(var(--tile) * 5 + 24px * 4);
}

.tile {
  --lift: 0px;
  --tilt: 0deg;
  width: var(--tile);
  flex: none;
  height: var(--tile);
  border-radius: var(--radius);
  box-shadow:
    inset 0 5px 0 rgba(255, 255, 255, 0.55),
    inset 0 -9px 0 rgba(58, 44, 94, 0.12),
    0 12px 22px rgba(30, 18, 70, 0.32);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 10px 8px;
  transform: translateY(var(--lift)) rotate(var(--tilt));
  transition: transform 0.15s;
}

.tile:nth-child(even) {
  --lift: 14px;
}

.tile:nth-child(3n) {
  --tilt: -2deg;
}

.tile:nth-child(3n + 1) {
  --tilt: 1.5deg;
}

.tile.squircle {
  border-radius: 34%;
}

.tile.arch {
  border-radius: 50% 50% 24% 24% / 44% 44% 24% 24%;
}

.tile.round {
  border-radius: 46%;
}

.tile.leaf {
  border-radius: 46% 14% 46% 14%;
}

.tile:active {
  transform: translateY(calc(var(--lift) + 4px)) rotate(var(--tilt)) scale(0.94);
}

.art {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.mini {
  width: 30%;
  aspect-ratio: 1;
  position: relative;
}

.xylo-art {
  width: 80%;
}

.mini.letter {
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #fff;
  font-size: 30px;
  font-weight: 800;
  color: #ff5a5f;
}

.mini.tall {
  width: 42%;
}

.mini.tiny {
  width: 24%;
}

.shadow-art :deep(svg) {
  filter: brightness(0) opacity(0.7);
}

.mini.small {
  width: 21%;
}

.card-back,
.card-front {
  border-radius: 10px;
  border: 3px solid #fff;
}

.card-back {
  background: linear-gradient(135deg, #8e7cf0 0%, #5b4bc4 100%);
}

.card-front {
  background: #fff;
  padding: 2px;
}

.question {
  display: grid;
  place-items: center;
  border: 3px dashed #c98a5a;
  border-radius: 10px;
  font-weight: 800;
  font-size: 22px;
  color: #c98a5a;
}

.mini.balloon {
  aspect-ratio: 3 / 5;
  height: auto;
}

.numbered b {
  position: absolute;
  right: -4px;
  bottom: -6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  font-size: 16px;
  display: grid;
  place-items: center;
}

.label {
  font-size: clamp(20px, 3.2vmin, 32px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--ink);
}

.album-btn {
  position: absolute;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  width: 104px;
  height: 104px;
  padding: 12px;
  border-radius: 50%;
  background: var(--cream);
  box-shadow:
    0 0 28px rgba(255, 226, 122, 0.55),
    var(--shadow);
  transition: transform 0.15s;
}

.album-btn:active {
  transform: scale(0.92);
}

.album-btn.fresh {
  animation: bob 1s ease-in-out infinite;
}

.album-btn svg {
  width: 100%;
  height: 100%;
}

.album-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 999px;
  background: #ff5a5f;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

@media (max-aspect-ratio: 1/1) {
  .content {
    flex-direction: column;
  }
}
</style>
