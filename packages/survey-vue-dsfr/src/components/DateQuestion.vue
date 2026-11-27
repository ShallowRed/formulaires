<script lang="ts" setup>
import type { SurveyQuestionData } from '@shallowred/formulaires-schema'
import { DsfrInputGroup } from '@gouvminint/vue-dsfr'

defineProps<{
  question: SurveyQuestionData
}>()

const model = defineModel<string | undefined>()
</script>

<template>
  <DsfrInputGroup
    v-model="model"
    type="date"
    :name="question.id"
    :label="question.title"
    :label-visible="false"
    :hint="question.description"
  />
</template>

<style scoped>
.fr-input-group {
  margin-bottom: 2.5rem;
}
</style>
