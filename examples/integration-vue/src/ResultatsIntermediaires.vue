<script lang="ts" setup>
import type { UISchemaElement } from '@jsonforms/core'
import type { EligibilityResults } from '@shallowred/formulaires-publicodes'
import { rendererProps, useJsonForms } from '@jsonforms/vue'
import { computed, inject } from 'vue'
import ResultatsSimulation from './ResultatsSimulation.vue'

defineProps(rendererProps<UISchemaElement>())
const jsonforms = useJsonForms()
const eligibilityOf = inject<(answers: Record<string, unknown>) => EligibilityResults>('eligibilityOf')!

const results = computed(() => eligibilityOf((jsonforms.core?.data ?? {}) as Record<string, unknown>))
</script>

<template>
  <ResultatsSimulation :results="results" />
</template>
