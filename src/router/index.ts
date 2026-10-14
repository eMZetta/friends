import { createRouter, createWebHashHistory } from 'vue-router'

import AlbumView from '@/views/AlbumView.vue'
import HomeView from '@/views/HomeView.vue'
import ShapesGame from '@/views/games/ShapesGame.vue'
import CountGame from '@/views/games/CountGame.vue'
import BalloonsGame from '@/views/games/BalloonsGame.vue'
import AnimalsGame from '@/views/games/AnimalsGame.vue'
import MemoryGame from '@/views/games/MemoryGame.vue'
import PatternsGame from '@/views/games/PatternsGame.vue'
import XylophoneGame from '@/views/games/XylophoneGame.vue'

// Hash history works without server rewrites, which keeps the Capacitor shell simple.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/album', name: 'album', component: AlbumView },
    { path: '/play/shapes', name: 'shapes', component: ShapesGame },
    { path: '/play/count', name: 'count', component: CountGame },
    { path: '/play/balloons', name: 'balloons', component: BalloonsGame },
    { path: '/play/animals', name: 'animals', component: AnimalsGame },
    { path: '/play/memory', name: 'memory', component: MemoryGame },
    { path: '/play/patterns', name: 'patterns', component: PatternsGame },
    { path: '/play/music', name: 'music', component: XylophoneGame },
  ],
})

export default router
