import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import SectionLayout from './components/SectionLayout.vue'
import HomePage from './pages/HomePage.vue'
import InstallPage from './pages/integrate/InstallPage.vue'
import IntegrationExamplePage from './pages/integrate/IntegrationExamplePage.vue'
import AssemblyPage from './pages/assemble/AssemblyPage.vue'
import MinimalExamplePage from './pages/assemble/MinimalExamplePage.vue'
import OverviewPage from './pages/assemble/OverviewPage.vue'
import SimulatorPage from './pages/assemble/SimulatorPage.vue'
import EditorPage from './pages/write/EditorPage.vue'
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
        { path: '', component: InstallPage },
        { path: ':slug', component: IntegrationExamplePage },
      ],
    },
    {
      path: '/ecrire',
      component: SectionLayout,
      props: { section: write },
      children: [{ path: '', component: EditorPage }],
    },
    {
      path: '/assembler',
      component: SectionLayout,
      props: { section: assemble },
      children: [
        { path: '', component: OverviewPage },
        { path: 'exemple-minimal', component: MinimalExamplePage },
        { path: 'aides-innovation', component: SimulatorPage },
        { path: 'code', component: AssemblyPage },
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
