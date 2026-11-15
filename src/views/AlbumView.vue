<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import FriendMedal from '@/components/FriendMedal.vue'
import GameShell from '@/components/GameShell.vue'
import StickerArt from '@/components/StickerArt.vue'
import { useT } from '@/lib/i18n'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import { STICKERS, stickerName, type Sticker } from '@/lib/stickers'
import { useFriendship } from '@/stores/friendship'
import { useSettings } from '@/stores/settings'
import { useStickers } from '@/stores/stickers'

const t = useT()
const settings = useSettings()
const stickers = useStickers()
const friendship = useFriendship()

const prompt = computed(() => t.value.albumPrompt)
const wiggling = ref<string | null>(null)

// The newest sticker sparkles once; afterwards it's just part of the album.
const highlight = ref(stickers.latest)

// A slight, stable tilt per slot makes the page look hand-stuck.
function tilt(index: number) {
  return ((index * 37) % 13) - 6
}

function tap(sticker: Sticker) {
  if (!stickers.has(sticker.id)) return
  sfx.tap()
  say(stickerName(sticker, settings.lang))
  wiggling.value = sticker.id
  window.setTimeout(() => (wiggling.value = null), 500)
}

onMounted(() => {
  say(prompt.value)
  stickers.latest = null
})
</script>

<template>
  <GameShell :prompt="prompt" background="linear-gradient(180deg, #ffe9b8 0%, #ffd6a0 100%)">
    <template #status>
      <div class="status">
        <button v-if="friendship.finaleSeen" class="medal" :aria-label="t.bestFriends" @click="friendship.showFinale()">
          <FriendMedal />
        </button>
        <div class="count">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M50 6 L61.8 37.6 L95.1 38.2 L69 59.4 L77.9 91.8 L50 73 L22.1 91.8 L31 59.4 L4.9 38.2 L38.2 37.6 Z"
            fill="#ffd23f"
            stroke="#f2b600"
            stroke-width="5"
            stroke-linejoin="round"
          />
        </svg>
        {{ stickers.collected.length }} / {{ STICKERS.length }}
        </div>
      </div>
    </template>

    <div class="page">
      <div class="grid">
        <button
          v-for="(s, i) in STICKERS"
          :key="s.id"
          class="slot"
          :class="{
            filled: stickers.has(s.id),
            fresh: highlight === s.id,
            wiggle: wiggling === s.id,
          }"
          :style="{ '--tilt': `${tilt(i)}deg` }"
          @click="tap(s)"
        >
          <div v-if="stickers.has(s.id)" class="sticker">
            <StickerArt :sticker="s" />
          </div>
          <span v-else class="empty">?</span>
        </button>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.page {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.grid {
  --cols: 5;
  --rows: 4;
  --gap: 16px;
  --pad: 24px;
  --cell: min(
    calc((100vw - 2 * var(--pad) - (var(--cols) - 1) * var(--gap) - 80px) / var(--cols)),
    calc((100vh - 2 * var(--pad) - (var(--rows) - 1) * var(--gap) - 130px) / var(--rows)),
    160px
  );
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell));
  gap: var(--gap);
  padding: var(--pad);
  background: #fffaf0;
  border-radius: 32px;
  border: 4px dashed #e8c48a;
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.08);
}

/* Hochformat: 4 × 5 statt 5 × 4. */
@media (max-aspect-ratio: 1/1) {
  .grid {
    --cols: 4;
    --rows: 5;
  }
}

/* Flaches Querformat (iPhone): 7 × 3, kleinere Abstände. */
@media (min-aspect-ratio: 1/1) and (max-height: 560px) {
  .grid {
    --cols: 7;
    --rows: 3;
    --gap: 8px;
    --pad: 12px;
  }
}

@media (max-width: 599px) {
  .grid {
    --gap: 10px;
    --pad: 14px;
  }
}

.slot {
  width: var(--cell);
  height: var(--cell);
  display: grid;
  place-items: center;
}

.empty {
  width: calc(var(--cell) * 0.8);
  height: calc(var(--cell) * 0.8);
  border-radius: 50%;
  border: 4px dashed #e2cfa9;
  display: grid;
  place-items: center;
  font-size: calc(var(--cell) * 0.3);
  font-weight: 800;
  color: #e2cfa9;
}

.sticker {
  width: calc(var(--cell) * 0.92);
  height: calc(var(--cell) * 0.92);
  padding: calc(var(--cell) * 0.09);
  background: #fff;
  border-radius: calc(var(--cell) * 0.14);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: rotate(var(--tilt));
}

.slot.fresh .sticker {
  animation: fresh 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 3 alternate;
}

.slot.wiggle .sticker {
  animation: wiggle 0.45s;
}

.status {
  display: flex;
  align-items: center;
  gap: 14px;
}

.medal {
  width: 52px;
  height: 64px;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.25));
  animation: wobble 3s ease-in-out infinite;
  transform-origin: 50% 0;
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.count {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  font-size: 28px;
  font-weight: 800;
}

.count svg {
  width: 36px;
  height: 36px;
}

@keyframes fresh {
  from {
    transform: rotate(var(--tilt)) scale(1);
    box-shadow: 0 0 0 0 rgba(255, 210, 63, 0.9);
  }
  to {
    transform: rotate(var(--tilt)) scale(1.15);
    box-shadow: 0 0 0 12px rgba(255, 210, 63, 0.9);
  }
}

@keyframes wiggle {
  25% {
    transform: rotate(calc(var(--tilt) - 10deg));
  }
  75% {
    transform: rotate(calc(var(--tilt) + 10deg));
  }
}
</style>
