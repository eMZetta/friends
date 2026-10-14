<script setup lang="ts">
import { computed } from 'vue'

import type { Hint } from '@/lib/hints'

const props = defineProps<{ hint: Hint }>()

const isDrag = computed(() => props.hint.toX !== undefined && props.hint.toY !== undefined)

const style = computed(() => ({
  '--x': `${props.hint.x}px`,
  '--y': `${props.hint.y}px`,
  '--tx': `${props.hint.toX ?? props.hint.x}px`,
  '--ty': `${props.hint.toY ?? props.hint.y}px`,
}))
</script>

<template>
  <div class="hint" :class="isDrag ? 'drag' : 'tap'" :style="style" aria-hidden="true">
    <span class="ripple" />
    <svg class="hand" viewBox="0 0 100 120">
      <g fill="#fff" stroke="#2d3a4a" stroke-width="4" stroke-linejoin="round">
        <rect x="34" y="4" width="20" height="62" rx="10" />
        <rect x="52" y="40" width="18" height="32" rx="9" />
        <rect x="67" y="46" width="16" height="30" rx="8" />
        <rect x="14" y="62" width="30" height="17" rx="8.5" transform="rotate(-28 29 70)" />
        <rect x="26" y="52" width="58" height="52" rx="22" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hint {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
  pointer-events: none;
}

/* The fingertip sits at (44, 6) in the hand's 100×120 box. */
.hand {
  position: absolute;
  left: -44px;
  top: -6px;
  width: 100px;
  height: 120px;
  filter: drop-shadow(0 6px 6px rgba(0, 0, 0, 0.25));
  transform-origin: 44px 6px;
}

.ripple {
  position: absolute;
  left: -40px;
  top: -40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 6px solid rgba(255, 255, 255, 0.9);
  opacity: 0;
}

.tap {
  transform: translate(var(--x), var(--y));
}

.tap .hand {
  animation: tap 1.1s ease-in-out 3;
}

.tap .ripple {
  animation: ripple 1.1s ease-out 3;
}

.drag {
  animation: drag 1.7s ease-in-out 2 both;
}

.drag .hand {
  animation: press 1.7s ease-in-out 2;
}

@keyframes tap {
  0%,
  100% {
    transform: translate(18px, 24px) scale(1);
  }
  40%,
  55% {
    transform: translate(0, 0) scale(0.9);
  }
}

@keyframes ripple {
  0%,
  40% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

@keyframes drag {
  0% {
    transform: translate(var(--x), var(--y));
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  20% {
    transform: translate(var(--x), var(--y));
  }
  75% {
    transform: translate(var(--tx), var(--ty));
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

@keyframes press {
  0%,
  15% {
    transform: scale(1);
  }
  22%,
  75% {
    transform: scale(0.88);
  }
  85%,
  100% {
    transform: scale(1);
  }
}
</style>
