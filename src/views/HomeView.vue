<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import GalipMascot from '@/components/GalipMascot.vue'
import { ACTION_MS, IDLE_ACTIONS, TRICKS, type GalipAction } from '@/components/galipActions'
import GameArt from '@/components/GameArt.vue'
import ParentGate from '@/components/ParentGate.vue'
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

type GameId = keyof typeof GAME_COLORS
const GAME_COLORS = {
  shapes: '#ffb3c7',
  count: '#ffe08a',
  balloons: '#b8e8a8',
  animals: '#a8dcf5',
  memory: '#d4c8ff',
  patterns: '#ffc9a3',
  music: '#ffd1dc',
  shadows: '#c9c3f5',
  sizes: '#c6ecc0',
  paint: '#ffe3a8',
  letters: '#ffc6c6',
} as const

// Elf Spiele sind in vier Welten sortiert: So sieht ein Kind vier große Ziele statt elf kleiner Kacheln.
const WORLDS = [
  { id: 'think', color: '#d9ccff', games: ['shapes', 'patterns', 'memory', 'sizes'] },
  { id: 'numbers', color: '#ffe59a', games: ['count', 'letters'] },
  { id: 'animals', color: '#a8dcf5', games: ['animals', 'shadows'] },
  { id: 'colors', color: '#ffbdd0', games: ['balloons', 'music', 'paint'] },
] as const satisfies readonly { id: string; color: string; games: readonly GameId[] }[]

type World = (typeof WORLDS)[number]

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

const gamesOf = (w: World) => w.games.filter((g) => !settings.hiddenGames.includes(g))
const visibleWorlds = computed(() => WORLDS.filter((w) => gamesOf(w).length > 0))
const leftWorlds = computed(() => visibleWorlds.value.slice(0, Math.ceil(visibleWorlds.value.length / 2)))
const rightWorlds = computed(() => visibleWorlds.value.slice(Math.ceil(visibleWorlds.value.length / 2)))

const openedWorld = ref<World | null>(null)
const openedGames = computed(() => (openedWorld.value ? gamesOf(openedWorld.value) : []))

/** Eine Welt mit nur einem sichtbaren Spiel startet dieses direkt. */
function openWorld(w: World) {
  sfx.tap()
  const games = gamesOf(w)
  if (games.length === 1) return play(games[0]!)
  say(t.value.worlds[w.id])
  openedWorld.value = w
}

function play(route: GameId) {
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
const action = ref<GalipAction | null>(null)
const hearts = ref<{ id: number; x: number; y: number }[]>([])
const SPEED = 0.17 // Pixel pro Millisekunde: ruhiges Tempo
const FLEE_SPEED = 0.32
const COME_BACK_SPEED = 0.07 // sehr langsam und vorsichtig
// So viele Tipps innerhalb von 1,5 Sekunden erschrecken ihn. Je mehr er dem Kind vertraut, desto mehr hält er aus.
const wildTaps = () => 5 + Math.floor(friendship.trust / 2)
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

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!

/** Führt eine Aktion aus und liefert false, wenn dazwischen etwas Neues begonnen hat. */
async function doAction(token: number, a: GalipAction, ms = ACTION_MS[a]) {
  action.value = a
  await wait(ms)
  if (token !== run) return false
  action.value = null
  return true
}

/** Ein Nickerchen: hinlegen, schlafen, aufwachen und gähnen. */
async function nap(token: number) {
  return (await doAction(token, 'lie')) && (await doAction(token, 'sleep')) && (await doAction(token, 'yawn'))
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
    // Anfangs bleibt er nah an seinem Platz, mit jedem Herz traut er sich weiter weg.
    const m = el.offsetWidth * 0.6
    const reach = 0.3 + 0.14 * friendship.trust
    const rx = (window.innerWidth / 2 - m) * reach
    const ry = (window.innerHeight / 2 - m) * reach
    const ms = walkTo(
      window.innerWidth / 2 + (Math.random() * 2 - 1) * rx,
      window.innerHeight / 2 + (Math.random() * 2 - 1) * ry,
    )
    await wait(ms + 150)
    if (token !== run) return

    // Angekommen: erst schnüffeln oder zum Spielen auffordern (er steht noch seitlich), dann hinsetzen.
    walking.value = false
    const r = Math.random()
    if (pose.value === 'side' && r < 0.55) {
      if (!(await doAction(token, r < 0.4 ? 'sniff' : 'bow'))) return
    }
    stand()
    await wait(500)
    if (token !== run) return

    // Beste Freunde: Galip verschenkt zwischendurch Herzen.
    if (friendship.trust >= MAX_TRUST && Math.random() < 0.5) floatHearts()

    // Im Sitzen macht er meistens noch etwas, manchmal ein Nickerchen.
    const s = Math.random()
    if (s < 0.12) {
      if (!(await nap(token))) return
    } else if (s < 0.75) {
      if (!(await doAction(token, pick(IDLE_ACTIONS)))) return
    }
  }
}

