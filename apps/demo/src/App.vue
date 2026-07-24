<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isEmbedded = computed(() => route.query.embed !== undefined)

const navItems = [
  { to: '/', text: 'Accueil' },
  { to: '/simulateur', text: 'Simulateur complet' },
  { to: '/exemple-minimal', text: 'Exemple minimal' },
  { to: '/assemblage', text: 'L\'assemblage' },
]
</script>

<template>
  <header
    v-if="!isEmbedded"
    role="banner"
    class="fr-header"
  >
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  République<br>Française
                </p>
              </div>
            </div>
            <div class="fr-header__service">
              <RouterLink to="/">
                <p class="fr-header__service-title">
                  Simulateur d'aides à l'innovation
                </p>
              </RouterLink>
              <p class="fr-header__service-tagline">
                Démonstration : les briques ouvertes d'aides-simplifiées, réassemblées
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-header__menu">
      <div class="fr-container">
        <nav
          class="fr-nav"
          role="navigation"
          aria-label="Menu principal"
        >
          <ul class="fr-nav__list">
            <li
              v-for="item in navItems"
              :key="item.to"
              class="fr-nav__item"
            >
              <RouterLink
                class="fr-nav__link"
                :to="item.to"
                :aria-current="route.path === item.to ? 'page' : undefined"
              >
                {{ item.text }}
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>

  <main class="fr-container fr-py-4w">
    <RouterView />
  </main>

  <footer
    v-if="!isEmbedded"
    class="fr-footer fr-mt-8w"
    role="contentinfo"
  >
    <div class="fr-container">
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
            Démonstration technique, sans valeur d'engagement : les montants affichés
            sont calculés par le modèle publicodes ouvert, dans le navigateur.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
