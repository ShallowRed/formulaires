<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { DsfrRadioButtonSet } from '@gouvminint/vue-dsfr'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)

const options = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
]
</script>

<template>
  <DsfrRadioButtonSet
    v-if="control.visible"
    :model-value="control.data"
    :name="control.id"
    :legend="fieldLabel(control)"
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
    :options="options"
    inline
    @update:model-value="value => handleChange(control.path, value)"
  >
    <template #hint>
      <FieldHint :control="control" />
    </template>
  </DsfrRadioButtonSet>
</template>
