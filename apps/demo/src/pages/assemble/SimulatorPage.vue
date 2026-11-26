<script lang="ts" setup>
import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import type { EligibilityResults as EligibilityResultsData } from '@shallowred/survey-publicodes'
import { rankWith, uiTypeIs } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import formSchema from '@shallowred/form-entreprise-innovation'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
// The npm package entry uses `assert { type: 'json' }` (removed from Node >= 22): import the compiled rules directly
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibilityV3 } from '@shallowred/survey-publicodes'
import { compileV3ToJsonForms, migrateV2ToV3, visibleAnswers } from '@shallowred/survey-schema'
import { computed, provide, ref } from 'vue'
import EligibilityResults from '../../components/EligibilityResults.vue'
import EligibilityResultsRenderer from '../../components/EligibilityResultsRenderer.vue'
import FormFrame from '../../components/FormFrame.vue'

const { questionnaire, dataSchema } = migrateV2ToV3(formSchema)
const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)

function eligibilityOf(answers: Record<string, unknown>): EligibilityResultsData {
  return calculateEligibilityV3(rules, dataSchema, visibleAnswers(questionnaire, answers), formSchema.dispositifs)
}
provide('eligibilityOf', eligibilityOf)

// The results pages of the questionnaire show the engine results through a renderer of higher rank
const renderers = Object.freeze([
  ...dsfrRenderers,
  { renderer: EligibilityResultsRenderer, tester: rankWith(5, uiTypeIs('IntermediaryResults')) },
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
  <div @categorization-complete="completed = true">
    <h2 class="fr-h3">
      Simulateur des aides à l'innovation
    </h2>
    <p class="fr-mb-3w">
      Ce formulaire est celui du simulateur d'entreprise.service-public.fr, converti depuis le format d'aides-simplifiées. Le
      <a
        href="https://github.com/betagouv/publicodes-entreprise-innovation"
        target="_blank"
        rel="noopener"
      >modèle publicodes</a> calcule l'éligibilité aux six dispositifs dans le navigateur.
    </p>
    <FormFrame v-if="!completed">
      <JsonForms
        :data="answers"
        :schema="schema"
        :uischema="uischema"
        :renderers="renderers"
        :ajv="ajv"
        :i18n="dsfrI18n"
        validation-mode="ValidateAndHide"
        @change="event => answers = event.data"
      />
    </FormFrame>
    <template v-else>
      <h3 class="fr-h4">
        Résultats de la simulation
      </h3>
      <EligibilityResults
        :results="results"
        with-montants
      />
      <DsfrButton
        label="Recommencer la simulation"
        secondary
        class="fr-mt-2w"
        @click="restart"
      />
    </template>
  </div>
</template>
