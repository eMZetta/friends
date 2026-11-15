<script setup lang="ts">
import { useId } from 'vue'

import type { CountThing } from '@/lib/i18n'

defineProps<{ kind: CountThing }>()

// Gleicher Zeichenstil wie Galip, Tiere und Formen: keine Umrisse, weiches Licht von oben (`shade`).
const uid = useId()
const shade = `url(#shade-${uid})`
const INK = '#2a1d17'
</script>

<template>
  <svg viewBox="0 0 100 100" class="count-icon" aria-hidden="true">
    <defs>
      <linearGradient :id="`shade-${uid}`" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.3" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#5a2a4a" stop-opacity="0.22" />
      </linearGradient>
    </defs>

    <g v-if="kind === 'apple'">
      <path d="M50 26 Q52 12 62 6" stroke="#7a4b2a" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M54 20 Q70 8 80 18 Q68 28 54 20 Z" fill="#3bceac" />
      <path
        d="M50 30 C36 18 10 24 12 52 C14 78 32 96 50 88 C68 96 86 78 88 52 C90 24 64 18 50 30 Z"
        fill="#ff5a5f"
      />
      <path
        d="M50 30 C36 18 10 24 12 52 C14 78 32 96 50 88 C68 96 86 78 88 52 C90 24 64 18 50 30 Z"
        :fill="shade"
      />
      <ellipse cx="32" cy="46" rx="7" ry="11" fill="rgba(255,255,255,0.45)" transform="rotate(20 32 46)" />
    </g>
    <g v-else-if="kind === 'star'">
      <path
        d="M50 6 L61.8 37.6 L95.1 38.2 L69 59.4 L77.9 91.8 L50 73 L22.1 91.8 L31 59.4 L4.9 38.2 L38.2 37.6 Z"
        fill="#ffd23f"
        stroke="#ffd23f"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <path
        d="M50 6 L61.8 37.6 L95.1 38.2 L69 59.4 L77.9 91.8 L50 73 L22.1 91.8 L31 59.4 L4.9 38.2 L38.2 37.6 Z"
        :fill="shade"
        :stroke="shade"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <circle cx="42" cy="52" r="4.5" :fill="INK" />
      <circle cx="58" cy="52" r="4.5" :fill="INK" />
      <circle cx="43.4" cy="50.6" r="1.5" fill="#fff" />
      <circle cx="59.4" cy="50.6" r="1.5" fill="#fff" />
      <ellipse cx="35" cy="61" rx="5" ry="3" fill="#ff8fa3" opacity="0.5" />
      <ellipse cx="65" cy="61" rx="5" ry="3" fill="#ff8fa3" opacity="0.5" />
      <path d="M43 62 Q50 68 57 62" :stroke="INK" stroke-width="3" fill="none" stroke-linecap="round" />
    </g>
    <g v-else-if="kind === 'fish'">
      <path d="M70 50 L96 28 L92 50 L96 72 Z" fill="#ff9f1c" stroke="#ff9f1c" stroke-width="4" stroke-linejoin="round" />
      <ellipse cx="44" cy="50" rx="38" ry="28" fill="#ffb55e" />
      <ellipse cx="44" cy="50" rx="38" ry="28" :fill="shade" />
      <path d="M40 24 Q50 10 62 26" fill="#ff9f1c" />
      <path d="M50 30 Q58 50 50 70" stroke="#ff9f1c" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle cx="24" cy="44" r="7" fill="#fffaf0" />
      <circle cx="22.5" cy="45" r="4" :fill="INK" />
      <circle cx="21.5" cy="43.5" r="1.4" fill="#fff" />
      <ellipse cx="30" cy="60" rx="5" ry="3" fill="#ff8fa3" opacity="0.5" />
    </g>
    <g v-else>
      <path d="M50 58 V96" stroke="#3bceac" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="62" cy="80" rx="12" ry="6" fill="#3bceac" transform="rotate(-30 62 80)" />
      <circle cx="50" cy="20" r="15" fill="#f15bb5" />
      <circle cx="72" cy="36" r="15" fill="#f15bb5" />
      <circle cx="64" cy="60" r="15" fill="#f15bb5" />
      <circle cx="36" cy="60" r="15" fill="#f15bb5" />
      <circle cx="28" cy="36" r="15" fill="#f15bb5" />
      <circle cx="50" cy="20" r="15" :fill="shade" />
      <circle cx="72" cy="36" r="15" :fill="shade" />
      <circle cx="64" cy="60" r="15" :fill="shade" />
      <circle cx="36" cy="60" r="15" :fill="shade" />
      <circle cx="28" cy="36" r="15" :fill="shade" />
      <circle cx="50" cy="42" r="13" fill="#ffd23f" />
      <circle cx="50" cy="42" r="13" :fill="shade" />
    </g>
  </svg>
</template>

<style scoped>
.count-icon {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
