<script setup lang="ts">
import { useId } from 'vue'

// Lumi, the app's firefly mascot.
defineProps<{ happy?: boolean }>()

const glowId = `glow-${useId()}`
</script>

<template>
  <svg class="lumi-mascot" :class="{ happy }" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient :id="glowId">
        <stop offset="0%" stop-color="#fff7b0" />
        <stop offset="45%" stop-color="#ffe14d" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffe14d" stop-opacity="0" />
      </radialGradient>
    </defs>

    <circle class="tail-glow" cx="100" cy="158" r="48" :fill="`url(#${glowId})`" />

    <g class="wing wing-left">
      <ellipse cx="58" cy="78" rx="34" ry="22" fill="#e6f7ff" stroke="#a9dcf5" stroke-width="4" opacity="0.92" />
    </g>
    <g class="wing wing-right">
      <ellipse cx="142" cy="78" rx="34" ry="22" fill="#e6f7ff" stroke="#a9dcf5" stroke-width="4" opacity="0.92" />
    </g>

    <path d="M82 52 Q70 22 56 18" stroke="#5b4bc4" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M118 52 Q130 22 144 18" stroke="#5b4bc4" stroke-width="5" fill="none" stroke-linecap="round" />
    <circle cx="56" cy="18" r="8" fill="#ffe14d" />
    <circle cx="144" cy="18" r="8" fill="#ffe14d" />

    <ellipse cx="100" cy="150" rx="30" ry="24" fill="#ffe14d" />
    <ellipse cx="100" cy="102" rx="56" ry="54" fill="#8e7cf0" />
    <ellipse cx="100" cy="122" rx="34" ry="26" fill="#b3a7ff" />

    <g v-if="!happy" class="eyes">
      <circle cx="78" cy="92" r="17" fill="#fff" />
      <circle cx="122" cy="92" r="17" fill="#fff" />
      <circle cx="81" cy="95" r="9" fill="#2d2550" />
      <circle cx="125" cy="95" r="9" fill="#2d2550" />
      <circle cx="84" cy="91" r="3.5" fill="#fff" />
      <circle cx="128" cy="91" r="3.5" fill="#fff" />
    </g>
    <g v-else>
      <path d="M64 96 Q78 80 92 96" stroke="#2d2550" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M108 96 Q122 80 136 96" stroke="#2d2550" stroke-width="6" fill="none" stroke-linecap="round" />
    </g>

    <circle cx="62" cy="114" r="8" fill="#ff8fb1" opacity="0.7" />
    <circle cx="138" cy="114" r="8" fill="#ff8fb1" opacity="0.7" />

    <path v-if="!happy" d="M88 116 Q100 128 112 116" stroke="#2d2550" stroke-width="5" fill="none" stroke-linecap="round" />
    <path v-else d="M84 112 Q100 138 116 112 Z" fill="#2d2550" stroke="#2d2550" stroke-width="4" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.lumi-mascot {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  animation: float 3s ease-in-out infinite;
}

.lumi-mascot.happy {
  animation: hop 0.5s ease-in-out infinite alternate;
}

.wing {
  transform-box: fill-box;
  animation: flap 0.35s ease-in-out infinite alternate;
}

.wing-left {
  transform-origin: right center;
}

.wing-right {
  transform-origin: left center;
}

.tail-glow {
  transform-box: fill-box;
  transform-origin: center;
  animation: glow 1.6s ease-in-out infinite alternate;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8%);
  }
}

@keyframes hop {
  from {
    transform: translateY(0) scale(1);
  }
  to {
    transform: translateY(-12%) scale(1.05);
  }
}

@keyframes flap {
  from {
    transform: rotate(-8deg) scaleY(1);
  }
  to {
    transform: rotate(8deg) scaleY(0.75);
  }
}

@keyframes glow {
  from {
    opacity: 0.55;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>
