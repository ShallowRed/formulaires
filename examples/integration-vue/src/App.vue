<script lang="ts" setup>
import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import type { EligibilityResults } from '@shallowred/survey-publicodes'
import { rankWith, uiTypeIs } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import formSchema from '@shallowred/form-entreprise-innovation'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibilityV3 } from '@shallowred/survey-publicodes'
import { compileV3ToJsonForms, migrateV2ToV3, visibleAnswers } from '@shallowred/survey-schema'
import { computed, provide, ref } from 'vue'
import ResultatsIntermediaires from './ResultatsIntermediaires.vue'
import ResultatsSimulation from './ResultatsSimulation.vue'

const { questionnaire, dataSchema } = migrateV2ToV3(formSchema)
const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)

function eligibilityOf(answers: Record<string, unknown>): EligibilityResults {
  return calculateEligibilityV3(rules, dataSchema, visibleAnswers(questionnaire, answers), formSchema.dispositifs)
}
provide('eligibilityOf', eligibilityOf)

// The intermediary results page of the form shows the engine results through a renderer of higher rank
const renderers = Object.freeze([
  ...dsfrRenderers,
  { renderer: ResultatsIntermediaires, tester: rankWith(5, uiTypeIs('IntermediaryResults')) },
]) as JsonFormsRendererRegistryEntry[]
const ajv = createAjv2020()

const answers = ref<Record<string, unknown>>({})
const completed = ref(false)
const results = computed(() => eligibilityOf(answers.value))

function restart() {
  answers.value = {}
  completed.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="fr-container">
      <strong>Mon site existant</strong>, espace aides aux entreprises
    </div>
  </header>

  <main
    class="fr-container fr-py-4w"
    @categorization-complete="completed = true"
  >
    <h1 class="fr-h3">
      Suis-je éligible aux aides à l'innovation ?
    </h1>

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
    <template v-else>
      <ResultatsSimulation :results="results" />
      <button
        class="fr-btn fr-btn--secondary fr-mt-2w"
        @click="restart"
      >
        Recommencer
      </button>
    </template>
  </main>
</template>

<style>
.site-header {
  padding: 1rem 0;
  background: #1a1a2e;
  color: white;
}
</style>
