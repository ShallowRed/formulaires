<script lang="ts" setup>
import type { SurveyQuestionData } from '@shallowred/formulaires-schema'

defineProps<{
  question: SurveyQuestionData
}>()
</script>

<template>
  <p class="fr-error-text">
    Type de question non pris en charge : {{ question.type }}
  </p>
</template>
