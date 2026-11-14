<script setup lang="ts">
// Galip, the app's mascot: a loving, lively, active Border Terrier in grizzle & tan.
// He can be seen from the front (sitting), from the side (facing right, `flip` mirrors him) and from behind.
// Every body part is its own group so that head, ears, tail and legs move independently:
// breathing, blinking, ear flicks, a two-part wagging tail, a trotting walk cycle and a few tricks (`action`).
import { useId } from 'vue'

import type { GalipAction } from './galipActions'

withDefaults(
  defineProps<{
    happy?: boolean
    shy?: boolean
    pose?: 'front' | 'side' | 'back'
    flip?: boolean
    walking?: boolean
    action?: GalipAction | null
  }>(),
  {
    pose: 'front',
    action: null,
  },
)

const uid = useId()

// Perlenkette wie im echten Leben: weiss und orange gestreift.
const beadsFront = [[65.8,143.1],[73.4,146.6],[81,149.3],[88.6,151],[96.2,152.1],[103.8,152.1],[111.4,151],[119,149.3],[126.6,146.6],[134.2,143.1]]
const beadsSide = [[110,113],[115,112],[122,118.5],[129.5,122.5],[137,124],[145.6,123],[151,121]]
const beadsBack = [[65.8,136],[73.4,139.5],[81,142.2],[88.6,144],[96.2,145],[103.8,145],[111.4,144],[119,142.2],[126.6,139.5],[134.2,136]]
const bead = (i: number) => (i % 2 ? '#f2a23a' : '#fff3df')

// Seitenansicht: vier Beine, jedes mit Hüfte und Knie. Diagonale Paare laufen gleichzeitig (Trab).
const legs = [
  { id: 'hind-far', hx: 62, dx: 20, far: true, phase: 'b' },
  { id: 'fore-far', hx: 138, dx: -16, far: true, phase: 'a' },
  { id: 'hind-near', hx: 62, dx: 0, far: false, phase: 'a' },
  { id: 'fore-near', hx: 138, dx: 0, far: false, phase: 'b' },
]
const farLegs = legs.filter((l) => l.far)
const nearLegs = legs.filter((l) => !l.far)
const legPath = (hx: number) => `M${hx - 12} 122 Q${hx - 16} 144 ${hx - 6} 154 L${hx + 10} 154 Q${hx + 14} 136 ${hx + 10} 122 Z`
</script>

