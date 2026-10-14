<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import LumiMascot from './LumiMascot.vue'
import StickerArt from './StickerArt.vue'
import { COLORS } from '@/lib/colors'
import { useT } from '@/lib/i18n'
import { pick, randInt } from '@/lib/random'
import { sfx } from '@/lib/sound'
import { say } from '@/lib/speech'
import type { Sticker } from '@/lib/stickers'
import { useStats } from '@/stores/stats'
import { useStickers } from '@/stores/stickers'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ done: [] }>()

const t = useT()
const stickers = useStickers()
const stats = useStats()
const route = useRoute()
const sticker = ref<Sticker | null>(null)
const palette = Object.values(COLORS)

const confetti = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: palette[i % palette.length],
  angle: (360 / 28) * i + randInt(-6, 6),
  distance: randInt(28, 46),
  delay: randInt(0, 120),
  round: i % 3 === 0,
}))

let timer: number | undefined

watch(
  () => props.show,
  (show) => {
    window.clearTimeout(timer)
    if (!show) return
    sfx.success()
    stats.finishRound(String(route.name))
    // Every finished round earns a sticker for the album, until it is full.
    sticker.value = stickers.award()
    const praise = pick(t.value.praise)
    if (sticker.value) say(praise, t.value.newSticker)
    else say(praise)
    timer = window.setTimeout(() => emit('done'), sticker.value ? 2800 : 2000)
  },
)

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <Transition name="reward">
    <div v-if="show" class="reward">
      <span
        v-for="c in confetti"
        :key="c.id"
        class="confetti"
        :class="{ round: c.round }"
        :style="{
          background: c.color,
          '--angle': `${c.angle}deg`,
          '--distance': `${c.distance}vmin`,
          animationDelay: `${c.delay}ms`,
        }"
      />
      <div class="row">
        <div class="lumi">
          <LumiMascot happy />
        </div>
        <div v-if="sticker" class="sticker">
          <StickerArt :sticker="sticker" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.reward {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.35);
}

.row {
  display: flex;
  align-items: center;
  gap: 6vmin;
}

.sticker {
  width: min(30vmin, 220px);
  height: min(30vmin, 220px);
  padding: 16px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transform: rotate(-6deg);
  animation: sticker-in 0.7s 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

@keyframes sticker-in {
  from {
    transform: translateY(40vh) rotate(-40deg) scale(0.3);
  }
  to {
    transform: translateY(0) rotate(-6deg) scale(1);
  }
}

.lumi {
  width: min(40vmin, 300px);
  animation: grow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confetti {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3vmin;
  height: 1.6vmin;
  border-radius: 4px;
  opacity: 0;
  animation: burst 1.4s cubic-bezier(0.15, 0.7, 0.4, 1) forwards;
}

.confetti.round {
  width: 2.2vmin;
  height: 2.2vmin;
  border-radius: 50%;
}

@keyframes burst {
  0% {
    opacity: 1;
    transform: rotate(var(--angle)) translateX(0) rotate(0deg);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(var(--distance)) rotate(540deg);
  }
}

@keyframes grow {
  from {
    transform: scale(0.2);
  }
  to {
    transform: scale(1);
  }
}

.reward-enter-active,
.reward-leave-active {
  transition: opacity 0.25s;
}

.reward-enter-from,
.reward-leave-to {
  opacity: 0;
}
</style>
