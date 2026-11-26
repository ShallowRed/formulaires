<script lang="ts" setup>
const entries = [
  {
    to: '/integrer',
    title: 'Intégrer un formulaire',
    description: 'Afficher avec le DSFR le formulaire d\'un JSON Schema, avec la base légale et la source certifiable de chaque réponse.',
  },
  {
    to: '/ecrire',
    title: 'Écrire un questionnaire',
    description: 'Ranger les questions en étapes et en pages, poser les conditions d\'affichage, et voir le formulaire qu\'elles produisent.',
  },
  {
    to: '/assembler',
    title: 'Assembler un simulateur',
    description: 'Relier un questionnaire à un modèle de calcul publicodes, et afficher l\'éligibilité et les montants sans serveur de calcul.',
  },
]
</script>

<template>
  <h1 class="fr-h2">
    Des formulaires de démarches décrits en JSON, affichés avec le DSFR
  </h1>
  <p class="fr-text--lg fr-mb-4w">
    survey-kit réunit un format de questionnaire, des composants DSFR pour JSON Forms et un adaptateur vers le moteur de calcul publicodes. Tout s'exécute dans le navigateur.
  </p>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div
      v-for="entry in entries"
      :key="entry.to"
      class="fr-col-12 fr-col-md-4"
    >
      <div class="fr-tile fr-enlarge-link">
        <div class="fr-tile__body">
          <div class="fr-tile__content">
            <h2 class="fr-tile__title">
              <RouterLink :to="entry.to">
                {{ entry.title }}
              </RouterLink>
            </h2>
            <p class="fr-tile__desc">
              {{ entry.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
