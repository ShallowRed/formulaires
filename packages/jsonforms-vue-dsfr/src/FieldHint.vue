<script setup lang="ts">
import type { JsonSchema } from '@jsonforms/core'
import { computed } from 'vue'

interface LegalBasis {
  title: string
  url?: string
}

interface Source {
  provider: string
  data: string
}

// Under the label of a field, a group or a list: its description, its help and its annotations
const props = defineProps<{
  control: {
    description?: string
    schema: JsonSchema
    uischema?: { options?: Record<string, unknown> }
  }
}>()

// survey-schema writes a tooltip as a string or as `{ buttonLabel, content }`
const help = computed(() => {
  const tooltip = props.control.uischema?.options?.tooltip as string | { content?: string } | undefined
  return typeof tooltip === 'string' ? tooltip : tooltip?.content
})

// JSON Forms types a schema without the annotations of an application, which are prefixed with `x-`
const annotations = computed(() => props.control.schema as Record<string, unknown>)
const legalBasis = computed(() => annotations.value['x-legal-basis'] as LegalBasis | undefined)
const source = computed(() => annotations.value['x-source'] as Source | undefined)
</script>

<template>
  <span
    v-if="control.description"
    class="fr-hint-text"
  >{{ control.description }}</span>
  <span
    v-if="help || legalBasis || source"
    class="fr-hint-text field-annotations"
  >
    <span v-if="help">{{ help }}</span>
    <span v-if="source">
      <span class="fr-badge fr-badge--sm fr-badge--info fr-badge--no-icon">Donnée certifiable</span>
      {{ source.provider }} peut fournir cette donnée ({{ source.data }}).
    </span>
    <span v-if="legalBasis">
      Base légale :
      <a
        v-if="legalBasis.url"
        :href="legalBasis.url"
        :title="`${legalBasis.title} - nouvelle fenêtre`"
        target="_blank"
        rel="noopener"
      >{{ legalBasis.title }}</a>
      <template v-else>{{ legalBasis.title }}</template>
    </span>
  </span>
</template>

<style scoped>
.field-annotations > span {
  display: block;
  margin-top: 0.25rem;
}
</style>
