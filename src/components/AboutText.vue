<script setup lang="ts">
import { IMPRINT } from '@/lib/about'
import { useT } from '@/lib/i18n'

const t = useT()
const address = [IMPRINT.name, IMPRINT.address, IMPRINT.country].filter(Boolean)
</script>

<template>
  <div class="about-text">
    <h2>{{ t.about.title }}</h2>
    <template v-for="s in t.about.sections" :key="s.heading">
      <h3>{{ s.heading }}</h3>
      <p v-for="p in s.paragraphs" :key="p">{{ p }}</p>
    </template>
    <h3>{{ t.about.imprint }}</h3>
    <p>
      <template v-for="line in address" :key="line">{{ line }}<br /></template>
      {{ IMPRINT.email }}
    </p>
  </div>
</template>

<style scoped>
.about-text {
  text-align: left;
  font-size: 16px;
  line-height: 1.45;
}

h2 {
  margin: 0 0 8px;
  font-size: 26px;
  text-align: center;
}

h3 {
  margin: 18px 0 4px;
  font-size: 18px;
}

p {
  margin: 4px 0;
}
</style>
