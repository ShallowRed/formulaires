<script setup lang="ts">
import type { FieldControl } from './labels'
import { DsfrSelect } from '@gouvminint/vue-dsfr'
import { computed } from 'vue'
import FieldHint from './FieldHint.vue'
import RadioField from './RadioField.vue'
import { choicesOf, choiceTooltip, fieldLabel, isRequired } from './labels'

// Up to this number of choices, the DSFR recommends radio buttons over a select
const RADIO_LIMIT = 5

const props = defineProps<{
  control: FieldControl & { options: { label: string, value: unknown }[] }
}>()

const emit = defineEmits<{ (e: 'change', value: unknown): void }>()

// A select cannot show the tooltip of an option: a choice whose options have tooltips stays radio buttons
const asRadio = computed(() => {
  const format = props.control.uischema.options?.format
  const withTooltips = Object.values(choicesOf(props.control.uischema.options)).some(choice => choice.tooltip)
  return format === 'radio' || (format !== 'select' && (props.control.options.length <= RADIO_LIMIT || withTooltips))
})
</script>

<template>
  <RadioField
    v-if="asRadio"
    :control="control"
    :options="control.options.map(option => ({ label: option.label, value: option.value as string, tooltip: choiceTooltip(control.uischema.options, option.value, option.label) }))"
    @change="value => emit('change', value)"
  />
  <DsfrSelect
    v-else
    :model-value="control.data as string"
    :required="isRequired(control) || undefined"
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