/** Lässt ein paar Herzen aus Galip aufsteigen und zählt das Vertrauen hoch. */
function floatHearts() {
  const el = galipEl.value
  if (el) {
    const rest = restCenter(el)
    const x = rest.x + dog.value.dx
    const y = rest.y + dog.value.dy - el.offsetHeight * 0.3
    const added = [-1, 0, 1].map((i) => ({ id: ++heartId, x: x + i * 34, y: y - Math.abs(i) * 8 }))
    hearts.value.push(...added)
    void wait(2400).then(() => (hearts.value = hearts.value.filter((h) => !added.some((a) => a.id === h.id))))
  }
}

function earnHeart() {
  floatHearts()
  if (friendship.grow()) say(t.value.friend)
}

async function startle(x: number, y: number) {
  const el = galipEl.value
  if (!el) return
  const token = ++run
  fetching = true
  ball.value = null
  action.value = null
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
  if (taps.length >= wildTaps()) {
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
  action.value = null
  walking.value = false
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

// Galips Geschichte: Eine Sprechblase erzählt, wie weit die Freundschaft schon ist.
const bubble = ref(false)
let bubbleTimer: number | undefined

function showStory(ms = 6000) {
  bubble.value = true
  window.clearTimeout(bubbleTimer)
  bubbleTimer = window.setTimeout(() => (bubble.value = false), ms)
}

watch(
  () => friendship.trust,
  () => {
    showStory(7000)
    say(t.value.story[friendship.trust]!)
  },
)

onMounted(() => {
  void explore(run)
  timers.push(window.setTimeout(() => showStory(), 900))
})
onBeforeUnmount(() => {
  run++
  window.clearTimeout(bubbleTimer)
  timers.forEach((id) => window.clearTimeout(id))
})

// Antippen: Galip freut sich und macht ein Kunststück (hüpfen, drehen, Männchen, schütteln, Kopf schief).
async function greet() {
  if (fetching || shy.value) return
  sfx.tap()
  say(t.value.hello)
  showStory()
  const token = ++run
  fetching = true
  happy.value = true
  const trick = pick(TRICKS)
  const ok = await doAction(token, trick)
  if (!ok) return
  happy.value = false
  fetching = false
  void explore(token)
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
        <div class="badges">
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
      </div>
      <div class="parent-slot"><ParentGate /></div>
    </header>

    <section class="content">
      <nav class="worlds left">
        <button
          v-for="(w, i) in leftWorlds"
          :key="w.id"
          class="world"
          :class="SHAPES[(i + 0) % SHAPES.length]"
          :style="{ background: w.color }"
          @click="openWorld(w)"
        >
          <GameArt :kind="`world-${w.id}`" />
          <span class="label">{{ t.worlds[w.id] }}</span>
        </button>
      </nav>

      <button
        ref="galipEl"
        class="galip"
        :class="{ away: dog.dx || dog.dy }"
        aria-label="Galip"
        :style="{ transform: `translate(${dog.dx}px, ${dog.dy}px)`, transitionDuration: `${dog.ms}ms` }"
        @click="greet"
      >
        <GalipMascot :happy="happy" :shy="shy" :pose="pose" :flip="flip" :walking="walking" :action="action" />
        <Transition name="bubble">
          <span v-if="bubble" class="bubble" data-testid="story">{{ t.story[friendship.trust] }}</span>
        </Transition>
      </button>

      <nav class="worlds right">
        <button
          v-for="(w, i) in rightWorlds"
          :key="w.id"
          class="world"
          :class="SHAPES[(i + 2) % SHAPES.length]"
          :style="{ background: w.color }"
          @click="openWorld(w)"
        >
          <GameArt :kind="`world-${w.id}`" />
          <span class="label">{{ t.worlds[w.id] }}</span>
        </button>
      </nav>
    </section>

    <div v-if="openedWorld" class="backdrop" @click.self="openedWorld = null">
      <div class="panel" role="dialog" :aria-label="t.worlds[openedWorld.id]" :style="{ background: openedWorld.color }">
        <h2>{{ t.worlds[openedWorld.id] }}</h2>
        <nav class="tiles">
          <button
            v-for="(g, i) in openedGames"
            :key="g"
            class="tile"
            :class="SHAPES[i % SHAPES.length]"
            :style="{ background: GAME_COLORS[g] }"
            @click="play(g)"
          >
            <GameArt :kind="g" />
            <span class="label">{{ t.games[g] }}</span>
          </button>
        </nav>
        <button class="close" :aria-label="t.back" @click="openedWorld = null">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
        </button>
      </div>
    </div>

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
  --pad: 24px;
  --album: 104px;
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--dusk-top) 0%, var(--dusk-mid) 58%, var(--dusk-low) 82%);
  display: flex;
  flex-direction: column;
  padding: max(16px, env(safe-area-inset-top)) max(var(--pad), env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(var(--pad), env(safe-area-inset-left));
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
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 18px;
  min-width: 0;
}

.badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.parent-slot {
  flex: none;
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
  font-size: clamp(14px, 2.6vmin, 24px);
  font-weight: 800;
  white-space: nowrap;
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
  width: clamp(16px, 3vmin, 28px);
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
  font-size: clamp(40px, 9vmin, 92px);
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
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

/* Querformat: links zwei Welten, in der Mitte Galip, rechts zwei Welten. */
.content {
  --galip: clamp(120px, 36vmin, 400px);
  --card: clamp(120px, min(19vw, 31vh), 250px);
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vw, 56px);
}

.galip {
  position: relative;
  z-index: 4;
  width: var(--galip);
  flex: none;
  transition: transform 1.3s cubic-bezier(0.45, 0.05, 0.3, 1);
  filter: drop-shadow(0 0 20px rgba(255, 246, 232, 0.6));
}

/* Sprechblase über Galips Kopf: wandert mit ihm mit. */
.bubble {
  position: absolute;
  left: 50%;
  bottom: 96%;
  width: max-content;
  max-width: min(46vmin, 360px);
  transform: translateX(-50%);
  padding: 0.5em 0.9em;
  border-radius: 22px;
  background: var(--cream);
  box-shadow: var(--shadow);
  color: var(--ink);
  font-size: clamp(14px, 2.6vmin, 24px);
  font-weight: 800;
  line-height: 1.2;
  pointer-events: none;
}

.bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  margin-left: -10px;
  border: 10px solid transparent;
  border-top-color: var(--cream);
}

