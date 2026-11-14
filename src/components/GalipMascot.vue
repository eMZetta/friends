<script setup lang="ts">
// Galip, the app's mascot: a loving, lively, active Border Terrier in grizzle & tan.
// He can be seen from the front, from the side (facing right, `flip` mirrors him) and from behind.
// Perlenkette wie im echten Leben: weiss und orange gestreift.
const beadsFront = [[65.8,143.1],[73.4,146.6],[81,149.3],[88.6,151],[96.2,152.1],[103.8,152.1],[111.4,151],[119,149.3],[126.6,146.6],[134.2,143.1]]
const beadsSide = [[110,113],[115,112],[122,118.5],[129.5,122.5],[137,124],[145.6,123],[151,121]]
const beadsBack = [[65.8,136],[73.4,139.5],[81,142.2],[88.6,144],[96.2,145],[103.8,145],[111.4,144],[119,142.2],[126.6,139.5],[134.2,136]]
const bead = (i: number) => (i % 2 ? '#f2a23a' : '#fff3df')

withDefaults(
  defineProps<{ happy?: boolean; shy?: boolean; pose?: 'front' | 'side' | 'back'; flip?: boolean; walking?: boolean }>(),
  {
    pose: 'front',
  },
)
</script>

<template>
  <svg class="galip" :class="[`pose-${pose}`, { happy, walking, shy }]" viewBox="0 0 200 200" aria-hidden="true">
    <ellipse cx="100" cy="193" rx="58" ry="7" fill="#3a2c5e" opacity="0.22" />

    <!-- Vorderansicht -->
    <template v-if="pose === 'front'">
      <!-- Rute: wedelt immer, beim Freuen schneller -->
      <path class="tail" d="M146 168 Q170 156 172 124" stroke="#a9763f" stroke-width="15" fill="none" stroke-linecap="round" />

      <!-- Körper und Vorderbeine -->
      <ellipse cx="100" cy="158" rx="46" ry="36" fill="#4f453f" />
      <path d="M64 146 Q100 118 136 146 Q126 128 100 126 Q74 128 64 146 Z" fill="#2b2527" opacity="0.7" />
      <path d="M80 150 Q100 176 120 150 Q116 184 100 186 Q84 184 80 150 Z" fill="#b5a287" />
      <rect x="68" y="160" width="22" height="32" rx="11" fill="#c98f55" />
      <rect x="110" y="160" width="22" height="32" rx="11" fill="#c98f55" />
      <ellipse cx="79" cy="190" rx="14" ry="7" fill="#e0b47a" />
      <ellipse cx="121" cy="190" rx="14" ry="7" fill="#e0b47a" />

      <!-- Perlenkette -->
      <circle v-for="([x, y], i) in beadsFront" :key="i" :cx="x" :cy="y" r="5.6" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />

      <!-- Kopf mit struppigem Fell -->
      <path
        d="M46 92 L40 82 L50 84 L48 72 L58 78 L62 62 L72 72 L82 58 L92 68 L104 56 L112 68 L124 58 L130 72 L140 62 L142 78 L152 72 L150 84 L160 82 L154 94
           Q158 126 126 138 Q100 146 74 138 Q42 126 46 92 Z"
        fill="#c98f55"
      />
      <!-- dunkle Stirn -->
      <path d="M48 90 L48 72 L58 78 L62 62 L72 72 L82 58 L92 68 L104 56 L112 68 L124 58 L130 72 L140 62 L142 78 L152 72 L152 90 Q126 70 100 80 Q74 70 48 90 Z" fill="#5a4a3e" />

      <!-- Ohren: kleine V-Form, nach vorn geklappt -->
      <g class="ear ear-left">
        <path d="M60 52 L38 76 Q44 98 64 92 Q74 80 72 62 Z" fill="#2e282a" />
        <path d="M54 70 Q48 84 58 90" stroke="#4d4446" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
      <g class="ear ear-right">
        <path d="M140 52 L162 76 Q156 98 136 92 Q126 80 128 62 Z" fill="#2e282a" />
        <path d="M146 70 Q152 84 142 90" stroke="#4d4446" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>

      <!-- Schnauze: dunkle Fischotter-Schnauze -->
      <path d="M58 112 L52 119 L61 120 L58 129 L67 128 L68 137 L77 133 L82 144 L90 137 L96 147 L100 140 L104 147 L110 137 L118 144 L123 133 L132 137 L133 128 L142 129 L139 120 L148 119 L142 112 Q100 142 58 112 Z" fill="#a27c50" />
      <ellipse cx="100" cy="114" rx="28" ry="20" fill="#b99266" />
      <path d="M74 124 L78 137 L88 128 L96 139 L104 130 L112 139 L122 128 L126 124 Q100 138 74 124 Z" fill="#b99266" />
      <path d="M78 106 L68 108 M79 113 L67 117 M80 120 L70 126 M122 106 L132 108 M121 113 L133 117 M120 120 L130 126" stroke="#8a6a45" stroke-width="3" stroke-linecap="round" />
      <ellipse cx="100" cy="100" rx="15" ry="11" fill="#241c1a" />
      <ellipse cx="95" cy="97" rx="4.5" ry="2.5" fill="#fff" opacity="0.55" />

      <path d="M62 80 L58 90 L66 88 L64 98 L73 94 L78 100 L82 92 L90 94 L86 84 L92 76 Q76 72 62 80 Z" fill="#5a4a3e" opacity="0.5" />
      <path d="M138 80 L142 90 L134 88 L136 98 L127 94 L122 100 L118 92 L110 94 L114 84 L108 76 Q124 72 138 80 Z" fill="#5a4a3e" opacity="0.5" />
      <!-- Augen und Brauen -->
      <g v-if="!happy">
        <circle cx="76" cy="84" r="9" fill="#2a1d17" />
        <circle cx="124" cy="84" r="9" fill="#2a1d17" />
        <circle cx="79" cy="81" r="3.4" fill="#fff" />
        <circle cx="127" cy="81" r="3.4" fill="#fff" />
      </g>
      <g v-else>
        <path d="M66 88 Q76 74 86 88" stroke="#2a1d17" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M114 88 Q124 74 134 88" stroke="#2a1d17" stroke-width="6" fill="none" stroke-linecap="round" />
      </g>
      <template v-if="shy">
        <path d="M64 74 Q76 70 88 60" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M112 60 Q124 70 136 74" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
      </template>
      <template v-else>
        <path d="M64 70 Q76 62 88 68" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M112 68 Q124 62 136 70" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
      </template>

      <circle cx="58" cy="106" r="7" fill="#ff8fb1" opacity="0.45" />
      <circle cx="142" cy="106" r="7" fill="#ff8fb1" opacity="0.45" />

      <!-- Mund: lächelt, beim Freuen hängt die Zunge heraus -->
      <path d="M100 107 L100 114" stroke="#241c1a" stroke-width="4" stroke-linecap="round" />
      <path v-if="shy" d="M88 122 Q100 114 112 122" stroke="#241c1a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path v-else-if="!happy" d="M84 114 Q92 124 100 114 Q108 124 116 114" stroke="#241c1a" stroke-width="4" fill="none" stroke-linecap="round" />
      <g v-else>
        <path d="M82 113 Q100 138 118 113 Q100 120 82 113 Z" fill="#241c1a" stroke="#241c1a" stroke-width="3" stroke-linejoin="round" />
        <path d="M92 122 Q100 148 108 122 Q100 128 92 122 Z" fill="#ff7a9a" />
      </g>
    </template>

    <!-- Seitenansicht: schaut nach rechts, `flip` spiegelt -->
    <g v-else-if="pose === 'side'" :transform="flip ? 'translate(200 0) scale(-1 1)' : undefined">
      <path class="tail" d="M46 112 Q26 100 30 70" stroke="#a9763f" stroke-width="14" fill="none" stroke-linecap="round" />

      <!-- Beine der fernen Seite -->
      <g class="leg leg-b">
        <rect x="72" y="128" width="18" height="54" rx="9" fill="#a57443" />
        <ellipse cx="81" cy="184" rx="12" ry="6" fill="#d9b88a" />
      </g>
      <g class="leg leg-a">
        <rect x="122" y="128" width="18" height="54" rx="9" fill="#a57443" />
        <ellipse cx="131" cy="184" rx="12" ry="6" fill="#d9b88a" />
      </g>

      <ellipse cx="96" cy="118" rx="58" ry="32" fill="#b98650" />
      <path d="M40 114 Q54 76 96 78 Q138 80 152 108 Q96 98 40 114 Z" fill="#4a403a" />
      <ellipse cx="140" cy="132" rx="14" ry="17" fill="#b5a287" />

      <!-- Beine der nahen Seite -->
      <g class="leg leg-a">
        <rect x="52" y="128" width="20" height="54" rx="10" fill="#c98f55" />
        <ellipse cx="62" cy="184" rx="13" ry="6.5" fill="#e9c595" />
      </g>
      <g class="leg leg-b">
        <rect x="130" y="128" width="20" height="54" rx="10" fill="#c98f55" />
        <ellipse cx="140" cy="184" rx="13" ry="6.5" fill="#e9c595" />
      </g>

      <!-- Hals und Perlenkette -->
      <ellipse cx="126" cy="104" rx="24" ry="26" fill="#4f453f" />
      <circle v-for="([x, y], i) in beadsSide" :key="i" :cx="x" :cy="y" r="5.2" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />

      <!-- Kopf -->
      <path d="M116 68 L122 54 L132 62 L140 50 L150 60 L158 54 L162 68 Q176 80 166 96 L120 104 Q106 84 116 68 Z" fill="#c98f55" />
      <ellipse cx="142" cy="86" rx="32" ry="29" fill="#c98f55" />
      <path d="M114 70 L122 54 L132 62 L140 50 L150 60 L158 54 L164 70 Q150 66 140 76 Q124 74 114 70 Z" fill="#5a4a3e" />
      <path d="M150 104 L146 112 L154 112 L152 122 L160 118 L162 128 L169 121 L174 130 L178 120 L186 124 L184 112 L190 108 L184 100 Z" fill="#a27c50" />
      <ellipse cx="168" cy="97" rx="22" ry="15" fill="#b99266" />
      <path d="M152 106 L156 120 L162 112 L168 122 L174 112 L182 118 L184 104 Z" fill="#b99266" />
      <path d="M156 94 L148 96 M158 100 L148 105 M184 112 L190 118" stroke="#8a6a45" stroke-width="2.6" stroke-linecap="round" fill="none" />
      <path d="M170 108 Q174 128 181 110 Z" fill="#ff7a9a" />
      <ellipse cx="187" cy="91" rx="7.5" ry="6.5" fill="#241c1a" />
      <ellipse cx="185" cy="89" rx="2.6" ry="1.6" fill="#fff" opacity="0.55" />
      <path d="M158 106 Q170 112 184 103" stroke="#241c1a" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M140 72 L138 80 L144 79 L143 88 L150 85 L153 92 L158 86 L165 88 L162 80 L168 74 Q152 66 140 72 Z" fill="#5a4a3e" opacity="0.5" />
      <circle cx="154" cy="78" r="6.5" fill="#2a1d17" />
      <circle cx="156.5" cy="75.5" r="2.4" fill="#fff" />
      <path v-if="shy" d="M144 70 Q154 68 165 58" stroke="#e0b47a" stroke-width="4" fill="none" stroke-linecap="round" />
      <path v-else d="M144 67 Q154 61 165 67" stroke="#e0b47a" stroke-width="4" fill="none" stroke-linecap="round" />
      <circle cx="146" cy="94" r="5" fill="#ff8fb1" opacity="0.4" />
      <g class="ear ear-left">
        <path d="M134 54 L114 70 Q112 94 134 96 Q148 84 146 60 Z" fill="#2e282a" />
        <path d="M126 70 Q122 84 132 90" stroke="#4d4446" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>
    </g>

    <!-- Rückansicht: er läuft vom Betrachter weg -->
    <template v-else>
      <path class="tail" d="M122 168 Q152 152 150 112" stroke="#a9763f" stroke-width="15" fill="none" stroke-linecap="round" />
      <ellipse cx="100" cy="152" rx="48" ry="38" fill="#b98650" />
      <path d="M52 156 Q54 108 100 108 Q146 108 148 156 Q100 126 52 156 Z" fill="#4a403a" />
      <ellipse class="paw paw-a" cx="72" cy="186" rx="16" ry="8" fill="#c98f55" />
      <ellipse class="paw paw-b" cx="128" cy="186" rx="16" ry="8" fill="#c98f55" />
      <circle v-for="([x, y], i) in beadsBack" :key="i" :cx="x" :cy="y" r="5.6" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />
      <path d="M54 98 L34 106 L50 111 L38 121 L56 121 L52 134 L68 127 L78 116 Z" fill="#a27c50" />
      <path d="M146 98 L166 106 L150 111 L162 121 L144 121 L148 134 L132 127 L122 116 Z" fill="#a27c50" />
      <path
        d="M46 88 L40 78 L50 80 L48 68 L58 74 L62 58 L72 68 L82 54 L92 64 L104 52 L112 64 L124 54 L130 68 L140 58 L142 74 L152 68 L150 80 L160 78 L154 90
           Q158 122 126 134 Q100 142 74 134 Q42 122 46 88 Z"
        fill="#5a4a3e"
      />
      <g class="ear ear-left">
        <path d="M60 48 L38 72 Q44 94 64 88 Q74 76 72 58 Z" fill="#2e282a" />
      </g>
      <g class="ear ear-right">
        <path d="M140 48 L162 72 Q156 94 136 88 Q126 76 128 58 Z" fill="#2e282a" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
