<script setup lang="ts">
import type { UISchemaElement } from '@jsonforms/core'
import type { EligibilityResults as EligibilityResultsData } from '@shallowred/survey-publicodes'
import { rendererProps, useJsonForms } from '@jsonforms/vue'
import { computed, inject } from 'vue'
import EligibilityResults from './EligibilityResults.vue'

defineProps(rendererProps<UISchemaElement>())
const jsonforms = useJsonForms()
const eligibilityOf = inject<(answers: Record<string, unknown>) => EligibilityResultsData>('eligibilityOf')!

const results = computed(() => eligibilityOf((jsonforms.core?.data ?? {}) as Record<string, unknown>))
</script>

<template>
  <EligibilityResults :results="results" />
</template>
