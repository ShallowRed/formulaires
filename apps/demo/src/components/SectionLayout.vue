<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEmbedded } from '../embedded'

const props = defineProps<{
  id: string
  title: string
  items: { to: string, text: string }[]
}>()

const route = useRoute()
const isEmbedded = useEmbedded()
const menuItems = computed(() => props.items.map(item => ({ ...item, active: route.path === item.to })))
</script>

<template>
  <RouterView v-if="isEmbedded" />
  <div
    v-else
    class="fr-grid-row fr-grid-row--gutters"
  >
    <div class="fr-col-12 fr-col-md-3">
      <DsfrSideMenu
        :id="`${id}-menu`"
        :side-menu-list-id="`${id}-menu-list`"
        :collapse-value="`${id}-menu-collapse`"
        :heading-title="title"
        button-label="Dans cette rubrique"
        :menu-items="menuItems"
      />
    </div>
    <div class="fr-col-12 fr-col-md-9">
      <RouterView />
    </div>
  </div>
</template>
