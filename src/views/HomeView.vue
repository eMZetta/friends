<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AnimalIcon from '@/components/AnimalIcon.vue'
import CountItem from '@/components/CountItem.vue'
import LumiMascot from '@/components/LumiMascot.vue'
import ParentGate from '@/components/ParentGate.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLORS } from '@/lib/colors'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import { useSettings } from '@/stores/settings'
import { useStickers } from '@/stores/stickers'

const t = useT()
const router = useRouter()
const lumiHappy = ref(false)
const stickers = useStickers()
const settings = useSettings()

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

function greet() {
  sfx.tap()
  say(t.value.hello)
  lumiHappy.value = true
  window.setTimeout(() => (lumiHappy.value = false), 1600)
}
</script>

<template>
  <main class="home">
    <div class="cloud c1" />
    <div class="cloud c2" />
    <div class="cloud c3" />
    <div class="hill" />

    <header class="top">
      <h1 class="logo">
        <span v-for="(ch, i) in 'Lumi'" :key="i" :style="{ animationDelay: `${i * 0.15}s` }">{{ ch }}</span>
      </h1>
      <ParentGate />
    </header>

    <section class="content">
      <button class="lumi" aria-label="Lumi" @click="greet">
        <LumiMascot :happy="lumiHappy" />
      </button>

      <nav class="tiles">
        <button
          v-for="tile in visibleTiles"
          :key="tile.key"
          class="tile"
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
  background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bottom) 75%);
  display: flex;
  flex-direction: column;
  padding: max(16px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
}

.hill {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -30vh;
  height: 55vh;
  border-radius: 50%;
  background: var(--grass);
}

.cloud {
  position: absolute;
  width: 180px;
  height: 56px;
  border-radius: 56px;
  background: rgba(255, 255, 255, 0.85);
  animation: drift 40s linear infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.cloud::before {
  width: 80px;
  height: 80px;
  left: 28px;
  top: -40px;
}

.cloud::after {
  width: 60px;
  height: 60px;
  left: 92px;
  top: -26px;
}

.c1 {
  top: 14%;
  left: -200px;
}

.c2 {
  top: 30%;
  left: -200px;
  transform: scale(0.7);
  animation-duration: 55s;
  animation-delay: -20s;
}

.c3 {
  top: 8%;
  left: -200px;
  transform: scale(0.5);
  animation-duration: 70s;
  animation-delay: -45s;
}

@keyframes drift {
  to {
    left: 110%;
  }
}

.top {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.logo {
  margin: 0;
  font-size: clamp(44px, 8vmin, 84px);
  font-weight: 800;
  letter-spacing: 2px;
  color: #fff;
  text-shadow:
    0 4px 0 #5b4bc4,
    0 8px 14px rgba(0, 0, 0, 0.15);
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

.lumi {
  width: clamp(140px, 24vmin, 260px);
  flex: none;
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
  width: var(--tile);
  flex: none;
  height: var(--tile);
  border-radius: var(--radius);
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.12);
  border: 6px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 14px 10px 10px;
  transition: transform 0.15s;
}

.tile:active {
  transform: scale(0.94) translateY(4px);
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
  font-size: clamp(20px, 3vmin, 30px);
  font-weight: 800;
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
  background: #fff;
  box-shadow: var(--shadow);
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
