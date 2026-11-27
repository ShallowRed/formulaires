<script lang="ts" setup>
import { FocusTrap } from 'focus-trap-vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavigation from './components/SiteNavigation.vue'
import { useEmbedded } from './embedded'

const route = useRoute()
const isEmbedded = useEmbedded()

// Below the large breakpoint, the DSFR shows the navigation in a modal opened by the menu button
const menuOpen = ref(false)
const closeButton = ref<HTMLButtonElement>()
watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header
    v-if="!isEmbedded"
    role="banner"
    class="fr-header"
  >
    <div class="fr-header__body">
      <div class="fr-container demo-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République<br>Française
                </p>
              </div>
              <div class="fr-header__navbar">
                <button
                  id="demo-menu-button"
                  class="fr-btn--menu fr-btn"
                  type="button"
                  aria-controls="demo-menu"
                  aria-haspopup="dialog"
                  :data-fr-opened="menuOpen"
                  title="Menu"
                  @click="menuOpen = true"
                >
                  Menu
                </button>
              </div>
            </div>
            <div class="fr-header__service">
              <RouterLink to="/">
                <p class="fr-header__service-title">
                  survey-kit
                  <span class="fr-badge fr-badge--sm fr-badge--green-emeraude">Démo</span>
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Format de formulaire et composants DSFR pour JSON Forms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- A modal rendered open is visible at once, as focus-trap requires when it activates;
    toggling the DSFR class would keep it hidden during its transition -->
    <FocusTrap
      v-if="menuOpen"
      active
      :initial-focus="() => closeButton!"
      @update:active="menuOpen = $event"
    >
      <div
        id="demo-menu"
        class="fr-header__menu fr-modal fr-modal--opened"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-menu-button"
      >
        <div class="fr-container demo-container">
          <button
            ref="closeButton"
            class="fr-btn--close fr-btn"
            type="button"
            aria-controls="demo-menu"
            title="Fermer"
            @click="menuOpen = false"
          >
            Fermer
          </button>
          <SiteNavigation />
        </div>
      </div>
    </FocusTrap>
    <div
      v-else
      id="demo-menu"
      class="fr-header__menu fr-modal"
    >
      <div class="fr-container demo-container">
        <SiteNavigation />
      </div>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer
    v-if="!isEmbedded"
    class="fr-footer fr-mt-8w"
    role="contentinfo"
  >
    <div class="fr-container demo-container">
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item">
            <a
              class="fr-footer__bottom-link"
              href="https://github.com/ShallowRed/survey-kit"
              target="_blank"
              rel="noopener"
            >Code source (survey-kit)</a>
          </li>
          <li class="fr-footer__bottom-item">
            <a
              class="fr-footer__bottom-link"
              href="https://github.com/betagouv/publicodes-entreprise-innovation"
              target="_blank"
              rel="noopener"
            >Modèle publicodes</a>
          </li>
          <li class="fr-footer__bottom-item">
            <a
              class="fr-footer__bottom-link"
              href="https://github.com/betagouv/aides-simplifiees-app"
              target="_blank"
              rel="noopener"
            >aides-simplifiées</a>
          </li>
        </ul>
        <div class="fr-footer__bottom-copy">
          <p>
            Démonstration sans valeur d'engagement. Formulaires et calculs s'exécutent
            dans le navigateur.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
