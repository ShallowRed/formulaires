import type { RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import SectionLayout from './components/SectionLayout.vue'
import { integrationExamples } from './examples/integration'
import HomePage from './pages/HomePage.vue'
import InstallPage from './pages/integrate/InstallPage.vue'
import IntegrationExamplePage from './pages/integrate/IntegrationExamplePage.vue'
import AssemblyPage from './pages/assemble/AssemblyPage.vue'
import MinimalExamplePage from './pages/assemble/MinimalExamplePage.vue'
import OverviewPage from './pages/assemble/OverviewPage.vue'
import SimulatorPage from './pages/assemble/SimulatorPage.vue'
import EditorPage from './pages/write/EditorPage.vue'
import InnovationQuestionnairePage from './pages/write/InnovationQuestionnairePage.vue'

export const sections = [
  {
    id: 'integrer',
    title: 'Intégrer un formulaire',
    items: [
      { to: '/integrer', text: 'Installer' },
      ...integrationExamples.map(example => ({ to: `/integrer/${example.slug}`, text: example.title })),
    ],
  },
  {
    id: 'ecrire',
    title: 'Écrire un questionnaire',
    items: [
      { to: '/ecrire', text: 'Les deux documents' },
      { to: '/ecrire/aides-innovation', text: 'Aides à l\'innovation' },
    ],
  },
  {
    id: 'assembler',
    title: 'Assembler un simulateur',
    items: [
      { to: '/assembler', text: 'Les trois briques' },
      { to: '/assembler/exemple-minimal', text: 'Exemple minimal' },
      { to: '/assembler/aides-innovation', text: 'Aides à l\'innovation' },
      { to: '/assembler/code', text: 'Le code de l\'assemblage' },
    ],
  },
]

const [integrate, write, assemble] = sections

// Addresses published before the sections, kept for the iframes that use them
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
      props: integrate,
      children: [
        { path: '', component: InstallPage },
        { path: ':slug', component: IntegrationExamplePage },
      ],
    },
    {
      path: '/ecrire',
      component: SectionLayout,
      props: write,
      children: [
        { path: '', component: EditorPage },
        { path: 'aides-innovation', component: InnovationQuestionnairePage },
      ],
    },
    {
      path: '/assembler',
      component: SectionLayout,
      props: assemble,
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
    { path: '/questionnaire-v3', redirect: moved('/ecrire/aides-innovation') },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
