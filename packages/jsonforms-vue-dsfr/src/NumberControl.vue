<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { DsfrInput, DsfrInputGroup } from '@gouvminint/vue-dsfr'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)

function update(value: string | number | undefined) {
  handleChange(control.value.path, value === '' || value === undefined ? undefined : Number(value))
}
</script>

<template>
  <DsfrInputGroup
    v-if="control.visible"
    :description-id="`${control.id}-messages`"
    :error-message="control.errors || undefined"
  >
    <template #default="{ descriptionId }">
      <DsfrInput
        :id="`${control.id}-input`"
        :model-value="control.data ?? ''"
        :disabled="!control.enabled"
        :is-invalid="!!control.errors"
        :description-id="descriptionId"
        :placeholder="control.uischema.options?.placeholder"
        :step="control.schema.type === 'integer' ? 1 : 'any'"
        :min="control.schema.minimum"
        :max="control.schema.maximum"
        inputmode="decimal"
        type="number"
        label-visible
        @update:model-value="update"
      >
        <template #label>
          {{ fieldLabel(control) }}
          <FieldHint :control="control" />
        </template>
      </DsfrInput>
    </template>
  </DsfrInputGroup>
</template>