.galip {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  animation: bounce 1.6s ease-in-out infinite;
  transform-origin: 50% 100%;
}

.galip.happy {
  animation: hop 0.45s ease-in-out infinite alternate;
}

/* Beim Laufen: ruhiger Trab */
.galip.walking {
  animation: trot 0.5s ease-in-out infinite;
}

.tail {
  transform-box: fill-box;
  transform-origin: 0% 100%;
  animation: wag 0.5s ease-in-out infinite alternate;
}

.pose-side .tail {
  transform-origin: 100% 100%;
}

.happy .tail {
  animation-duration: 0.18s;
}

/* Ängstlich: Rute eingezogen, Ohren flach, ein leichtes Zittern */
.shy .tail {
  animation: none;
  transform: rotate(32deg);
}

.shy.pose-front .ear-left {
  animation: none;
  transform: rotate(-24deg);
}

.shy.pose-front .ear-right {
  animation: none;
  transform: rotate(24deg);
}

.shy.pose-side .ear {
  animation: none;
  transform: rotate(-20deg);
}

.galip.shy:not(.walking) {
  animation: tremble 0.3s linear infinite;
}

.galip.shy.walking {
  animation: trot 0.34s ease-in-out infinite;
}

.ear {
  transform-box: fill-box;
  animation: flop 2.4s ease-in-out infinite;
}

