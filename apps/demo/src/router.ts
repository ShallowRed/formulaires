import { createRouter, createWebHashHistory } from 'vue-router'
import AssemblagePage from './pages/AssemblagePage.vue'
import ExempleMinimalPage from './pages/ExempleMinimalPage.vue'
import HomePage from './pages/HomePage.vue'
import SimulateurPage from './pages/SimulateurPage.vue'

export const router = createRouter({
  // Hash routing: no server-side fallback needed on static hosting
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/simulateur', component: SimulateurPage },
    { path: '/exemple-minimal', component: ExempleMinimalPage },
    { path: '/assemblage', component: AssemblagePage },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
