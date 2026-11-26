<script lang="ts" setup>
import { version } from '../../../../../packages/jsonforms-vue-dsfr/package.json'
import CodeBlock from '../../components/CodeBlock.vue'

// The release workflow tags each version `jsonforms-vue-dsfr-v<version>` and attaches its archive
const installCode = `pnpm add https://github.com/ShallowRed/survey-kit/releases/download/jsonforms-vue-dsfr-v${version}/shallowred-jsonforms-vue-dsfr-${version}.tgz`

const usageCode = `<script setup lang="ts">
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import '@shallowred/jsonforms-vue-dsfr/styles'

const ajv = createAjv2020()
</` + `script>

<template>
  <form novalidate>
    <JsonForms
      :schema="schema"
      :data="data"
      :renderers="dsfrRenderers"
      :ajv="ajv"
      :i18n="dsfrI18n"
      @change="onChange"
    />
  </form>
</template>`
</script>

<template>
  <h1 class="fr-h3">
    Intégrer un formulaire
  </h1>
  <p>
    <code>@shallowred/jsonforms-vue-dsfr</code> affiche avec les composants du DSFR le formulaire que
    <a
      href="https://jsonforms.io/"
      target="_blank"
      rel="noopener"
    >JSON Forms</a> construit à partir d'un JSON Schema 2020-12. Les autres pages de cette rubrique montrent chacune un schéma et le formulaire qu'il produit.
  </p>

  <h2 class="fr-h5">
    Installer
  </h2>
  <p>
    L'archive de chaque version est attachée à une release de survey-kit :
  </p>
  <CodeBlock :code="installCode" />
  <p class="fr-mt-2w">
    L'application installe aussi <code>vue</code>, <code>@jsonforms/core</code> et <code>@jsonforms/vue</code> en version 3.8, <code>@gouvminint/vue-dsfr</code> 8 à partir de la 8.11, et charge les feuilles de style du DSFR.
  </p>

  <h2 class="fr-h5 fr-mt-4w">
    Afficher un formulaire
  </h2>
  <CodeBlock :code="usageCode" />
  <p class="fr-mt-2w">
    <code>createAjv2020</code> crée l'instance d'Ajv qui valide un schéma 2020-12, que l'instance draft-07 de JSON Forms refuse. <code>dsfrI18n</code> écrit les messages d'erreur en français. Le détail des mots-clés que lisent les composants est dans le
    <a
      href="https://github.com/ShallowRed/survey-kit/tree/main/packages/jsonforms-vue-dsfr#readme"
      target="_blank"
      rel="noopener"
    >README du paquet</a>.
  </p>
</template>
