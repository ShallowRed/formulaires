<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { DsfrInput, DsfrInputGroup } from '@gouvminint/vue-dsfr'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel, isRequired } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)
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
        :required="isRequired(control) || undefined"
        :placeholder="control.uischema.options?.placeholder"
        :type="control.schema.format === 'date' ? 'date' : 'text'"
        label-visible
        @update:model-value="value => handleChange(control.path, value === '' ? undefined : value)"
      >
        <template #label>
          {{ fieldLabel(control) }}
          <FieldHint :control="control" />
        </template>
      </DsfrInput>
    </template>
  </DsfrInputGroup>
</template>
