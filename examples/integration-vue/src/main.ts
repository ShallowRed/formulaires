import { createApp } from 'vue'
import App from './App.vue'

// Etape 2 du guide d'integration : les feuilles de style DSFR, une fois
import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'

createApp(App).mount('#app')
