<script lang="ts" setup>
import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import { rankWith, uiTypeIs } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import formSchema from '@shallowred/form-entreprise-innovation'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { compileV3ToJsonForms, migrateV2ToV3, visibleAnswers } from '@shallowred/survey-schema'
import { computed, provide, ref } from 'vue'
import EligibilityResults from '../../components/EligibilityResults.vue'
import EligibilityResultsRenderer from '../../components/EligibilityResultsRenderer.vue'

const { questionnaire, dataSchema } = migrateV2ToV3(formSchema)
const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)
provide('questionnaire', questionnaire)

// The application shows the engine results by registering its own renderer for the results pages
const renderers = Object.freeze([
  ...dsfrRenderers,
  { renderer: EligibilityResultsRenderer, tester: rankWith(5, uiTypeIs('IntermediaryResults')) },
]) as JsonFormsRendererRegistryEntry[]
const ajv = createAjv2020()

const answers = ref<Record<string, unknown>>({})
const completed = ref(false)

const finalResults = computed(() => calculateEligibility(rules, formSchema, visibleAnswers(questionnaire, answers.value)))
</script>

<template>
  <div @categorization-complete="completed = true">
    <h1 class="fr-h3">
      Aides à l'innovation pour les entreprises
    </h1>
    <p class="fr-mb-3w">
      Le questionnaire du simulateur d'aides à l'innovation, avec ses 78 questions et ses 65 conditions, converti du format v2 par <code>migrateV2ToV3</code> puis compilé pour JSON Forms par <code>compileV3ToJsonForms</code>.
    </p>
    <JsonForms
      v-if="!completed"
      :data="answers"
      :schema="schema"
      :uischema="uischema"
      :renderers="renderers"
      :ajv="ajv"
      :i18n="dsfrI18n"
      validation-mode="ValidateAndHide"
      @change="event => answers = event.data"
    />
    <EligibilityResults
      v-else
      :results="finalResults"
      with-montants
    />
  </div>
</template>