<template>
  <svg
    class="galip"
    :class="[`pose-${pose}`, action ? `act-${action}` : null, { happy, walking, shy }]"
    viewBox="0 0 200 200"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="`tan-${uid}`" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#dba46a" />
        <stop offset="1" stop-color="#b9814b" />
      </linearGradient>
      <linearGradient :id="`leg-${uid}`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#d6a16a" />
        <stop offset="1" stop-color="#bb8450" />
      </linearGradient>
      <linearGradient :id="`dark-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4b403a" />
        <stop offset="1" stop-color="#6b5a4e" />
      </linearGradient>
      <linearGradient :id="`ear-${uid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3d3537" />
        <stop offset="1" stop-color="#1f1a1c" />
      </linearGradient>
      <linearGradient :id="`muzzle-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c6a277" />
        <stop offset="1" stop-color="#a98457" />
      </linearGradient>
    </defs>

    <ellipse class="ground-shadow" cx="100" cy="193" rx="58" ry="7" fill="#3a2c5e" opacity="0.22" />

    <!-- ===================== Vorderansicht (er sitzt) ===================== -->
    <g v-if="pose === 'front'" class="motion">
      <!-- Rute: zwei Glieder, die Spitze schwingt verzögert -->
      <g class="tail">
        <path d="M144 170 Q164 164 168 146" stroke="#a9763f" stroke-width="14" fill="none" stroke-linecap="round" />
        <g class="tail-tip">
          <path d="M168 146 Q172 134 170 122" stroke="#b8844c" stroke-width="11" fill="none" stroke-linecap="round" />
        </g>
      </g>

      <!-- Hinterbeine (sitzend) -->
      <ellipse cx="62" cy="164" rx="22" ry="26" fill="#a9763f" />
      <ellipse cx="138" cy="164" rx="22" ry="26" fill="#a9763f" />
      <ellipse cx="56" cy="190" rx="13" ry="6.5" fill="#dcae78" />
      <ellipse cx="144" cy="190" rx="13" ry="6.5" fill="#dcae78" />

      <!-- Körper: dunkles Grizzle, helles Brustlätzchen; atmet -->
      <g class="torso">
        <ellipse cx="100" cy="150" rx="42" ry="40" :fill="`url(#dark-${uid})`" />
        <path d="M62 138 Q100 110 138 138 Q128 122 100 120 Q72 122 62 138 Z" fill="#241c1a" opacity="0.4" />
        <path d="M80 146 Q100 176 120 146 Q116 184 100 186 Q84 184 80 146 Z" fill="#bcab91" />
        <path d="M92 156 L92 166 M100 158 L100 170 M108 156 L108 166" stroke="#9a8a72" stroke-width="2.5" stroke-linecap="round" />
      </g>

      <!-- Vorderbeine (beim Männchen heben sie sich) -->
      <g class="fleg fleg-l">
        <path d="M72 138 Q64 168 68 186 L92 186 Q94 164 90 138 Z" :fill="`url(#leg-${uid})`" />
        <ellipse cx="80" cy="189" rx="15" ry="7.5" fill="#e0b47a" />
        <path d="M75 186 L75 192 M80 185 L80 192 M85 186 L85 192" stroke="#b9814b" stroke-width="1.6" stroke-linecap="round" />
      </g>
      <g class="fleg fleg-r">
        <path d="M128 138 Q136 168 132 186 L108 186 Q106 164 110 138 Z" :fill="`url(#leg-${uid})`" />
        <ellipse cx="120" cy="189" rx="15" ry="7.5" fill="#e0b47a" />
        <path d="M115 186 L115 192 M120 185 L120 192 M125 186 L125 192" stroke="#b9814b" stroke-width="1.6" stroke-linecap="round" />
      </g>

      <!-- Schatten des Kopfes auf der Brust -->
      <ellipse cx="100" cy="138" rx="36" ry="10" fill="#241c1a" opacity="0.28" />

      <!-- Perlenkette -->
      <circle v-for="([x, y], i) in beadsFront" :key="i" :cx="x" :cy="y" r="5.6" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />

      <!-- Kopf -->
      <g class="head">
        <path
          d="M46 92 L40 82 L50 84 L48 72 L58 78 L62 62 L72 72 L82 58 L92 68 L104 56 L112 68 L124 58 L130 72 L140 62 L142 78 L152 72 L150 84 L160 82 L154 94
             Q158 126 126 138 Q100 146 74 138 Q42 126 46 92 Z"
          :fill="`url(#tan-${uid})`"
        />
        <!-- dunkle Stirn -->
        <path d="M48 90 L48 72 L58 78 L62 62 L72 72 L82 58 L92 68 L104 56 L112 68 L124 58 L130 72 L140 62 L142 78 L152 72 L152 90 Q126 70 100 80 Q74 70 48 90 Z" fill="#5a4a3e" />
        <path d="M84 66 L86 76 M100 62 L100 74 M116 66 L114 76 M70 76 L74 84 M130 76 L126 84" stroke="#3f342c" stroke-width="2.6" stroke-linecap="round" opacity="0.65" />
        <!-- Wangen leicht schattiert -->
        <ellipse cx="56" cy="112" rx="9" ry="16" fill="#a9763f" opacity="0.28" />
        <ellipse cx="144" cy="112" rx="9" ry="16" fill="#a9763f" opacity="0.28" />

        <!-- Ohren: kleine V-Form, nach vorn geklappt -->
        <g class="ear ear-left">
          <path d="M60 52 L38 76 Q44 98 64 92 Q74 80 72 62 Z" :fill="`url(#ear-${uid})`" />
          <path d="M54 70 Q48 84 58 90" stroke="#5a5052" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>
        <g class="ear ear-right">
          <path d="M140 52 L162 76 Q156 98 136 92 Q126 80 128 62 Z" :fill="`url(#ear-${uid})`" />
          <path d="M146 70 Q152 84 142 90" stroke="#5a5052" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>

        <!-- struppiger Bart und Schnauze -->
        <path d="M58 112 L52 119 L61 120 L58 129 L67 128 L68 137 L77 133 L82 144 L90 137 L96 147 L100 140 L104 147 L110 137 L118 144 L123 133 L132 137 L133 128 L142 129 L139 120 L148 119 L142 112 Q100 142 58 112 Z" fill="#a27c50" />
        <ellipse cx="100" cy="114" rx="28" ry="20" :fill="`url(#muzzle-${uid})`" />
        <path d="M74 124 L78 137 L88 128 L96 139 L104 130 L112 139 L122 128 L126 124 Q100 138 74 124 Z" :fill="`url(#muzzle-${uid})`" />
        <path d="M78 106 L68 108 M79 113 L67 117 M80 120 L70 126 M122 106 L132 108 M121 113 L133 117 M120 120 L130 126" stroke="#8a6a45" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="100" cy="100" rx="15" ry="11" fill="#241c1a" />
        <ellipse cx="94" cy="96.5" rx="5" ry="2.6" fill="#fff" opacity="0.6" />

        <!-- Gesichtsmaske -->
        <path d="M62 80 L58 90 L66 88 L64 98 L73 94 L78 100 L82 92 L90 94 L86 84 L92 76 Q76 72 62 80 Z" fill="#5a4a3e" opacity="0.5" />
        <path d="M138 80 L142 90 L134 88 L136 98 L127 94 L122 100 L118 92 L110 94 L114 84 L108 76 Q124 72 138 80 Z" fill="#5a4a3e" opacity="0.5" />

        <!-- Augen -->
        <g v-if="action === 'sleep' || action === 'yawn'">
          <path d="M66 86 Q76 94 86 86" stroke="#2a1d17" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M114 86 Q124 94 134 86" stroke="#2a1d17" stroke-width="5" fill="none" stroke-linecap="round" />
        </g>
        <g v-else-if="happy">
          <path d="M66 88 Q76 74 86 88" stroke="#2a1d17" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M114 88 Q124 74 134 88" stroke="#2a1d17" stroke-width="6" fill="none" stroke-linecap="round" />
        </g>
        <g v-else class="eyes">
          <g class="eye">
            <circle cx="76" cy="84" r="9.5" fill="#2a1d17" />
            <circle cx="76" cy="85" r="6.4" fill="#4a2f22" />
            <circle cx="76" cy="85" r="4.2" fill="#120c0a" />
            <circle cx="79.4" cy="80.6" r="3.4" fill="#fff" />
            <circle cx="72.6" cy="88.6" r="1.5" fill="#fff" opacity="0.8" />
          </g>
          <g class="eye">
            <circle cx="124" cy="84" r="9.5" fill="#2a1d17" />
            <circle cx="124" cy="85" r="6.4" fill="#4a2f22" />
            <circle cx="124" cy="85" r="4.2" fill="#120c0a" />
            <circle cx="127.4" cy="80.6" r="3.4" fill="#fff" />
            <circle cx="120.6" cy="88.6" r="1.5" fill="#fff" opacity="0.8" />
          </g>
        </g>
        <!-- Brauen -->
        <g class="brows">
          <template v-if="shy">
            <path d="M64 74 Q76 70 88 60" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
            <path d="M112 60 Q124 70 136 74" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
          </template>
          <template v-else>
            <path d="M64 70 Q76 62 88 68" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
            <path d="M112 68 Q124 62 136 70" stroke="#e0b47a" stroke-width="5" fill="none" stroke-linecap="round" />
          </template>
        </g>

        <circle cx="58" cy="106" r="7" fill="#ff8fb1" opacity="0.4" />
        <circle cx="142" cy="106" r="7" fill="#ff8fb1" opacity="0.4" />

        <!-- Mund -->
        <path d="M100 107 L100 114" stroke="#241c1a" stroke-width="4" stroke-linecap="round" />
        <g v-if="action === 'yawn'" class="yawn-mouth">
          <path d="M80 112 Q100 160 120 112 Q100 120 80 112 Z" fill="#241c1a" stroke="#241c1a" stroke-width="3" stroke-linejoin="round" />
          <path d="M90 130 Q100 152 110 130 Q100 138 90 130 Z" fill="#ff7a9a" />
        </g>
        <path v-else-if="shy" d="M88 122 Q100 114 112 122" stroke="#241c1a" stroke-width="4" fill="none" stroke-linecap="round" />
        <g v-else-if="happy" class="pant">
          <path d="M82 113 Q100 138 118 113 Q100 120 82 113 Z" fill="#241c1a" stroke="#241c1a" stroke-width="3" stroke-linejoin="round" />
          <path d="M92 122 Q100 148 108 122 Q100 128 92 122 Z" fill="#ff7a9a" />
        </g>
        <path v-else d="M84 114 Q92 124 100 114 Q108 124 116 114" stroke="#241c1a" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>

      <!-- Beim Hinlegen liegen die Pfoten vor dem Kopf -->
      <g class="lie-paws">
        <ellipse cx="76" cy="188" rx="17" ry="9" fill="#e0b47a" />
        <ellipse cx="124" cy="188" rx="17" ry="9" fill="#e0b47a" />
        <path d="M70 185 L70 193 M76 184 L76 194 M82 185 L82 193 M118 185 L118 193 M124 184 L124 194 M130 185 L130 193" stroke="#b9814b" stroke-width="1.6" stroke-linecap="round" />
      </g>

      <!-- Zzz beim Schlafen -->
      <g v-if="action === 'sleep'" fill="none" stroke="#fff6e8" stroke-linecap="round" stroke-linejoin="round">
        <path class="zzz z1" d="M146 92 H158 L146 108 H158" stroke-width="4" />
        <path class="zzz z2" d="M160 66 H169 L160 78 H169" stroke-width="3.2" />
        <path class="zzz z3" d="M172 46 H178 L172 54 H178" stroke-width="2.6" />
      </g>
    </g>

    <!-- ===================== Seitenansicht: schaut nach rechts, `flip` spiegelt ===================== -->
    <g v-else-if="pose === 'side'" :transform="flip ? 'translate(200 0) scale(-1 1)' : undefined">
      <g class="motion">
        <g class="rig">
          <!-- Rute -->
          <g class="tail">
            <path d="M48 114 Q34 108 32 92" stroke="#a9763f" stroke-width="13" fill="none" stroke-linecap="round" />
            <g class="tail-tip">
              <path d="M32 92 Q30 80 36 70" stroke="#b8844c" stroke-width="10" fill="none" stroke-linecap="round" />
            </g>
          </g>

          <!-- Beine der fernen Seite -->
          <g v-for="l in farLegs" :key="l.id" :transform="`translate(${l.dx} 0)`">
            <g :class="['leg', l.id.startsWith('hind') ? 'hind' : 'fore', `phase-${l.phase}`]">
              <path :d="legPath(l.hx)" fill="#9a6a3a" />
              <g class="shin">
                <rect :x="l.hx - 6" y="150" width="14" height="30" rx="7" fill="#9a6a3a" />
                <ellipse :cx="l.hx + 1" cy="184" rx="11" ry="6" fill="#cfae80" />
              </g>
            </g>
          </g>

          <!-- Körper -->
          <ellipse cx="96" cy="118" rx="58" ry="32" fill="#b98650" />
          <path d="M40 114 Q54 76 96 78 Q138 80 152 108 Q96 98 40 114 Z" :fill="`url(#dark-${uid})`" />
          <path d="M44 128 Q96 150 148 128 Q140 146 96 148 Q52 146 44 128 Z" fill="#d1ab76" opacity="0.7" />
          <ellipse cx="140" cy="132" rx="14" ry="17" fill="#bcab91" />

          <!-- Beine der nahen Seite -->
          <g v-for="l in nearLegs" :key="l.id">
            <g :class="['leg', l.id.startsWith('hind') ? 'hind' : 'fore', `phase-${l.phase}`]">
              <path :d="legPath(l.hx)" :fill="`url(#leg-${uid})`" />
              <g class="shin">
                <rect :x="l.hx - 6" y="150" width="14" height="30" rx="7" :fill="`url(#leg-${uid})`" />
                <ellipse :cx="l.hx + 1" cy="184" rx="12" ry="6.4" fill="#e0b47a" />
                <path :d="`M${l.hx + 5} 182 L${l.hx + 5} 189 M${l.hx + 9} 183 L${l.hx + 9} 189`" stroke="#b9814b" stroke-width="1.4" stroke-linecap="round" />
              </g>
            </g>
          </g>

          <!-- Hals, Perlenkette und Kopf: schnüffeln senkt alles zusammen -->
          <g class="s-head">
            <ellipse cx="126" cy="104" rx="24" ry="26" fill="#4f453f" />
            <circle v-for="([x, y], i) in beadsSide" :key="i" :cx="x" :cy="y" r="5.2" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />

            <path d="M116 68 L122 54 L132 62 L140 50 L150 60 L158 54 L162 68 Q176 80 166 96 L120 104 Q106 84 116 68 Z" :fill="`url(#tan-${uid})`" />
            <ellipse cx="142" cy="86" rx="32" ry="29" :fill="`url(#tan-${uid})`" />
            <path d="M114 70 L122 54 L132 62 L140 50 L150 60 L158 54 L164 70 Q150 66 140 76 Q124 74 114 70 Z" fill="#5a4a3e" />
            <path d="M150 104 L146 112 L154 112 L152 122 L160 118 L162 128 L169 121 L174 130 L178 120 L186 124 L184 112 L190 108 L184 100 Z" fill="#a27c50" />
            <ellipse cx="168" cy="97" rx="22" ry="15" :fill="`url(#muzzle-${uid})`" />
            <path d="M152 106 L156 120 L162 112 L168 122 L174 112 L182 118 L184 104 Z" :fill="`url(#muzzle-${uid})`" />
            <g v-if="happy || walking || action === 'sniff'" class="pant">
              <path d="M170 108 Q174 128 181 110 Z" fill="#ff7a9a" />
            </g>
            <path d="M156 94 L148 96 M158 100 L148 105 M184 112 L190 118" stroke="#8a6a45" stroke-width="2.6" stroke-linecap="round" fill="none" />
            <g class="nose">
              <ellipse cx="187" cy="91" rx="7.5" ry="6.5" fill="#241c1a" />
              <ellipse cx="185" cy="89" rx="2.6" ry="1.6" fill="#fff" opacity="0.55" />
            </g>
            <path d="M158 106 Q170 112 184 103" stroke="#241c1a" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M140 72 L138 80 L144 79 L143 88 L150 85 L153 92 L158 86 L165 88 L162 80 L168 74 Q152 66 140 72 Z" fill="#5a4a3e" opacity="0.5" />
            <g v-if="happy" class="eye-happy">
              <path d="M148 80 Q154 71 161 80" stroke="#2a1d17" stroke-width="4.5" fill="none" stroke-linecap="round" />
            </g>
            <g v-else class="eye">
              <circle cx="154" cy="78" r="7" fill="#2a1d17" />
              <circle cx="154" cy="79" r="4.6" fill="#4a2f22" />
              <circle cx="154" cy="79" r="3" fill="#120c0a" />
              <circle cx="156.6" cy="75.4" r="2.5" fill="#fff" />
              <circle cx="151.6" cy="81.6" r="1.1" fill="#fff" opacity="0.8" />
            </g>
            <path v-if="shy" d="M144 70 Q154 68 165 58" stroke="#e0b47a" stroke-width="4" fill="none" stroke-linecap="round" />
            <path v-else d="M144 67 Q154 61 165 67" stroke="#e0b47a" stroke-width="4" fill="none" stroke-linecap="round" />
            <circle cx="146" cy="94" r="5" fill="#ff8fb1" opacity="0.4" />
            <g class="ear ear-left">
              <path d="M134 54 L114 70 Q112 94 134 96 Q148 84 146 60 Z" :fill="`url(#ear-${uid})`" />
              <path d="M126 70 Q122 84 132 90" stroke="#5a5052" stroke-width="3.5" fill="none" stroke-linecap="round" />
            </g>
          </g>
        </g>
      </g>
    </g>

    <!-- ===================== Rückansicht: er läuft vom Betrachter weg ===================== -->
    <g v-else class="motion">
      <g class="tail">
        <path d="M122 168 Q146 160 150 140" stroke="#a9763f" stroke-width="14" fill="none" stroke-linecap="round" />
        <g class="tail-tip">
          <path d="M150 140 Q152 126 148 114" stroke="#b8844c" stroke-width="11" fill="none" stroke-linecap="round" />
        </g>
      </g>
      <ellipse cx="100" cy="152" rx="48" ry="38" fill="#b98650" />
      <path d="M52 156 Q54 108 100 108 Q146 108 148 156 Q100 126 52 156 Z" :fill="`url(#dark-${uid})`" />
      <ellipse class="paw paw-a" cx="72" cy="186" rx="16" ry="8" fill="#c98f55" />
      <ellipse class="paw paw-b" cx="128" cy="186" rx="16" ry="8" fill="#c98f55" />
      <circle v-for="([x, y], i) in beadsBack" :key="i" :cx="x" :cy="y" r="5.6" :fill="bead(i)" stroke="#8a5a2b" stroke-width="1.2" />
      <g class="head">
        <path d="M54 98 L34 106 L50 111 L38 121 L56 121 L52 134 L68 127 L78 116 Z" fill="#a27c50" />
        <path d="M146 98 L166 106 L150 111 L162 121 L144 121 L148 134 L132 127 L122 116 Z" fill="#a27c50" />
        <path
          d="M46 88 L40 78 L50 80 L48 68 L58 74 L62 58 L72 68 L82 54 L92 64 L104 52 L112 64 L124 54 L130 68 L140 58 L142 74 L152 68 L150 80 L160 78 L154 90
             Q158 122 126 134 Q100 142 74 134 Q42 122 46 88 Z"
          fill="#5a4a3e"
        />
        <path d="M84 66 L86 78 M100 62 L100 76 M116 66 L114 78 M70 78 L72 90 M130 78 L128 90" stroke="#3f342c" stroke-width="2.6" stroke-linecap="round" opacity="0.65" />
        <g class="ear ear-left">
          <path d="M60 48 L38 72 Q44 94 64 88 Q74 76 72 58 Z" :fill="`url(#ear-${uid})`" />
        </g>
        <g class="ear ear-right">
          <path d="M140 48 L162 72 Q156 94 136 88 Q126 76 128 58 Z" :fill="`url(#ear-${uid})`" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.galip {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* Alle Teile drehen sich um absolute Punkte im Bild (nicht um ihre eigene Mitte). */
.galip :is(g, path, ellipse, circle) {
  transform-box: view-box;
}

/* ---------- Gemeinsame Bewegung: Atmen, Rute, Ohren, Blinzeln ---------- */
.motion {
  transform-origin: 100px 190px;
}

.tail {
  transform-origin: 146px 170px;
  animation: wag 1.1s ease-in-out infinite alternate;
  transition: rotate 0.5s ease;
}

.tail-tip {
  transform-origin: 168px 146px;
  animation: wag-tip 1.1s ease-in-out infinite alternate;
}

.pose-side .tail {
  transform-origin: 48px 114px;
}

.pose-side .tail-tip {
  transform-origin: 32px 92px;
}

.pose-back .tail {
  transform-origin: 122px 168px;
}

.pose-back .tail-tip {
  transform-origin: 150px 140px;
}

.happy .tail,
.happy .tail-tip,
.act-jump .tail,
.act-jump .tail-tip,
.act-beg .tail,
.act-beg .tail-tip,
.act-bow .tail,
.act-bow .tail-tip {
  animation-duration: 0.22s;
}

.walking .tail,
.walking .tail-tip {
  animation-duration: 0.45s;
}

.act-sleep .tail,
.act-sleep .tail-tip,
.act-lie .tail,
.act-lie .tail-tip {
  animation-duration: 2.8s;
}

.ear {
  transition: rotate 0.35s ease;
}

.ear-left {
  transform-origin: 66px 62px;
  animation: ear-flick 6.5s ease-in-out infinite;
}

.ear-right {
  transform-origin: 134px 62px;
  animation: ear-flick-r 7.7s ease-in-out infinite 1.4s;
}

.pose-side .ear-left {
  transform-origin: 134px 60px;
  animation-name: ear-flick-side;
}

.pose-back .ear-left {
  transform-origin: 66px 58px;
}

.pose-back .ear-right {
  transform-origin: 134px 58px;
}

.eye {
  transform-origin: 76px 84px;
  animation: blink 4.8s infinite;
}

.eye + .eye {
  transform-origin: 124px 84px;
}

.pose-side .eye {
  transform-origin: 154px 78px;
}

.nose {
  transform-origin: 187px 91px;
}

.act-sniff .nose {
  animation: nose-twitch 0.28s ease-in-out infinite alternate;
}

.pant {
  transform-origin: 100px 114px;
  animation: pant 0.5s ease-in-out infinite alternate;
}

.pose-side .pant {
  transform-origin: 174px 108px;
}

.torso {
  transform-origin: 100px 190px;
  animation: breathe 3.4s ease-in-out infinite;
  transition: translate 0.5s ease, scale 0.5s ease;
}

.head {
  transform-origin: 100px 134px;
  animation: head-sway 7s ease-in-out infinite;
  transition: translate 0.5s ease, rotate 0.5s ease;
}

.fleg {
  transition: translate 0.4s ease, rotate 0.4s ease, opacity 0.3s;
}

.fleg-l {
  transform-origin: 80px 138px;
}

.fleg-r {
  transform-origin: 120px 138px;
}

.lie-paws {
  opacity: 0;
  transition: opacity 0.3s 0.3s;
}

/* ---------- Vorderansicht: Aktionen ---------- */
.act-tilt .head {
  animation: tilt 2.6s ease-in-out;
}

.act-tilt .ear-left {
  animation: ear-perk 2.6s ease-in-out;
}

.act-yawn .head {
  animation: yawn-head 2.8s ease-in-out;
}

.yawn-mouth {
  transform-origin: 100px 112px;
  animation: yawn-mouth 2.8s ease-in-out;
}

.act-lie .torso,
.act-sleep .torso {
  translate: 0 14px;
  scale: 1.08 0.7;
}

.act-lie .head,
.act-sleep .head {
  translate: 0 28px;
  animation: none;
}

.act-lie .fleg,
.act-sleep .fleg {
  opacity: 0;
}

.act-lie .lie-paws,
.act-sleep .lie-paws {
  opacity: 1;
}

.act-sleep .torso {
  animation: breathe-slow 3.6s ease-in-out infinite;
}

.act-sleep .head {
  animation: sleep-nod 3.6s ease-in-out infinite;
}

.act-beg .torso {
  translate: 0 -8px;
  scale: 0.98 1.1;
}

.act-beg .fleg-l {
  translate: -2px -26px;
  rotate: 24deg;
}

.act-beg .fleg-r {
  translate: 2px -26px;
  rotate: -24deg;
}

.act-beg .head {
  translate: 0 -12px;
  rotate: -4deg;
}

.act-shake .motion {
  animation: shake 0.16s ease-in-out infinite alternate;
}

.act-shake .head {
  animation: shake-head 0.12s ease-in-out infinite alternate;
}

.act-shake .ear-left {
  animation: ear-shake 0.1s ease-in-out infinite alternate;
}

.act-shake .ear-right {
  animation: ear-shake 0.1s ease-in-out infinite alternate-reverse;
}

.act-spin .motion {
  animation: spin 1.5s ease-in-out;
}

.happy.pose-front:not([class*='act-']) .motion {
  animation: hop 0.5s ease-in-out infinite alternate;
}

.galip.act-jump .motion {
  animation: jump 0.75s cubic-bezier(0.3, 0.1, 0.4, 1) 2;
}

.galip.act-jump .ear-left,
.galip.act-jump .ear-right {
  animation: ear-fly 0.75s ease-in-out 2;
}

/* ---------- Schüchtern: Rute eingezogen, Ohren flach, Kopf gesenkt, ein leichtes Zittern ---------- */
.shy .tail {
  animation: none;
  rotate: 32deg;
}

.shy .tail-tip {
  animation: none;
}

.shy.pose-front .ear-left,
.shy.pose-back .ear-left {
  animation: none;
  rotate: -26deg;
}

.shy.pose-front .ear-right,
.shy.pose-back .ear-right {
  animation: none;
  rotate: 26deg;
}

.shy.pose-side .ear {
  animation: none;
  rotate: -22deg;
}

.shy.pose-front .head {
  translate: 0 6px;
  animation: none;
}

.shy:not(.walking) .motion {
  animation: tremble 0.3s linear infinite;
}

.shy.walking .motion {
  animation: none;
}

/* ---------- Seitenansicht: Trab ---------- */
.leg {
  transform-origin: 62px 128px;
}

.leg.fore {
  transform-origin: 138px 128px;
}

.shin {
  transform-origin: 62px 152px;
}

.fore .shin {
  transform-origin: 138px 152px;
}

.walking .leg {
  animation: stride 0.56s ease-in-out infinite;
}

.walking .leg.phase-b {
  animation-delay: -0.28s;
}

.walking .shin {
  animation: knee 0.56s ease-in-out infinite;
}

.walking .leg.phase-b .shin {
  animation-delay: -0.28s;
}

.pose-side .rig {
  transform-origin: 96px 190px;
  transition: rotate 0.5s ease;
}

.walking.pose-side .rig {
  animation: bob 0.28s ease-in-out infinite;
}

.pose-side .s-head {
  transform-origin: 122px 108px;
  transition: translate 0.5s ease, rotate 0.5s ease;
}

.walking.pose-side .s-head {
  animation: head-bob 0.56s ease-in-out infinite;
}

.pose-side:not(.walking):not(.act-sniff):not(.act-bow) .s-head {
  animation: head-sway 7s ease-in-out infinite;
}

.shy.pose-side .s-head {
  translate: -4px 8px;
  rotate: 8deg;
}

/* Schnüffeln: Kopf runter, Nase zuckt, Rute wedelt */
.act-sniff .s-head {
  translate: -2px 26px;
  rotate: 38deg;
  animation: sniff 0.7s ease-in-out 0.5s infinite alternate;
}

/* Spielverbeugung: Vorderkörper runter, Hinterteil hoch */
.act-bow .rig {
  rotate: 11deg;
  transform-origin: 56px 184px;
}

.act-bow .leg.fore {
  scale: 1 0.78;
  translate: 0 -2px;
}

.act-bow .s-head {
  rotate: -8deg;
  animation: bow-bounce 0.55s ease-in-out infinite alternate;
}

/* ---------- Rückansicht: Trab vom Betrachter weg ---------- */
.pose-back.walking .motion {
  animation: sway 0.56s ease-in-out infinite alternate;
}

.pose-back.walking .head {
  animation: head-bob 0.56s ease-in-out infinite;
}

.walking .paw-a {
  animation: step 0.28s ease-in-out infinite alternate;
}

.walking .paw-b {
  animation: step 0.28s ease-in-out infinite alternate-reverse;
}

.zzz {
  opacity: 0;
  animation: zzz 3.2s ease-in-out infinite;
}

.z2 {
  animation-delay: 0.8s;
}

.z3 {
  animation-delay: 1.6s;
}

/* ---------- Keyframes ---------- */
@keyframes breathe {
  0%,
  100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.015, 1.035);
  }
}

