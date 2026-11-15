<script setup lang="ts">
import AnimalIcon from '@/components/AnimalIcon.vue'
import CountItem from '@/components/CountItem.vue'
import ShapeIcon from '@/components/ShapeIcon.vue'
import { COLORS } from '@/lib/colors'

// Kleine Vorschaubilder für die Spiel-Kacheln und die vier Welten auf der Startseite.
// Die Größe richtet sich nach --tile des umgebenden Elements.
defineProps<{ kind: string }>()
</script>

<template>
  <div class="art">
    <template v-if="kind === 'shapes' || kind === 'world-think'">
      <div class="mini"><ShapeIcon kind="star" :color="COLORS.yellow" /></div>
      <div class="mini"><ShapeIcon kind="circle" :color="COLORS.blue" /></div>
      <div class="mini"><ShapeIcon kind="triangle" :color="COLORS.red" /></div>
    </template>
    <template v-else-if="kind === 'count'">
      <div v-for="n in 3" :key="n" class="mini numbered">
        <CountItem kind="apple" />
        <b>{{ n }}</b>
      </div>
    </template>
    <template v-else-if="kind === 'world-numbers'">
      <div v-for="n in 2" :key="n" class="mini numbered">
        <CountItem kind="apple" />
        <b>{{ n }}</b>
      </div>
      <div class="mini letter">A</div>
    </template>
    <template v-else-if="kind === 'animals' || kind === 'world-animals'">
      <div class="mini"><AnimalIcon kind="cow" /></div>
      <div class="mini"><AnimalIcon kind="cat" /></div>
      <div class="mini"><AnimalIcon :kind="kind === 'animals' ? 'duck' : 'pig'" /></div>
    </template>
    <template v-else-if="kind === 'memory'">
      <div class="mini card-back" />
      <div class="mini card-front"><AnimalIcon kind="pig" /></div>
      <div class="mini card-front"><AnimalIcon kind="pig" /></div>
    </template>
    <template v-else-if="kind === 'patterns'">
      <div class="mini small"><ShapeIcon kind="circle" :color="COLORS.red" /></div>
      <div class="mini small"><ShapeIcon kind="square" :color="COLORS.blue" /></div>
      <div class="mini small"><ShapeIcon kind="circle" :color="COLORS.red" /></div>
      <div class="mini small question">?</div>
    </template>
    <template v-else-if="kind === 'music'">
      <svg viewBox="0 0 100 70" class="wide-art" aria-hidden="true">
        <rect
          v-for="(c, i) in ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const"
          :key="c"
          :x="4 + i * 16"
          :y="4 + i * 3"
          width="13"
          :height="62 - i * 6"
          rx="4"
          :fill="COLORS[c]"
        />
      </svg>
    </template>
    <template v-else-if="kind === 'shadows'">
      <div class="mini shadow-art"><AnimalIcon kind="cat" /></div>
      <div class="mini"><AnimalIcon kind="cat" /></div>
    </template>
    <template v-else-if="kind === 'sizes'">
      <div class="mini tall"><AnimalIcon kind="pig" /></div>
      <div class="mini tiny"><AnimalIcon kind="pig" /></div>
    </template>
    <template v-else-if="kind === 'letters'">
      <div class="mini"><AnimalIcon kind="cow" /></div>
      <div class="mini letter">K</div>
    </template>
    <template v-else-if="kind === 'paint'">
      <svg viewBox="0 0 100 70" class="wide-art" aria-hidden="true">
        <path d="M8 50 Q28 8 48 40 T92 22" :stroke="COLORS.red" stroke-width="10" fill="none" stroke-linecap="round" />
        <path d="M12 62 Q40 36 62 58 T92 48" :stroke="COLORS.blue" stroke-width="10" fill="none" stroke-linecap="round" />
      </svg>
    </template>
    <template v-else>
      <svg v-for="c in ['red', 'blue', 'green'] as const" :key="c" viewBox="0 0 60 100" class="mini balloon">
        <path d="M30 70 Q24 85 32 98" stroke="#7a8796" stroke-width="2" fill="none" />
        <ellipse cx="30" cy="36" rx="26" ry="32" :fill="COLORS[c]" />
        <path d="M26 66 L34 66 L30 72 Z" :fill="COLORS[c]" />
        <ellipse cx="20" cy="24" rx="5" ry="9" fill="rgba(255,255,255,0.5)" />
      </svg>
    </template>
  </div>
</template>

<style scoped>
.art {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.mini {
  width: 30%;
  aspect-ratio: 1;
  position: relative;
}

.wide-art {
  width: 80%;
}

.mini.letter {
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #fff;
  font-size: calc(var(--tile) * 0.17);
  font-weight: 800;
  color: #ff5a5f;
}

.mini.tall {
  width: 42%;
}

.mini.tiny {
  width: 24%;
}

.shadow-art :deep(svg) {
  filter: brightness(0) opacity(0.7);
}

.mini.small {
  width: 21%;
}

.card-back,
.card-front {
  border-radius: 10px;
  border: 3px solid #fff;
}

.card-back {
  background: linear-gradient(135deg, #8e7cf0 0%, #5b4bc4 100%);
}

.card-front {
  background: #fff;
  padding: 2px;
}

.question {
  display: grid;
  place-items: center;
  border: 3px dashed #c98a5a;
  border-radius: 10px;
  font-weight: 800;
  font-size: calc(var(--tile) * 0.12);
  color: #c98a5a;
}

.mini.balloon {
  aspect-ratio: 3 / 5;
  height: auto;
}

.numbered b {
  position: absolute;
  right: -4px;
  bottom: -6px;
  width: calc(var(--tile) * 0.15);
  height: calc(var(--tile) * 0.15);
  border-radius: 50%;
  background: #fff;
  font-size: calc(var(--tile) * 0.09);
  display: grid;
  place-items: center;
}
</style>
