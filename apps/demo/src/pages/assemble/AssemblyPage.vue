<script lang="ts" setup>
import CodeBlock from '../../components/CodeBlock.vue'

const assemblageCode = `import formSchema from '@shallowred/form-entreprise-innovation'
import rules from '@shallowred/publicodes-entreprise-innovation/…/model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'

const survey = useSurvey(formSchema)
const results = computed(() =>
  calculateEligibility(rules, survey.schema, survey.getAnswersForCalculation()),
)`
</script>

<template>
  <h1 class="fr-h3">
    Le code de l'assemblage
  </h1>

  <p>
    La page « Aides à l'innovation » de cette rubrique s'écrit en quelques lignes : le formulaire
    déclaratif, le modèle de calcul et le kit de rendu sont des briques séparées,
    remplaçables indépendamment les unes des autres.
  </p>
  <CodeBlock :code="assemblageCode" language="typescript" />

  <p class="fr-mt-3w">
    Ces briques sont les composants de production
    d'<a
      href="https://github.com/betagouv/aides-simplifiees-app"
      target="_blank"
      rel="noopener"
    >aides-simplifiées</a>, séparés du reste de l'application. Des tests vérifient le
    comportement du formulaire, conditions de visibilité comprises, sur le formulaire réel
    de 78 questions.
  </p>

  <div class="fr-callout fr-mt-3w">
    <h2 class="fr-callout__title fr-h6">
      Intégrer un simulateur sur un site existant
    </h2>
    <p class="fr-text--sm">
      Le guide d'intégration décrit trois façons d'intégrer le simulateur (iframe,
      hébergement du build statique, intégration native en Vue), et un exemple exécutable
      montre l'intégration dans une application existante.
    </p>
    <ul class="fr-btns-group fr-btns-group--inline-md fr-mb-0">
      <li>
        <a
          class="fr-btn fr-btn--secondary"
          href="https://github.com/ShallowRed/survey-kit/blob/main/docs/integration.md"
          target="_blank"
          rel="noopener"
        >Lire le guide d'intégration</a>
      </li>
      <li>
        <a
          class="fr-btn fr-btn--secondary"
          href="https://github.com/ShallowRed/survey-kit/tree/main/examples/integration-vue"
          target="_blank"
          rel="noopener"
        >Voir l'exemple d'intégration</a>
      </li>
    </ul>
  </div>
</template>

