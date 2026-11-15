<script setup lang="ts">
import { useId } from 'vue'

import type { ShapeKind } from '@/lib/i18n'

withDefaults(defineProps<{ kind: ShapeKind; color?: string; hole?: boolean }>(), {
  color: '#3a86ff',
  hole: false,
})

const uid = useId()

const PATHS: Record<Exclude<ShapeKind, 'circle'>, string> = {
  square: 'M22 10 H78 Q90 10 90 22 V78 Q90 90 78 90 H22 Q10 90 10 78 V22 Q10 10 22 10 Z',
  triangle: 'M50 8 L93 88 L7 88 Z',
  star: 'M50 6 L61.8 37.6 L95.1 38.2 L69 59.4 L77.9 91.8 L50 73 L22.1 91.8 L31 59.4 L4.9 38.2 L38.2 37.6 Z',
  heart:
    'M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z',
  hexagon: 'M27 10 L73 10 L96 50 L73 90 L27 90 L4 50 Z',
}
</script>

<template>
  <svg viewBox="0 0 100 100" class="shape-icon" aria-hidden="true">
    <defs>
      <!-- Gleiches Licht wie bei Galip und den Tieren: oben heller, unten warm-dunkler -->
      <linearGradient :id="`shade-${uid}`" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.3" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#5a2a4a" stop-opacity="0.22" />
      </linearGradient>
    </defs>
    <template v-if="hole">
      <g
        fill="rgba(45, 58, 74, 0.12)"
        stroke="rgba(45, 58, 74, 0.35)"
        stroke-width="4"
        stroke-dasharray="8 6"
        stroke-linejoin="round"
      >
        <circle v-if="kind === 'circle'" cx="50" cy="50" r="42" />
        <path v-else :d="PATHS[kind]" />
      </g>
    </template>
    <template v-else>
      <g stroke-linejoin="round">
        <circle v-if="kind === 'circle'" cx="50" cy="50" r="42" :fill="color" />
        <path v-else :d="PATHS[kind]" :fill="color" :stroke="color" stroke-width="3" />
        <circle v-if="kind === 'circle'" cx="50" cy="50" r="42" :fill="`url(#shade-${uid})`" />
        <path v-else :d="PATHS[kind]" :fill="`url(#shade-${uid})`" :stroke="`url(#shade-${uid})`" stroke-width="3" />
      </g>
      <ellipse cx="36" cy="32" rx="10" ry="6" fill="rgba(255, 255, 255, 0.45)" transform="rotate(-30 36 32)" />
    </template>
  </svg>
</template>

<style scoped>
.shape-icon {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
