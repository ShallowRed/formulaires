<script setup lang="ts">
import type { FieldControl } from './labels'
import { DsfrRadioButtonSet } from '@gouvminint/vue-dsfr'
import FieldHint from './FieldHint.vue'
import { fieldLabel, isRequired } from './labels'

defineProps<{
  control: FieldControl
  options: { label: string, value: string | number | boolean }[]
  inline?: boolean
}>()

const emit = defineEmits<{ (e: 'change', value: unknown): void }>()
</script>

<template>
  <DsfrRadioButtonSet
    :model-value="control.data as string"
    :legend="fieldLabel(control)"
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
  >
    <template #hint>
      <FieldHint :control="control" />
    </template>
    <!-- The DSFR markup of a radio button: DsfrRadioButton of vue-dsfr copies its attributes onto its wrapper too, where
         `required` is invalid, and adds an asterisk to a required radio, where this package marks the optional fields -->
    <div
      v-for="(option, index) in options"
      :key="String(option.value)"
      class="fr-fieldset__element"
      :class="{ 'fr-fieldset__element--inline': inline }"
    >
      <div class="fr-radio-group">
        <input
          :id="`${control.id}-${index}`"
          type="radio"
          :name="control.id"
          :value="String(option.value)"
          :checked="control.data === option.value"
          :disabled="!control.enabled"
          :required="isRequired(control) || undefined"
          @change="emit('change', option.value)"
        >
        <label
          class="fr-label"
          :for="`${control.id}-${index}`"
        >{{ option.label }}</label>
      </div>
    </div>
  </DsfrRadioButtonSet>
</template>
