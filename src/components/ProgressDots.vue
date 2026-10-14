<script setup lang="ts">
defineProps<{ total: number; done: number; color: string }>()
</script>

<template>
  <div class="progress" :style="{ '--c': color }">
    <span v-for="i in total" :key="i" class="dot" :class="{ full: i <= done }" />
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  gap: 12px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
}

.dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 4px solid var(--c);
  background: #fff;
  transition: background 0.2s;
}

.dot.full {
  background: var(--c);
  animation: pulse 0.35s;
}

@keyframes pulse {
  50% {
    transform: scale(1.3);
  }
}
</style>
