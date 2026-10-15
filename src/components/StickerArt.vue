<script setup lang="ts">
import AnimalIcon from './AnimalIcon.vue'
import CountItem from './CountItem.vue'
import GalipMascot from './GalipMascot.vue'
import ShapeIcon from './ShapeIcon.vue'
import { COLORS } from '@/lib/colors'
import type { Sticker } from '@/lib/stickers'

defineProps<{ sticker: Sticker }>()
</script>

<template>
  <div class="sticker-art">
    <AnimalIcon v-if="sticker.type === 'animal'" :kind="sticker.kind" />
    <ShapeIcon v-else-if="sticker.type === 'shape'" :kind="sticker.kind" :color="COLORS[sticker.color]" />
    <CountItem v-else-if="sticker.type === 'thing'" :kind="sticker.kind" />
    <GalipMascot v-else-if="sticker.type === 'lumi'" />
    <svg v-else viewBox="0 0 60 100" aria-hidden="true">
      <path d="M30 72 Q22 84 32 98" stroke="#6b7a8c" stroke-width="1.5" fill="none" />
      <ellipse cx="30" cy="36" rx="27" ry="33" :fill="COLORS[sticker.color]" />
      <path d="M25 68 L35 68 L30 74 Z" :fill="COLORS[sticker.color]" />
      <ellipse cx="19" cy="24" rx="5" ry="10" fill="rgba(255,255,255,0.5)" transform="rotate(20 19 24)" />
    </svg>
  </div>
</template>

<style scoped>
.sticker-art {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.sticker-art > :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
