<script lang="ts" setup>
const parts = [
  {
    title: 'Modèle de calcul',
    description: 'Les règles d\'éligibilité et de montant sont écrites en publicodes et s\'exécutent dans le navigateur.',
    links: [{ href: 'https://publi.codes', text: 'publicodes' }],
  },
  {
    title: 'Formulaire',
    description: 'On écrit le schéma des réponses et les étapes du formulaire en JSON, sans toucher au code.',
    links: [{ href: 'https://github.com/ShallowRed/survey-kit/tree/main/packages/survey-schema', text: '@shallowred/survey-schema' }],
  },
  {
    title: 'Rendu et calcul',
    description: 'JSON Forms affiche le formulaire avec le DSFR, puis les réponses passent au modèle de calcul.',
    links: [
      { href: 'https://github.com/ShallowRed/survey-kit/tree/main/packages/jsonforms-vue-dsfr', text: '@shallowred/jsonforms-vue-dsfr' },
      { href: 'https://github.com/ShallowRed/survey-kit/tree/main/packages/survey-publicodes', text: '@shallowred/survey-publicodes' },
    ],
  },
]
</script>

<template>
  <h2 class="fr-h3">
    Parties d'un simulateur
  </h2>
  <p>
    On remplace chaque partie sans toucher aux autres.
  </p>

  <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
    <div
      v-for="part in parts"
      :key="part.title"
      class="fr-col-12 fr-col-lg-4"
    >
      <div class="fr-card fr-p-3w">
        <h3 class="fr-h6">
          {{ part.title }}
        </h3>
        <p class="fr-text--sm">
          {{ part.description }}
        </p>
        <p
          v-for="link in part.links"
          :key="link.href"
          class="fr-text--xs fr-mb-1v"
        >
          <a
            :href="link.href"
            target="_blank"
            rel="noopener"
          >{{ link.text }}</a>
        </p>
      </div>
    </div>
  </div>

  <p class="fr-mt-4w">
    Le
    <a
      href="https://github.com/ShallowRed/survey-kit/blob/main/docs/integration.md"
      target="_blank"
      rel="noopener"
    >guide d'intégration</a> décrit l'installation sur un site existant.
  </p>
</template>
