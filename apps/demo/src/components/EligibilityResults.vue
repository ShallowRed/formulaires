<script lang="ts" setup>
import type { EligibilityResults } from '@shallowred/formulaires-publicodes'
import { computed } from 'vue'

const props = defineProps<{
  results: EligibilityResults
  /** Show computed amounts next to eligible dispositifs */
  withMontants?: boolean
}>()

const hasEligible = computed(() => props.results.eligibleDispositifs.length > 0)
const hasPotential = computed(() => props.results.potentialDispositifs.length > 0)
const hasIneligible = computed(() => props.results.ineligibleDispositifs.length > 0)

function formatMontant(dispositifId: string): string | null {
  const montant = props.results.aidesResults[dispositifId]
  if (typeof montant !== 'number' || montant === 0) {
    return null
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(montant)
}
</script>

<template>
  <div>
    <div
      v-if="hasEligible"
      class="fr-callout fr-callout--green-emeraude fr-p-3w fr-mb-2w"
    >
      <h4 class="fr-text--md">
        Selon les informations fournies, vous semblez éligible aux aides suivantes :
      </h4>
      <ul>
        <li
          v-for="aide in results.eligibleDispositifs"
          :key="aide.id"
        >
          <p class="fr-text--md">
            {{ aide.title }}<template v-if="withMontants && formatMontant(aide.id)">, montant estimé : <strong>{{ formatMontant(aide.id) }}</strong></template>
          </p>
        </li>
      </ul>
    </div>

    <div
      v-if="hasPotential"
      class="fr-callout fr-callout--blue-cumulus fr-p-3w fr-mb-2w"
    >
      <h4 class="fr-text--md">
        Ces aides nécessitent plus d'informations pour déterminer votre éligibilité :
      </h4>
      <ul>
        <li
          v-for="aide in results.potentialDispositifs"
          :key="aide.id"
        >
          <p class="fr-text--md">
            {{ aide.title }}
          </p>
        </li>
      </ul>
    </div>

    <div
      v-if="hasIneligible"
      class="fr-callout fr-callout--pink-tuile fr-p-3w fr-mb-2w"
    >
      <h4 class="fr-text--md">
        Selon les informations fournies, vous ne remplissez pas les critères
        d'éligibilité des dispositifs suivants :
      </h4>
      <ul>
        <li
          v-for="aide in results.ineligibleDispositifs"
          :key="aide.id"
        >
          <p class="fr-text--md">
            {{ aide.title }}<span v-if="aide.reason"> : {{ aide.reason }}</span>
          </p>
        </li>
      </ul>
    </div>

    <DsfrAlert
      v-if="!hasEligible && !hasPotential && !hasIneligible"
      title="Informations insuffisantes"
      type="info"
      description="Répondez aux questions du formulaire pour évaluer votre éligibilité."
    />
  </div>
</template>
