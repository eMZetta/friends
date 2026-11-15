<script setup lang="ts">
import { useId } from 'vue'

import { COLORS, type ColorId } from '@/lib/colors'

// Ein Luftballon im Zeichenstil von Galip. Der Inhalt (z. B. eine Zahl) wird als <text> in den Ballon gesetzt.
defineProps<{ color: ColorId }>()

const uid = useId()
</script>

<template>
  <svg viewBox="0 0 60 100" class="balloon-icon" aria-hidden="true">
    <defs>
      <linearGradient :id="`shade-${uid}`" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.3" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#5a2a4a" stop-opacity="0.22" />
      </linearGradient>
    </defs>
    <path d="M30 72 Q22 84 32 98" stroke="#fff6e8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85" />
    <path d="M25 69 L35 69 L30 75 Z" :fill="COLORS[color]" stroke-linejoin="round" :stroke="COLORS[color]" stroke-width="2" />
    <ellipse cx="30" cy="36" rx="27" ry="33" :fill="COLORS[color]" />
    <ellipse cx="30" cy="36" rx="27" ry="33" :fill="`url(#shade-${uid})`" />
    <ellipse cx="19" cy="24" rx="5" ry="10" fill="rgba(255,255,255,0.5)" transform="rotate(20 19 24)" />
    <slot />
  </svg>
</template>

<style scoped>
.balloon-icon {
  display: block;
  overflow: visible;
}
</style>
