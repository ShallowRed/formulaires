<script lang="ts" setup>
import BrandWaves from './BrandWaves.vue'

defineProps<{
  title: string
  lead?: string
}>()
</script>

<!-- Header band of the DSFR site of algos.data.gouv.fr (UiPageHeader.vue) -->
<template>
  <div class="page-header fr-background-alt--blue-france">
    <BrandWaves class="page-header-waves" />
    <div class="page-header-content fr-container demo-container fr-py-6w">
      <h1 :class="{ 'fr-mb-0': !lead }">
        {{ title }}
      </h1>
      <p
        v-if="lead"
        class="fr-text--lead fr-mb-0"
      >
        {{ lead }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  position: relative;
}

.page-header-waves {
  opacity: 0.8;
  mix-blend-mode: darken;
}

.page-header-content {
  position: relative;
}
</style>
