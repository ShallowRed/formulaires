import VueDsfr from '@gouvminint/vue-dsfr'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'

import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvfr/dsfr/dist/scheme/scheme.min.css'
import '@gouvminint/vue-dsfr/styles'
import './styles.css'

// GitHub Pages serves the chunks of the latest build only: a page loaded from an earlier build reloads
window.addEventListener('vite:preloadError', () => window.location.reload())

createApp(App)
  .use(router)
  .use(VueDsfr)
  .mount('#app')
