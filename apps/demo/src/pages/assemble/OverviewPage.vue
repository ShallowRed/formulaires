<script lang="ts" setup>
const bricks = [
  {
    title: 'Le modèle de calcul',
    description: 'Les règles d\'éligibilité et de montant, écrites en publicodes : lisibles par les experts métier, exécutées dans le navigateur.',
    link: { href: 'https://publi.codes', text: 'publicodes' },
  },
  {
    title: 'Le questionnaire',
    description: 'Un fichier JSON qui décrit les questions, leurs types et leurs conditions d\'affichage, modifiable sans toucher au code.',
    link: { href: 'https://github.com/ShallowRed/survey-kit/tree/main/packages/survey-schema', text: '@shallowred/survey-schema' },
  },
  {
    title: 'Le rendu et la projection',
    description: 'La navigation, la validation et le rendu DSFR du questionnaire, puis la projection des réponses vers le modèle de calcul.',
    link: { href: 'https://github.com/ShallowRed/survey-kit/tree/main/packages/survey-publicodes', text: '@shallowred/survey-publicodes' },
  },
]
</script>

<template>
  <h1 class="fr-h3">
    Assembler un simulateur
  </h1>
  <p>
    Un simulateur relie un questionnaire à un modèle de calcul. survey-kit sépare les trois briques, que l'on remplace l'une sans toucher aux autres, et les assemble dans une page statique, sans serveur de calcul.
  </p>

  <div class="fr-grid-row fr-grid-row--gutters fr-mt-2w">
    <div
      v-for="brick in bricks"
      :key="brick.title"
      class="fr-col-12 fr-col-lg-4"
    >
      <div class="fr-card fr-p-3w">
        <h2 class="fr-h6">
          {{ brick.title }}
        </h2>
        <p class="fr-text--sm">
          {{ brick.description }}
        </p>
        <p class="fr-text--xs fr-mb-0">
          <a
            :href="brick.link.href"
            target="_blank"
            rel="noopener"
          >{{ brick.link.text }}</a>
        </p>
      </div>
    </div>
  </div>

  <p class="fr-mt-4w">
    L'exemple minimal se compose de deux fichiers. Le simulateur d'aides à l'innovation, avec ses six dispositifs et ses 78 questions, montre le même assemblage à l'échelle d'un service en production. Le
    <a
      href="https://github.com/ShallowRed/survey-kit/blob/main/docs/integration.md"
      target="_blank"
      rel="noopener"
    >guide d'intégration</a> décrit comment l'installer sur un site existant : iframe, hébergement du build statique ou intégration native en Vue.
  </p>
</template>
