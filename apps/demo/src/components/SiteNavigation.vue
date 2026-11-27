<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { sections } from '../sections'

const route = useRoute()

const navItems = [
  { to: '/', text: 'Accueil' },
  ...sections.map(section => ({ to: section.to, text: section.title })),
]

function isCurrent(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
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
</template>