@keyframes breathe-slow {
  0%,
  100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.02, 1.06);
  }
}

@keyframes head-sway {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  30% {
    transform: rotate(-2.5deg) translateY(-1px);
  }
  62% {
    transform: rotate(2deg) translateY(0.5px);
  }
}

@keyframes blink {
  0%,
  93%,
  100% {
    transform: scaleY(1);
  }
  96% {
    transform: scaleY(0.08);
  }
}

@keyframes wag {
  from {
    transform: rotate(-12deg);
  }
  to {
    transform: rotate(14deg);
  }
}

@keyframes wag-tip {
  from {
    transform: rotate(-16deg);
  }
  to {
    transform: rotate(20deg);
  }
}

@keyframes ear-flick {
  0%,
  72%,
  100% {
    transform: rotate(0deg);
  }
  78% {
    transform: rotate(-12deg);
  }
  84% {
    transform: rotate(3deg);
  }
  90% {
    transform: rotate(-6deg);
  }
}

@keyframes ear-flick-r {
  0%,
  64%,
  100% {
    transform: rotate(0deg);
  }
  70% {
    transform: rotate(10deg);
  }
  76% {
    transform: rotate(-2deg);
  }
}

@keyframes ear-flick-side {
  0%,
  72%,
  100% {
    transform: rotate(0deg);
  }
  78% {
    transform: rotate(-10deg);
  }
  86% {
    transform: rotate(4deg);
  }
}

