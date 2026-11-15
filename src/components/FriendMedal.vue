<script setup lang="ts">
import { useId } from 'vue'

// Die Medaille „Beste Freunde": Galip schenkt sie dem Kind, wenn alle fünf Herzen voll sind.
const uid = useId()
</script>

<template>
  <svg viewBox="0 0 100 124" class="friend-medal" aria-hidden="true">
    <defs>
      <linearGradient :id="`gold-${uid}`" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#ffe98a" />
        <stop offset="0.55" stop-color="#ffc83a" />
        <stop offset="1" stop-color="#e59a14" />
      </linearGradient>
    </defs>
    <path d="M26 0 H48 L58 40 H36 Z" fill="#ff6b8b" />
    <path d="M74 0 H52 L42 40 H64 Z" fill="#ff93ab" />
    <circle cx="50" cy="76" r="42" :fill="`url(#gold-${uid})`" />
    <circle cx="50" cy="76" r="33" fill="#ffd84d" stroke="#e59a14" stroke-width="3" />
    <path
      d="M50 100 C32 87 26 78 26 70 A12 12 0 0 1 50 66 A12 12 0 0 1 74 70 C74 78 68 87 50 100 Z"
      fill="#ff6b8b"
    />
    <path d="M36 66 Q38 60 44 60" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7" />
    <ellipse cx="34" cy="52" rx="9" ry="5" fill="#fff" opacity="0.4" transform="rotate(-35 34 52)" />
  </svg>
</template>

<style scoped>
.friend-medal {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