.ear-left {
  transform-origin: 85% 10%;
}

.ear-right {
  transform-origin: 15% 10%;
  animation-direction: reverse;
}

.pose-side .ear {
  transform-origin: 60% 10%;
}

.leg {
  transform-box: fill-box;
  transform-origin: 50% 8%;
}

.walking .leg-a {
  animation: stride 0.5s ease-in-out infinite alternate;
}

.walking .leg-b {
  animation: stride 0.5s ease-in-out infinite alternate-reverse;
}

.walking .paw-a {
  animation: step 0.5s ease-in-out infinite alternate;
}

.walking .paw-b {
  animation: step 0.5s ease-in-out infinite alternate-reverse;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  45% {
    transform: translateY(-5%) scale(0.99, 1.02);
  }
  60% {
    transform: translateY(0) scale(1.02, 0.98);
  }
}

@keyframes hop {
  from {
    transform: translateY(0) scale(1.03, 0.97);
  }
  to {
    transform: translateY(-12%) scale(0.98, 1.03);
  }
}

@keyframes tremble {
  0%,
  100% {
    transform: translateX(-1px) scaleY(0.96);
  }
  50% {
    transform: translateX(1px) scaleY(0.96);
  }
}

@keyframes trot {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3%);
  }
}

@keyframes stride {
  from {
    transform: rotate(-22deg);
  }
  to {
    transform: rotate(22deg);
  }
}

@keyframes step {
  from {
    transform: translateY(-6px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes wag {
  from {
    transform: rotate(-14deg);
  }
  to {
    transform: rotate(16deg);
  }
}

@keyframes flop {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(5deg);
  }
}
</style>