.bubble-enter-active,
.bubble-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.9);
}

/* Unterwegs ist Galip nicht antippbar, damit er keine Welten blockiert. */
.galip.away {
  pointer-events: none;
}

.worlds {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 3vh, 30px);
}

.world,
.tile {
  --lift: 0px;
  --tilt: 0deg;
  width: var(--tile);
  height: var(--tile);
  flex: none;
  border-radius: var(--radius);
  box-shadow:
    inset 0 5px 0 rgba(255, 255, 255, 0.55),
    inset 0 -9px 0 rgba(58, 44, 94, 0.12),
    0 12px 22px rgba(30, 18, 70, 0.32);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--tile) * 0.12) calc(var(--tile) * 0.06) calc(var(--tile) * 0.06);
  transform: translateY(var(--lift)) rotate(var(--tilt));
  transition: transform 0.15s;
}

.world:active,
.tile:active {
  transform: translateY(calc(var(--lift) + 4px)) rotate(var(--tilt)) scale(0.94);
}

/* Welten sind so groß wie --card; Spiele im Fenster erben --tile vom Fenster. */
.world {
  --tile: var(--card);
}

/* Die Welten schweben leicht versetzt um Galip, wie Stationen auf der Wiese. */
.worlds.left .world:nth-child(1) {
  --tilt: -2deg;
  margin-right: calc(var(--card) * 0.25);
}

.worlds.left .world:nth-child(2) {
  --tilt: 1.5deg;
  margin-right: -2px;
}

.worlds.right .world:nth-child(1) {
  --tilt: 2deg;
  margin-left: -2px;
}