@keyframes ear-perk {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25%,
  75% {
    transform: rotate(-16deg) translateY(-4px);
  }
}

@keyframes ear-shake {
  from {
    transform: rotate(-26deg);
  }
  to {
    transform: rotate(26deg);
  }
}

@keyframes ear-fly {
  0%,
  100% {
    transform: rotate(0deg);
  }
  40% {
    transform: rotate(-22deg) translateY(-3px);
  }
  70% {
    transform: rotate(10deg);
  }
}

@keyframes tilt {
  0%,
  100% {
    transform: rotate(0deg) translateX(0);
  }
  22%,
  78% {
    transform: rotate(-13deg) translateX(-2px);
  }
}

@keyframes yawn-head {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  25%,
  70% {
    transform: rotate(-5deg) translateY(-3px);
  }
}

@keyframes yawn-mouth {
  0%,
  100% {
    transform: scale(0.15, 0.05);
    opacity: 0;
  }
  25%,
  70% {
    transform: scale(1, 1);
    opacity: 1;
  }
}

@keyframes sleep-nod {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(3deg) translateY(1.5px);
  }
}

@keyframes shake {
  from {
    transform: rotate(-5deg) skewX(-3deg);
  }
  to {
    transform: rotate(5deg) skewX(3deg);
  }
}

