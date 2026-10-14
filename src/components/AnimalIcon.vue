<script setup lang="ts">
import type { AnimalKind } from '@/lib/i18n'

defineProps<{ kind: AnimalKind }>()

const INK = '#2d3a4a'

// Points on a ring, used for the sheep's wool and the lion's mane.
function ring(count: number, radius: number, cx = 50, cy = 52) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius }
  })
}

const wool = ring(10, 30)
const mane = ring(12, 34)
</script>

<template>
  <svg viewBox="0 0 100 100" class="animal-icon" aria-hidden="true">
    <g v-if="kind === 'cat'">
      <path d="M20 42 L24 8 L46 26 Z" fill="#ff9f1c" stroke-linejoin="round" />
      <path d="M80 42 L76 8 L54 26 Z" fill="#ff9f1c" stroke-linejoin="round" />
      <path d="M26 34 L28 16 L40 26 Z" fill="#ff8fb1" />
      <path d="M74 34 L72 16 L60 26 Z" fill="#ff8fb1" />
      <circle cx="50" cy="56" r="34" fill="#ffb347" />
      <path d="M50 22 L46 32 M50 22 L54 32" stroke="#ff9f1c" stroke-width="3" stroke-linecap="round" />
      <path d="M46 63 L54 63 L50 68 Z" fill="#ff6f91" />
      <path d="M50 68 Q45 75 40 71 M50 68 Q55 75 60 71" :stroke="INK" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M30 62 L12 58 M30 67 L12 70 M70 62 L88 58 M70 67 L88 70" :stroke="INK" stroke-width="2" stroke-linecap="round" />
    </g>

    <g v-else-if="kind === 'dog'">
      <circle cx="50" cy="54" r="32" fill="#c68b59" />
      <ellipse cx="20" cy="52" rx="10" ry="22" fill="#7a4b2a" transform="rotate(15 20 52)" />
      <ellipse cx="80" cy="52" rx="10" ry="22" fill="#7a4b2a" transform="rotate(-15 80 52)" />
      <ellipse cx="62" cy="44" rx="9" ry="8" fill="#a26a3c" />
      <ellipse cx="50" cy="68" rx="16" ry="12" fill="#f1d3b3" />
      <path d="M45 75 Q50 88 55 75 Z" fill="#ff6f91" />
      <ellipse cx="50" cy="62" rx="6" ry="4.5" :fill="INK" />
    </g>

    <g v-else-if="kind === 'cow'">
      <path d="M30 28 Q20 18 26 8 M70 28 Q80 18 74 8" stroke="#d8c39a" stroke-width="7" fill="none" stroke-linecap="round" />
      <ellipse cx="16" cy="44" rx="12" ry="7" fill="#f2f2f2" transform="rotate(-20 16 44)" />
      <ellipse cx="84" cy="44" rx="12" ry="7" fill="#f2f2f2" transform="rotate(20 84 44)" />
      <ellipse cx="50" cy="52" rx="31" ry="34" fill="#fff" stroke="rgba(0,0,0,0.1)" stroke-width="2" />
      <path d="M28 30 Q40 22 46 36 Q38 46 28 40 Z" :fill="INK" />
      <ellipse cx="50" cy="72" rx="24" ry="15" fill="#ffb3c7" />
      <ellipse cx="42" cy="72" rx="3.5" ry="4.5" fill="#c06080" />
      <ellipse cx="58" cy="72" rx="3.5" ry="4.5" fill="#c06080" />
    </g>

    <g v-else-if="kind === 'pig'">
      <path d="M22 36 L20 12 L42 24 Z" fill="#ff8fb1" stroke-linejoin="round" />
      <path d="M78 36 L80 12 L58 24 Z" fill="#ff8fb1" stroke-linejoin="round" />
      <circle cx="50" cy="55" r="33" fill="#ffb3c7" />
      <ellipse cx="50" cy="65" rx="15" ry="11" fill="#ff8fb1" />
      <ellipse cx="45" cy="65" rx="2.8" ry="4" fill="#c0507a" />
      <ellipse cx="55" cy="65" rx="2.8" ry="4" fill="#c0507a" />
    </g>

    <g v-else-if="kind === 'sheep'">
      <circle v-for="(p, i) in wool" :key="i" :cx="p.x" :cy="p.y" r="14" fill="#f5f5f5" stroke="#dcdcdc" stroke-width="2" />
      <circle cx="50" cy="52" r="28" fill="#f5f5f5" />
      <ellipse cx="24" cy="54" rx="11" ry="5" fill="#4a4a5a" transform="rotate(-15 24 54)" />
      <ellipse cx="76" cy="54" rx="11" ry="5" fill="#4a4a5a" transform="rotate(15 76 54)" />
      <ellipse cx="50" cy="58" rx="17" ry="23" fill="#4a4a5a" />
    </g>

    <g v-else-if="kind === 'duck'">
      <path d="M50 18 Q44 6 50 2 Q52 10 58 6 Q56 14 50 18 Z" fill="#ffd23f" />
      <circle cx="50" cy="50" r="33" fill="#ffd23f" />
      <ellipse cx="50" cy="66" rx="20" ry="9" fill="#ff9f1c" />
      <path d="M32 66 Q50 70 68 66" stroke="#d87a00" stroke-width="2" fill="none" />
    </g>

    <g v-else-if="kind === 'frog'">
      <circle cx="30" cy="34" r="15" fill="#6ccf5f" />
      <circle cx="70" cy="34" r="15" fill="#6ccf5f" />
      <ellipse cx="50" cy="60" rx="40" ry="29" fill="#6ccf5f" />
      <path d="M26 64 Q50 84 74 64" stroke="#2d6a2d" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="44" cy="54" r="1.8" fill="#2d6a2d" />
      <circle cx="56" cy="54" r="1.8" fill="#2d6a2d" />
    </g>

    <g v-else>
      <circle v-for="(p, i) in mane" :key="i" :cx="p.x" :cy="p.y" r="15" fill="#e07b24" />
      <circle cx="28" cy="28" r="9" fill="#ffd23f" />
      <circle cx="72" cy="28" r="9" fill="#ffd23f" />
      <circle cx="50" cy="52" r="30" fill="#ffd23f" />
      <ellipse cx="50" cy="66" rx="13" ry="9" fill="#fff1c4" />
      <path d="M44 59 L56 59 L50 66 Z" fill="#7a4b2a" />
      <path d="M50 66 Q45 73 41 69 M50 66 Q55 73 59 69" :stroke="INK" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>

    <!-- Shared eyes, placed per animal -->
    <g v-if="kind === 'frog'">
      <circle cx="30" cy="34" r="10" fill="#fff" />
      <circle cx="70" cy="34" r="10" fill="#fff" />
      <circle cx="31" cy="36" r="5" :fill="INK" />
      <circle cx="71" cy="36" r="5" :fill="INK" />
    </g>
    <g v-else-if="kind === 'sheep'">
      <circle cx="43" cy="52" r="4.5" fill="#fff" />
      <circle cx="57" cy="52" r="4.5" fill="#fff" />
      <circle cx="43.5" cy="53" r="2.2" :fill="INK" />
      <circle cx="57.5" cy="53" r="2.2" :fill="INK" />
    </g>
    <g v-else>
      <circle :cx="38" :cy="kind === 'cow' || kind === 'cat' ? 52 : 46" r="5" :fill="INK" />
      <circle :cx="62" :cy="kind === 'cow' || kind === 'cat' ? 52 : 46" r="5" :fill="INK" />
      <circle :cx="39.5" :cy="kind === 'cow' || kind === 'cat' ? 50 : 44" r="1.8" fill="#fff" />
      <circle :cx="63.5" :cy="kind === 'cow' || kind === 'cat' ? 50 : 44" r="1.8" fill="#fff" />
    </g>
  </svg>
</template>

<style scoped>
.animal-icon {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
