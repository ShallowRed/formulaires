<script lang="ts" setup>
import type { SurveySchema } from '@shallowred/survey-schema'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'
import { computed } from 'vue'
import CodeBlock from '../../components/CodeBlock.vue'
import EligibilityResults from '../../components/EligibilityResults.vue'

/**
 * A complete simulator in two literals: a declarative form (survey-schema)
 * and a publicodes model. Everything else is the kit.
 */

const formSchema: SurveySchema = {
  id: 'aide-velo',
  title: 'Aide à l\'achat d\'un vélo',
  version: '1.0.0',
  forceRefresh: false,
  description: 'Exemple minimal',
  engine: 'publicodes',
  dispositifs: [
    {
      id: 'aideVelo',
      title: 'Aide à l\'achat d\'un vélo',
      description: 'Exemple pédagogique, sans existence réglementaire.',
    },
  ],
  steps: [
    {
      id: 'profil',
      title: 'Votre profil',
      pages: [
        {
          id: 'profil-page',
          questions: [
            {
              id: 'age',
              title: 'Quel est votre âge ?',
              type: 'number',
              min: 0,
              max: 120,
            },
            {
              id: 'boursier',
              title: 'Êtes-vous boursier ?',
              type: 'boolean',
            },
            {
              id: 'velo-electrique',
              title: 'Le vélo est-il électrique ?',
              type: 'boolean',
              description: 'Cette question n\'apparaît que si vous avez entre 18 et 25 ans.',
              visibleWhen: ['age>=18', 'age<=25'],
            },
          ],
        },
      ],
    },
  ],
}

const rules = {
  'age': { titre: 'Âge' },
  'boursier': { 'titre': 'Boursier', 'par défaut': 'non' },
  'veloElectrique': { 'titre': 'Vélo électrique', 'par défaut': 'non' },
  'aideVelo': { titre: 'Aide à l\'achat d\'un vélo' },
  'aideVelo . eligibilite': {
    'toutes ces conditions': ['age >= 18', 'age <= 25'],
  },
  'aideVelo . montant': {
    'applicable si': 'aideVelo . eligibilite',
    'somme': ['aideVelo . base', 'aideVelo . bonusBoursier'],
  },
  'aideVelo . base': {
    variations: [
      { si: 'veloElectrique', alors: '400 €' },
      { sinon: '150 €' },
    ],
  },
  'aideVelo . bonusBoursier': {
    variations: [
      { si: 'boursier', alors: '100 €' },
      { sinon: '0 €' },
    ],
  },
}

const survey = useSurvey(formSchema)

const results = computed(() => {
  return calculateEligibility(rules, survey.schema, survey.getAnswersForCalculation())
})

const formJson = JSON.stringify(formSchema, null, 2)
const rulesJson = JSON.stringify(rules, null, 2)
</script>

<template>
  <h1 class="fr-h3">
    Un simulateur complet en deux fichiers
  </h1>
  <p>
    Le formulaire est un JSON déclaratif (questions, types, conditions de visibilité),
    les règles sont un modèle publicodes (éligibilité, montants). Le kit fait le reste :
    rendu DSFR, navigation, projection des réponses vers le moteur, calcul dans le navigateur.
  </p>

  <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
    <div class="fr-col-12 fr-col-lg-6">
      <h2 class="fr-h5">
        Le formulaire (survey-schema)
      </h2>
      <CodeBlock :code="formJson" />
      <h2 class="fr-h5 fr-mt-3w">
        Les règles (publicodes)
      </h2>
      <CodeBlock :code="rulesJson" />
    </div>
    <div class="fr-col-12 fr-col-lg-6">
      <h2 class="fr-h5">
        Le résultat
      </h2>
      <SurveyForm :survey="survey" />
      <div class="fr-mt-3w">
        <EligibilityResults
          :results="results"
          with-montants
        />
      </div>
    </div>
  </div>
</template>

