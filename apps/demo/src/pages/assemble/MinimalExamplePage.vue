<script lang="ts" setup>
import { calculateEligibilityV3 } from '@shallowred/survey-publicodes'
import { compileV3ToJsonForms, visibleAnswers } from '@shallowred/survey-schema'
import CodeBlock from '../../components/CodeBlock.vue'
import EligibilityResults from '../../components/EligibilityResults.vue'
import SchemaPreview from '../../components/SchemaPreview.vue'
import { bikeAidAnswers, bikeAidDispositifs, bikeAidQuestionnaire, bikeAidRules } from '../../examples/bike-aid'

const { schema, uischema } = compileV3ToJsonForms(bikeAidQuestionnaire, bikeAidAnswers)

function eligibilityOf(answers: Record<string, unknown>) {
  return calculateEligibilityV3(bikeAidRules, bikeAidAnswers, visibleAnswers(bikeAidQuestionnaire, answers), bikeAidDispositifs)
}

const answersJson = JSON.stringify(bikeAidAnswers, null, 2)
const questionnaireJson = JSON.stringify(bikeAidQuestionnaire, null, 2)
const rulesJson = JSON.stringify(bikeAidRules, null, 2)
</script>

<template>
  <h2 class="fr-h3">
    Exemple minimal
  </h2>
  <p class="fr-mb-3w">
    Un schéma des réponses, les étapes du formulaire et un modèle publicodes décrivent une aide fictive à l'achat d'un vélo.
  </p>
  <SchemaPreview
    :schema="schema"
    :uischema="uischema"
  >
    <template #source>
      <h3 class="fr-h6 fr-mb-1w">
        Schéma des réponses
      </h3>
      <CodeBlock :code="answersJson" language="json" />
      <h3 class="fr-h6 fr-mt-3w fr-mb-1w">
        Étapes
      </h3>
      <CodeBlock :code="questionnaireJson" language="json" />
      <h3 class="fr-h6 fr-mt-3w fr-mb-1w">
        Modèle publicodes
      </h3>
      <CodeBlock :code="rulesJson" language="json" />
    </template>
    <template #result="{ answers }">
      <h3 class="fr-h6 fr-mt-3w fr-mb-1w">
        Résultat
      </h3>
      <EligibilityResults
        :results="eligibilityOf(answers)"
        with-montants
      />
    </template>
  </SchemaPreview>
</template>
