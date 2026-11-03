<script setup lang="ts">
import type { JsonSchema } from '@jsonforms/core'
import { DsfrRadioButtonSet, DsfrSelect } from '@gouvminint/vue-dsfr'
import { computed } from 'vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel } from './labels'

// Up to this number of choices, the DSFR recommends radio buttons over a select
const RADIO_LIMIT = 5

const props = defineProps<{
  control: {
    id: string
    label: string
    required?: boolean
    description?: string
    data: unknown
    errors: string
    enabled: boolean
    schema: JsonSchema
    uischema: { options?: Record<string, unknown> }
    options: { label: string, value: unknown }[]
  }
}>()

const emit = defineEmits<{ (e: 'change', value: unknown): void }>()

const asRadio = computed(() => {
  const format = props.control.uischema.options?.format
  return format === 'radio' || (format !== 'select' && props.control.options.length <= RADIO_LIMIT)
})
</script>

<template>
  <DsfrRadioButtonSet
    v-if="asRadio"
    :model-value="control.data as string"
    :name="control.id"
    :legend="fieldLabel(control)"
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
    :options="control.options.map(option => ({ label: option.label, value: option.value as string }))"
    @update:model-value="value => emit('change', value)"
  >
    <template #hint>
      <FieldHint :control="control" />
    </template>
  </DsfrRadioButtonSet>
  <DsfrSelect
    v-else
    :model-value="control.data as string"
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
    :options="control.options.map(option => ({ value: option.value as string, text: option.label }))"
    @update:model-value="value => emit('change', value)"
  >
    <template #label>
      {{ fieldLabel(control) }}
      <FieldHint :control="control" />
    </template>
  </DsfrSelect>
</template>
