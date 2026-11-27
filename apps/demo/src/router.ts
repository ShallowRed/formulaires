import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import SectionLayout from './components/SectionLayout.vue'
import HomePage from './pages/HomePage.vue'
import { sections } from './sections'

const [integrate, write, assemble] = sections

// Addresses published earlier, kept for the iframes that use them
function moved(path: string) {
  return (to: RouteLocationNormalized) => ({ path, query: to.query })
}

export const router = createRouter({
  // Hash routing: no server-side fallback needed on static hosting
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    {
      path: '/integrer',
      component: SectionLayout,
      props: { section: integrate },
      children: [
        { path: '', component: () => import('./pages/integrate/InstallPage.vue') },
        { path: ':slug', component: () => import('./pages/integrate/IntegrationExamplePage.vue') },
      ],
    },
    {
      path: '/ecrire',
      component: SectionLayout,
      props: { section: write },
      children: [{ path: '', component: () => import('./pages/write/EditorPage.vue') }],
    },
    {
      path: '/assembler',
      component: SectionLayout,
      props: { section: assemble },
      children: [
        { path: '', component: () => import('./pages/assemble/OverviewPage.vue') },
        { path: 'exemple-minimal', component: () => import('./pages/assemble/MinimalExamplePage.vue') },
        { path: 'aides-innovation', component: () => import('./pages/assemble/SimulatorPage.vue') },
        { path: 'code', component: () => import('./pages/assemble/AssemblyPage.vue') },
      ],
    },
    { path: '/simulateur', redirect: moved('/assembler/aides-innovation') },
    { path: '/exemple-minimal', redirect: moved('/assembler/exemple-minimal') },
    { path: '/assemblage', redirect: moved('/assembler/code') },
    { path: '/questionnaire-v3', redirect: moved('/assembler/aides-innovation') },
    { path: '/ecrire/aides-innovation', redirect: moved('/assembler/aides-innovation') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