.worlds.right .world:nth-child(2) {
  --tilt: -1.5deg;
  margin-left: calc(var(--card) * 0.25);
}

.squircle {
  border-radius: 34%;
}

.arch {
  border-radius: 50% 50% 24% 24% / 44% 44% 24% 24%;
}

.round {
  border-radius: 46%;
}

.leaf {
  border-radius: 46% 14% 46% 14%;
}

/* Geöffnete Welt: ein Fenster mit den Spielen dieser Welt. */
.backdrop {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(40, 24, 90, 0.55);
  animation: fade-in 0.2s ease-out;
}

.panel {
  --tile: clamp(100px, min(21vw, 34vh), 220px);
  position: relative;
  max-width: 100%;
  padding: clamp(14px, 3vh, 28px) clamp(18px, 3vw, 40px) clamp(20px, 4vh, 36px);
  border-radius: calc(var(--radius) * 1.4);
  box-shadow:
    inset 0 6px 0 rgba(255, 255, 255, 0.55),
    0 20px 50px rgba(20, 10, 60, 0.5);
  animation: pop-in 0.28s cubic-bezier(0.3, 1.4, 0.5, 1);
}

.panel h2 {
  margin: 0 0 clamp(8px, 2vh, 18px);
  text-align: center;
  font-size: clamp(24px, 5vmin, 48px);
  font-weight: 800;
  color: var(--ink);
}

.panel .tiles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(12px, 2.4vmin, 28px);
}

.panel .tile {
  background-clip: padding-box;
}

.close {
  position: absolute;
  top: -14px;
  right: -14px;
  width: clamp(52px, 8vmin, 72px);
  height: clamp(52px, 8vmin, 72px);
  border-radius: 50%;
  background: var(--cream);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
}

.close:active {
  transform: scale(0.92);
}

.close svg {
  width: 46%;
  fill: none;
  stroke: var(--ink);
  stroke-width: 3.5;
  stroke-linecap: round;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes pop-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
}

.label {
  font-size: clamp(13px, calc(var(--tile) * 0.15), 32px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--ink);
}

.album-btn {
  position: absolute;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(20px, env(safe-area-inset-bottom));
  width: var(--album);
  height: var(--album);
  padding: calc(var(--album) * 0.115);
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

/* Hochformat: Galip groß oben, darunter die vier Welten im 2×2-Raster. */
@media (max-aspect-ratio: 1/1) {
  .home {
    --album: 80px;
  }

  .content {
    display: grid;
    grid-template-columns: repeat(2, var(--card));
    grid-auto-rows: var(--card);
    justify-content: center;
    align-content: center;
    gap: clamp(14px, 2.6vh, 28px) clamp(14px, 4vw, 36px);
    --card: clamp(110px, min(40vw, 22vh), 260px);
  }

  .galip {
    grid-column: 1 / -1;
    grid-row: 1;
    justify-self: center;
    width: clamp(120px, min(28vh, 60vw), 340px);
    margin-bottom: 1vh;
  }

  .worlds {
    display: contents;
  }

  .worlds .world {
    margin: 0 !important;
  }

  .panel {
    --tile: clamp(100px, min(38vw, 22vh), 220px);
  }
}

/* Schmales Hochformat: Logo und „Für Eltern" teilen sich die erste Zeile, die Abzeichen kommen darunter. */
@media (max-aspect-ratio: 1/1) and (max-width: 599px) {
  .top {
    flex-wrap: wrap;
  }

  .brand {
    display: contents;
  }

  .logo {
    order: 1;
  }

  .parent-slot {
    order: 2;
  }

  .badges {
    order: 3;
    flex-basis: 100%;
  }
}

@media (max-aspect-ratio: 1/1) and (min-width: 600px) {
  .home {
    --album: 104px;
  }
}

/* Flaches Querformat (iPhone): kleinerer Kopf, kompaktere Welten. */
@media (min-aspect-ratio: 1/1) and (max-height: 560px) {
  .home {
    --pad: 16px;
    --album: 64px;
  }

  .content {
    --card: clamp(80px, min(18vw, 34vh), 170px);
    --galip: clamp(100px, 40vh, 260px);
  }

  .logo {
    font-size: 36px;
  }
}

@media (max-height: 560px) {
  .album-btn .badge {
    min-width: 26px;
    height: 26px;
    font-size: 15px;
  }
}
</style>
