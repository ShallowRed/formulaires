<script lang="ts" setup>
import CodeBlock from '../../components/CodeBlock.vue'
import simulatorPage from './SimulatorPage.vue?raw'

const simulatorScript = simulatorPage.match(/<script[^>]*>\n([\s\S]*?)<\/script>/)?.[1].trimEnd() ?? ''
</script>

<template>
  <h2 class="fr-h3">
    Code du simulateur
  </h2>
  <p class="fr-mb-3w">
    Voici le script de la page « Simulateur des aides à l'innovation ».
  </p>
  <CodeBlock :code="simulatorScript" language="typescript" />
</template>
