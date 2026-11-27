<script lang="ts" setup>
import { version } from '../../../../../packages/formulaires-vue-dsfr/package.json'
import CodeBlock from '../../components/CodeBlock.vue'

// The release workflow tags each version `formulaires-vue-dsfr-v<version>` and attaches its archive
const installCode = `pnpm add https://github.com/ShallowRed/formulaires/releases/download/formulaires-vue-dsfr-v${version}/shallowred-formulaires-vue-dsfr-${version}.tgz`

const usageCode = `<script setup lang="ts">
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/formulaires-vue-dsfr'
import '@shallowred/formulaires-vue-dsfr/styles'

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
  <h2 class="fr-h3">
    Installation
  </h2>
  <p>
    <code>@shallowred/formulaires-vue-dsfr</code> affiche avec le DSFR le formulaire que
    <a
      href="https://jsonforms.io/"
      target="_blank"
      rel="noopener"
    >JSON Forms</a> tire d'un JSON Schema 2020-12.
  </p>

  <h3 class="fr-h5">
    Archive
  </h3>
  <p>
    Chaque version est publiée en archive dans une release du dépôt formulaires :
  </p>
  <CodeBlock :code="installCode" language="shellscript" />
  <p class="fr-mt-2w">
    On installe aussi <code>vue</code>, <code>@jsonforms/core</code> et <code>@jsonforms/vue</code> 3.8, <code>@gouvminint/vue-dsfr</code> 8.11 ou plus, et on charge les feuilles de style du DSFR.
  </p>

  <h3 class="fr-h5 fr-mt-4w">
    Utilisation
  </h3>
  <CodeBlock :code="usageCode" language="vue" />
  <p class="fr-mt-2w">
    <code>createAjv2020</code> valide les schémas 2020-12, que l'instance d'Ajv par défaut de JSON Forms refuse. <code>dsfrI18n</code> traduit les messages d'erreur. Le
    <a
      href="https://github.com/ShallowRed/formulaires/tree/main/packages/formulaires-vue-dsfr#readme"
      target="_blank"
      rel="noopener"
    >README du paquet</a> décrit l'effet de chaque mot-clé sur le formulaire.
  </p>
</template>
