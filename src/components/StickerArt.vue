<script setup lang="ts">
import AnimalIcon from './AnimalIcon.vue'
import BalloonIcon from './BalloonIcon.vue'
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
    <BalloonIcon v-else :color="sticker.color" />
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
