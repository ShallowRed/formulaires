<script setup lang="ts">
import type { UISchemaElement } from '@jsonforms/core'
import type { SurveySchemaV3 } from '@shallowred/survey-schema'
import formSchema from '@shallowred/form-entreprise-innovation'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { visibleAnswers } from '@shallowred/survey-schema'
import { rendererProps, useJsonForms } from '@jsonforms/vue'
import { computed, inject } from 'vue'
import EligibilityResults from './EligibilityResults.vue'

defineProps(rendererProps<UISchemaElement>())
const jsonforms = useJsonForms()
const questionnaire = inject<SurveySchemaV3>('questionnaire')!

const results = computed(() => {
  const answers = (jsonforms.core?.data ?? {}) as Record<string, unknown>
  return calculateEligibility(rules, formSchema, visibleAnswers(questionnaire, answers))
})
</script>

<template>
  <EligibilityResults :results="results" />
</template>
