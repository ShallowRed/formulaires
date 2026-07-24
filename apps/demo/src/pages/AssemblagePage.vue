<script lang="ts" setup>
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
  <div class="fr-grid-row fr-grid-row--center">
    <div class="fr-col-12 fr-col-lg-10">
      <h1 class="fr-h3">
        L'assemblage, pièce par pièce
      </h1>

      <p>
        La page « Simulateur complet » de ce site tient en quelques lignes : le formulaire
        déclaratif, le modèle de calcul et le kit de rendu sont des briques séparées,
        remplaçables indépendamment les unes des autres.
      </p>
      <pre class="demo-code">{{ assemblageCode }}</pre>

      <p class="fr-mt-3w">
        Ces briques ne sont pas une réécriture : ce sont les composants de production
        d'<a
          href="https://github.com/betagouv/aides-simplifiees-app"
          target="_blank"
          rel="noopener"
        >aides-simplifiées</a>, extraits de l'application et débarrassés de leurs
        adhérences. Le comportement du formulaire, conditions de visibilité comprises,
        est verrouillé par des tests rejoués sur le formulaire réel de 78 questions.
      </p>

      <div class="fr-callout fr-mt-3w">
        <h2 class="fr-callout__title fr-h6">
          Installer le simulateur chez vous
        </h2>
        <p class="fr-text--sm">
          Le guide d'intégration couvre les trois voies (iframe, hébergement du build
          statique, intégration native Vue), et un exemple exécutable montre l'intégration
          dans une application existante.
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
    </div>
  </div>
</template>

<style scoped>
.demo-code {
  background-color: var(--background-alt-grey);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.85rem;
  line-height: 1.6;
  overflow-x: auto;
}
</style>
