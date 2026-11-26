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

createApp(App)
  .use(router)
  .use(VueDsfr)
  .mount('#app')
