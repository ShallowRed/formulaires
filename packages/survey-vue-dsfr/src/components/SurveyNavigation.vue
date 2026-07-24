<script lang="ts" setup>
import type { DsfrButtonProps } from '@gouvminint/vue-dsfr'
import { DsfrButton } from '@gouvminint/vue-dsfr'

defineProps<{
  buttons: Array<DsfrButtonProps & { 'data-testid'?: string }>
}>()
</script>

<template>
  <ul
    class="sk-survey-btns fr-btns-group fr-btns-group--lg fr-mt-4w"
    :class="{
      [`sk-survey-btns--length-${buttons.length}`]: true,
    }"
  >
    <li
      v-for="(button, index) in buttons"
      :key="index"
      class="sk-survey-btn"
    >
      <DsfrButton
        v-bind="button"
        size="lg"
      />
    </li>
  </ul>
</template>

<style scoped>
.sk-survey-btns {
  justify-content: flex-end;
}

.sk-survey-btn {
  flex: 1;
}

@media (min-width: 48em) {
  .sk-survey-btns--length-1 .sk-survey-btn {
    max-width: 50%;
  }
}
</style>
