<script setup lang="ts">
import { useId } from 'vue'

import type { AnimalKind } from '@/lib/i18n'

defineProps<{ kind: AnimalKind }>()

// Gemeinsamer Zeichenstil mit Galip: keine Umrisse, weiche Verläufe von hell (oben) nach warm-dunkel (unten),
// dunkle warme Augen mit Glanzpunkt, rosige Bäckchen. Alle Köpfe nutzen dasselbe Licht (`shade`).
const uid = useId()
const shade = `url(#shade-${uid})`

const INK = '#2a1d17'
const CHEEK = '#ff8fa3'

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
    <defs>
      <linearGradient :id="`shade-${uid}`" x1="0" y1="0" x2="0.15" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.3" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#5a2a4a" stop-opacity="0.22" />
      </linearGradient>
    </defs>

    <g v-if="kind === 'cat'">
      <path d="M23 40 L26 12 L45 27 Z" fill="#f59a3a" stroke="#f59a3a" stroke-width="6" stroke-linejoin="round" />
      <path d="M77 40 L74 12 L55 27 Z" fill="#f59a3a" stroke="#f59a3a" stroke-width="6" stroke-linejoin="round" />
      <path d="M29 33 L30 20 L39 28 Z" fill="#ff9fb4" stroke="#ff9fb4" stroke-width="3" stroke-linejoin="round" />
      <path d="M71 33 L70 20 L61 28 Z" fill="#ff9fb4" stroke="#ff9fb4" stroke-width="3" stroke-linejoin="round" />
      <circle cx="50" cy="56" r="34" fill="#ffb55e" />
      <circle cx="50" cy="56" r="34" :fill="shade" />
      <path d="M50 24 V33 M41 26 L43 34 M59 26 L57 34" stroke="#e8892b" stroke-width="3.5" stroke-linecap="round" />
      <ellipse cx="50" cy="69" rx="14" ry="10" fill="#fff1de" />
      <path d="M46 63 Q50 61 54 63 L50 68 Z" fill="#ff7f9d" stroke="#ff7f9d" stroke-width="2" stroke-linejoin="round" />
      <path d="M50 68 Q46 74 41 71 M50 68 Q54 74 59 71" stroke="#7a4b2a" stroke-width="2.4" fill="none" stroke-linecap="round" />
      <path d="M30 64 L14 60 M30 69 L14 72 M70 64 L86 60 M70 69 L86 72" stroke="#fff6e8" stroke-width="2" stroke-linecap="round" opacity="0.9" />
    </g>

    <g v-else-if="kind === 'dog'">
      <ellipse cx="20" cy="52" rx="11" ry="23" fill="#7a4b2a" transform="rotate(15 20 52)" />
      <ellipse cx="80" cy="52" rx="11" ry="23" fill="#7a4b2a" transform="rotate(-15 80 52)" />
      <ellipse cx="20" cy="52" rx="11" ry="23" :fill="shade" transform="rotate(15 20 52)" />
      <ellipse cx="80" cy="52" rx="11" ry="23" :fill="shade" transform="rotate(-15 80 52)" />
      <circle cx="50" cy="54" r="32" fill="#d19a62" />
      <ellipse cx="66" cy="42" rx="10" ry="9" fill="#a26a3c" />
      <circle cx="50" cy="54" r="32" :fill="shade" />
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#f6dcc0" />
      <path d="M45 74 Q50 88 55 74 Z" fill="#ff7f9d" />
      <ellipse cx="50" cy="62" rx="7" ry="5" :fill="INK" />
      <ellipse cx="48" cy="60.5" rx="2.2" ry="1.3" fill="#fff" opacity="0.7" />
    </g>

    <g v-else-if="kind === 'cow'">
      <path d="M31 28 Q21 18 27 8 M69 28 Q79 18 73 8" stroke="#ecd9aa" stroke-width="7" fill="none" stroke-linecap="round" />
      <ellipse cx="16" cy="44" rx="12" ry="7" fill="#fdf4f4" transform="rotate(-20 16 44)" />
      <ellipse cx="84" cy="44" rx="12" ry="7" fill="#fdf4f4" transform="rotate(20 84 44)" />
      <ellipse cx="16" cy="44" rx="7" ry="3.5" fill="#ffb3c7" transform="rotate(-20 16 44)" />
      <ellipse cx="84" cy="44" rx="7" ry="3.5" fill="#ffb3c7" transform="rotate(20 84 44)" />
      <ellipse cx="50" cy="52" rx="31" ry="34" fill="#fffaf6" />
      <path d="M28 30 Q40 22 46 36 Q38 46 28 40 Z" fill="#4a3a46" />
      <ellipse cx="50" cy="52" rx="31" ry="34" :fill="shade" />
      <ellipse cx="50" cy="72" rx="24" ry="15" fill="#ffb3c7" />
      <ellipse cx="50" cy="72" rx="24" ry="15" :fill="shade" />
      <ellipse cx="42" cy="72" rx="3.5" ry="4.5" fill="#c4607f" />
      <ellipse cx="58" cy="72" rx="3.5" ry="4.5" fill="#c4607f" />
    </g>

    <g v-else-if="kind === 'pig'">
      <path d="M23 38 L21 14 L42 25 Z" fill="#ff93b2" stroke="#ff93b2" stroke-width="6" stroke-linejoin="round" />
      <path d="M77 38 L79 14 L58 25 Z" fill="#ff93b2" stroke="#ff93b2" stroke-width="6" stroke-linejoin="round" />
      <circle cx="50" cy="55" r="33" fill="#ffb8cb" />
      <circle cx="50" cy="55" r="33" :fill="shade" />
      <ellipse cx="50" cy="65" rx="15" ry="11" fill="#ff93b2" />
      <ellipse cx="50" cy="65" rx="15" ry="11" :fill="shade" />
      <ellipse cx="45" cy="65" rx="2.8" ry="4" fill="#b8456f" />
      <ellipse cx="55" cy="65" rx="2.8" ry="4" fill="#b8456f" />
    </g>

    <g v-else-if="kind === 'sheep'">
      <circle v-for="(p, i) in wool" :key="i" :cx="p.x" :cy="p.y" r="14" fill="#fbf3e4" />
      <circle v-for="(p, i) in wool" :key="`s${i}`" :cx="p.x" :cy="p.y" r="14" :fill="shade" />
      <circle cx="50" cy="52" r="28" fill="#fbf3e4" />
      <ellipse cx="24" cy="54" rx="11" ry="5" fill="#5b4a50" transform="rotate(-15 24 54)" />
      <ellipse cx="76" cy="54" rx="11" ry="5" fill="#5b4a50" transform="rotate(15 76 54)" />
      <ellipse cx="50" cy="58" rx="17" ry="23" fill="#5b4a50" />
      <ellipse cx="50" cy="58" rx="17" ry="23" :fill="shade" />
    </g>

    <g v-else-if="kind === 'duck'">
      <path d="M50 18 Q44 6 50 2 Q52 10 58 6 Q56 14 50 18 Z" fill="#ffd23f" />
      <circle cx="50" cy="50" r="33" fill="#ffd84d" />
      <circle cx="50" cy="50" r="33" :fill="shade" />
      <ellipse cx="50" cy="66" rx="20" ry="9" fill="#ff9f1c" />
      <ellipse cx="50" cy="66" rx="20" ry="9" :fill="shade" />
      <path d="M32 66 Q50 70 68 66" stroke="#d87a00" stroke-width="2" fill="none" stroke-linecap="round" />
      <ellipse cx="45" cy="63" rx="1.6" ry="1.2" fill="#b86400" />
      <ellipse cx="55" cy="63" rx="1.6" ry="1.2" fill="#b86400" />
    </g>

    <g v-else-if="kind === 'frog'">
      <circle cx="30" cy="34" r="15" fill="#6fd263" />
      <circle cx="70" cy="34" r="15" fill="#6fd263" />
      <ellipse cx="50" cy="60" rx="40" ry="29" fill="#6fd263" />
      <ellipse cx="50" cy="60" rx="40" ry="29" :fill="shade" />
      <path d="M28 64 Q50 84 72 64" stroke="#2f7a38" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="44" cy="54" r="1.8" fill="#2f7a38" />
      <circle cx="56" cy="54" r="1.8" fill="#2f7a38" />
    </g>

    <g v-else>
      <circle v-for="(p, i) in mane" :key="i" :cx="p.x" :cy="p.y" r="15" fill="#e07b24" />
      <circle v-for="(p, i) in mane" :key="`s${i}`" :cx="p.x" :cy="p.y" r="15" :fill="shade" />
      <circle cx="28" cy="28" r="9" fill="#ffd23f" />
      <circle cx="72" cy="28" r="9" fill="#ffd23f" />
      <circle cx="50" cy="52" r="30" fill="#ffd84d" />
      <circle cx="50" cy="52" r="30" :fill="shade" />
      <ellipse cx="50" cy="66" rx="13" ry="9" fill="#fff1c4" />
      <path d="M44 59 L56 59 L50 66 Z" fill="#7a4b2a" stroke="#7a4b2a" stroke-width="2" stroke-linejoin="round" />
      <path d="M50 66 Q45 73 41 69 M50 66 Q55 73 59 69" stroke="#7a4b2a" stroke-width="2.4" fill="none" stroke-linecap="round" />
    </g>

    <!-- Rosige Bäckchen -->
    <g v-if="kind !== 'frog' && kind !== 'sheep'" :fill="CHEEK" opacity="0.5">
      <ellipse :cx="kind === 'dog' ? 31 : 29" :cy="kind === 'cow' || kind === 'cat' ? 62 : 58" rx="6" ry="4" />
      <ellipse :cx="kind === 'dog' ? 69 : 71" :cy="kind === 'cow' || kind === 'cat' ? 62 : 58" rx="6" ry="4" />
    </g>
    <g v-else-if="kind === 'frog'" :fill="CHEEK" opacity="0.45">
      <ellipse cx="22" cy="66" rx="6" ry="4" />
      <ellipse cx="78" cy="66" rx="6" ry="4" />
    </g>

    <!-- Augen: dunkel, mit Glanzpunkt -->
    <g v-if="kind === 'frog'">
      <circle cx="30" cy="34" r="10" fill="#fffaf0" />
      <circle cx="70" cy="34" r="10" fill="#fffaf0" />
      <circle cx="31" cy="36" r="5.5" :fill="INK" />
      <circle cx="71" cy="36" r="5.5" :fill="INK" />
      <circle cx="32.8" cy="34" r="1.8" fill="#fff" />
      <circle cx="72.8" cy="34" r="1.8" fill="#fff" />
    </g>
    <g v-else-if="kind === 'sheep'">
      <circle cx="43" cy="52" r="5" fill="#fffaf0" />
      <circle cx="57" cy="52" r="5" fill="#fffaf0" />
      <circle cx="43.5" cy="53" r="2.8" :fill="INK" />
      <circle cx="57.5" cy="53" r="2.8" :fill="INK" />
      <circle cx="44.4" cy="52" r="1" fill="#fff" />
      <circle cx="58.4" cy="52" r="1" fill="#fff" />
    </g>
    <g v-else>
      <circle :cx="38" :cy="kind === 'cow' || kind === 'cat' ? 52 : 46" r="5.5" :fill="INK" />
      <circle :cx="62" :cy="kind === 'cow' || kind === 'cat' ? 52 : 46" r="5.5" :fill="INK" />
      <circle :cx="39.8" :cy="kind === 'cow' || kind === 'cat' ? 50 : 44" r="2" fill="#fff" />
      <circle :cx="63.8" :cy="kind === 'cow' || kind === 'cat' ? 50 : 44" r="2" fill="#fff" />
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
