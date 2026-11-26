<script lang="ts" setup>
import type { Section } from '../sections'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEmbedded } from '../embedded'
import PageHeader from './PageHeader.vue'

const props = defineProps<{
  section: Section
}>()

const route = useRoute()
const isEmbedded = useEmbedded()
const menuId = computed(() => props.section.to.slice(1))
const menuItems = computed(() => props.section.pages.map(page => ({ ...page, active: route.path === page.to })))
</script>

<template>
  <div
    v-if="isEmbedded"
    class="fr-container demo-container fr-py-4w"
  >
    <RouterView />
  </div>
  <template v-else>
    <PageHeader
      :title="section.title"
      :lead="section.description"
    />
    <div
      class="fr-container demo-container fr-py-4w"
      :class="{ 'section-layout': menuItems.length > 0 }"
    >
      <div
        v-if="menuItems.length > 0"
        class="section-layout__menu"
      >
        <DsfrSideMenu
          :id="`${menuId}-menu`"
          :side-menu-list-id="`${menuId}-menu-list`"
          :collapse-value="`${menuId}-menu-collapse`"
          button-label="Dans cette rubrique"
          :menu-items="menuItems"
        />
      </div>
      <div class="section-layout__content">
        <RouterView />
      </div>
    </div>
  </template>
</template>

<style scoped>
/* A fixed menu width leaves the rest of the wide container to the examples, which DSFR columns would split in twelfths */
.section-layout__menu {
  margin-bottom: 1.5rem;
}

@media (min-width: 48em) {
  .section-layout__menu {
    margin-bottom: 0;
  }

  .section-layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    column-gap: 2.5rem;
  }
}

.section-layout__content {
  min-width: 0;
}
</style>
