<script lang="ts" setup>
import type { EligibilityResults as EligibilityResultsData } from '@shallowred/survey-publicodes'
import formSchema from '@shallowred/form-entreprise-innovation'
// The npm package entry uses `assert { type: 'json' }` (removed from
// Node >= 22): import the compiled rules directly
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'
import { computed, ref } from 'vue'
import EligibilityResults from '../../components/EligibilityResults.vue'

const survey = useSurvey(formSchema)
const completed = ref(false)

const results = computed<EligibilityResultsData>(() => {
  return calculateEligibility(
    rules,
    survey.schema,
    survey.getAnswersForCalculation(),
  )
})

function onComplete() {
  completed.value = true
}

function onRestart() {
  completed.value = false
  survey.reset()
}
</script>

<template>
  <h1 class="fr-h3">
    Aides à l'innovation pour les entreprises
  </h1>
  <p class="fr-text--sm fr-mb-3w">
    Le formulaire des six dispositifs (CIR, CII, CICo, JEI, JEU, JEC) est décrit par
    <a
      href="https://github.com/ShallowRed/survey-kit/tree/main/packages/form-entreprise-innovation"
      target="_blank"
      rel="noopener"
    >un fichier JSON déclaratif</a>, le calcul est fait dans votre navigateur par
    <a
      href="https://github.com/betagouv/publicodes-entreprise-innovation"
      target="_blank"
      rel="noopener"
    >le modèle publicodes ouvert</a>. Aucune donnée n'est envoyée à un serveur.
  </p>

  <template v-if="!completed">
    <SurveyForm
      :survey="survey"
      @complete="onComplete"
    >
      <template #results-page>
        <EligibilityResults :results="results" />
      </template>
    </SurveyForm>
  </template>

  <template v-else>
    <h2 class="fr-h4">
      Résultats de la simulation
    </h2>
    <EligibilityResults
      :results="results"
      with-montants
    />
    <DsfrButton
      label="Recommencer la simulation"
      secondary
      class="fr-mt-2w"
      @click="onRestart"
    />
  </template>
</template>
