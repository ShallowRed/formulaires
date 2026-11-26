<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useEmbedded } from './embedded'
import { sections } from './sections'

const route = useRoute()
const isEmbedded = useEmbedded()

const navItems = [
  { to: '/', text: 'Accueil' },
  ...sections.map(section => ({ to: section.to, text: section.title })),
]

function isCurrent(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)
}
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
    <div class="fr-header__menu">
      <div class="fr-container demo-container">
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
                :aria-current="isCurrent(item.to) ? 'page' : undefined"
              >
                {{ item.text }}
              </RouterLink>
            </li>
          </ul>
        </nav>
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
