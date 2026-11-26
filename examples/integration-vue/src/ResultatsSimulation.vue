<script lang="ts" setup>
import type { EligibilityResults } from '@shallowred/survey-publicodes'

defineProps<{
  results: EligibilityResults
}>()

function montant(results: EligibilityResults, id: string): string {
  const value = results.aidesResults[id]
  if (typeof value !== 'number' || value === 0)
    return ''
  return ` : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}`
}
</script>

<template>
  <div>
    <div
      v-if="results.eligibleDispositifs.length"
      class="fr-callout fr-callout--green-emeraude fr-mb-2w"
    >
      <h2 class="fr-text--md">
        Vous semblez éligible :
      </h2>
      <ul>
        <li
          v-for="aide in results.eligibleDispositifs"
          :key="aide.id"
        >
          {{ aide.title }}{{ montant(results, aide.id) }}
        </li>
      </ul>
    </div>
    <div
      v-if="results.potentialDispositifs.length"
      class="fr-callout fr-callout--blue-cumulus fr-mb-2w"
    >
      <h2 class="fr-text--md">
        À préciser :
      </h2>
      <ul>
        <li
          v-for="aide in results.potentialDispositifs"
          :key="aide.id"
        >
          {{ aide.title }}
        </li>
      </ul>
    </div>
    <div
      v-if="results.ineligibleDispositifs.length"
      class="fr-callout fr-callout--pink-tuile fr-mb-2w"
    >
      <h2 class="fr-text--md">
        Non éligible :
      </h2>
      <ul>
        <li
          v-for="aide in results.ineligibleDispositifs"
          :key="aide.id"
        >
          {{ aide.title }}
        </li>
      </ul>
    </div>
  </div>
</template>
