<script lang="ts" setup>
// Etape 3 du guide d'integration : monter le simulateur
import formSchema from '@shallowred/form-entreprise-innovation'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'
import { computed, ref } from 'vue'
import ResultatsSimulation from './ResultatsSimulation.vue'

const survey = useSurvey(formSchema)
const completed = ref(false)

const results = computed(() =>
  calculateEligibility(rules, survey.schema, survey.getAnswersForCalculation()),
)
</script>

<template>
  <!-- L'habillage du site hôte : tout ce qui entoure le simulateur vous appartient -->
  <header class="site-header">
    <div class="fr-container">
      <strong>Mon site existant</strong> — espace aides aux entreprises
    </div>
  </header>

  <main class="fr-container fr-py-4w">
    <h1 class="fr-h3">
      Suis-je éligible aux aides à l'innovation ?
    </h1>

    <template v-if="!completed">
      <SurveyForm
        :survey="survey"
        @complete="completed = true"
      >
        <template #results-page>
          <ResultatsSimulation :results="results" />
        </template>
      </SurveyForm>
    </template>
    <template v-else>
      <ResultatsSimulation :results="results" />
      <button
        class="fr-btn fr-btn--secondary fr-mt-2w"
        @click="survey.reset(); completed = false"
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
