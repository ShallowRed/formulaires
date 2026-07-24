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
        La page « Simulateur complet » de ce site tient en quelques lignes : chaque
        responsabilité vit dans une brique séparée, remplaçable indépendamment des autres.
      </p>
      <pre class="demo-code">{{ assemblageCode }}</pre>

      <h2 class="fr-h5 fr-mt-4w">
        Qui maintient quoi
      </h2>
      <ul>
        <li>
          <strong>Le modèle publicodes</strong> encode le droit (barèmes, plafonds,
          conditions). C'est la seule brique qui bouge quand la réglementation change.
          Elle se maintient dans un dépôt dédié, avec ses cas de tests, par les personnes
          qui connaissent les dispositifs.
        </li>
        <li>
          <strong>Le formulaire JSON</strong> encode le parcours de saisie (ordre,
          formulations, conditions d'affichage). Il se modifie sans compétence de
          développement particulière.
        </li>
        <li>
          <strong>Le kit de rendu</strong> (schéma, composants DSFR, projection vers le
          moteur) est générique : il ne contient rien de spécifique aux aides à
          l'innovation, comme le montre
          <RouterLink to="/exemple-minimal">
            l'exemple minimal
          </RouterLink>.
        </li>
      </ul>

      <h2 class="fr-h5 fr-mt-4w">
        Provenance
      </h2>
      <p>
        Ces briques ne sont pas une réécriture : ce sont les composants de production
        d'<a
          href="https://github.com/betagouv/aides-simplifiees-app"
          target="_blank"
          rel="noopener"
        >aides-simplifiées</a>, extraits de l'application et débarrassés de leurs
        adhérences (store, framework serveur, analytics). Le comportement du formulaire —
        conditions de visibilité comprises — est vérifié par des tests automatisés
        rejoués sur le formulaire réel de 78 questions.
      </p>

      <h2 class="fr-h5 fr-mt-4w">
        Ce que ça change pour une reprise
      </h2>
      <ul>
        <li>
          <strong>Pas de dépendance à un service tiers</strong> : tout est open source
          (MIT), installable depuis npm ou copiable dans un dépôt interne, et le calcul
          s'exécute entièrement dans le navigateur de l'usager.
        </li>
        <li>
          <strong>Hébergement trivial</strong> : le site est un build statique. Ce
          site-ci est servi par GitHub Pages ; n'importe quel serveur de fichiers fait
          l'affaire.
        </li>
        <li>
          <strong>Intégration en iframe inchangée</strong> : le simulateur peut être
          embarqué comme aujourd'hui sur entreprise.service-public.fr
          (<RouterLink to="/simulateur?embed">
            version sans habillage
          </RouterLink>).
        </li>
        <li>
          <strong>Auditabilité</strong> : les règles publicodes se lisent comme de la
          documentation, et chaque montant affiché peut être retracé jusqu'à la règle
          qui le produit.
        </li>
      </ul>
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