@keyframes shake-head {
  from {
    transform: rotate(-9deg);
  }
  to {
    transform: rotate(9deg);
  }
}

@keyframes spin {
  0% {
    transform: scaleX(1) translateY(0);
  }
  20% {
    transform: scaleX(0.05) translateY(-6px);
  }
  40% {
    transform: scaleX(-1) translateY(-10px);
  }
  60% {
    transform: scaleX(0.05) translateY(-6px);
  }
  80%,
  100% {
    transform: scaleX(1) translateY(0);
  }
}

/* Freudensprung mit Ausholen, Strecken und weichem Landen */
@keyframes jump {
  0% {
    transform: translateY(0) scale(1, 1);
  }
  18% {
    transform: translateY(0) scale(1.08, 0.88);
  }
  45% {
    transform: translateY(-24px) scale(0.94, 1.1);
  }
  72% {
    transform: translateY(0) scale(1.06, 0.92);
  }
  86% {
    transform: translateY(0) scale(0.99, 1.02);
  }
  100% {
    transform: translateY(0) scale(1, 1);
  }
}

@keyframes hop {
  from {
    transform: translateY(0) scale(1.03, 0.97);
  }
  to {
    transform: translateY(-9px) scale(0.98, 1.03);
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

@keyframes pant {
  from {
    transform: scaleY(0.9);
  }
  to {
    transform: scaleY(1.08);
  }
}

@keyframes nose-twitch {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.18, 0.9);
  }
}

@keyframes stride {
  0%,
  100% {
    transform: rotate(26deg);
  }
  50% {
    transform: rotate(-26deg);
  }
}

@keyframes knee {
  0%,
  45% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(-46deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes head-bob {
  0%,
  100% {
    transform: rotate(-2deg) translateY(0);
  }
  50% {
    transform: rotate(2deg) translateY(1px);
  }
}

@keyframes sniff {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-5deg) translateY(1px);
  }
}

@keyframes bow-bounce {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-5deg) translateY(2px);
  }
}

@keyframes sway {
  from {
    transform: rotate(-2.5deg) translateY(0);
  }
  to {
    transform: rotate(2.5deg) translateY(-3px);
  }
}

@keyframes step {
  from {
    transform: translateY(-7px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes zzz {
  0% {
    opacity: 0;
    transform: translate(0, 8px);
  }
  30%,
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(6px, -12px);
  }
}

/* Wer Bewegung nicht mag, bekommt einen ruhigen Hund. */
@media (prefers-reduced-motion: reduce) {
  .galip :is(g, path, ellipse, circle) {
    animation: none !important;
  }
}
</style>
