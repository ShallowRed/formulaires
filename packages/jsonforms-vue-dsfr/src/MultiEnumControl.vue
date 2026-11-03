<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { Actions } from '@jsonforms/core'
import { DsfrCheckboxSet } from '@gouvminint/vue-dsfr'
import { rendererProps, useDispatch, useJsonFormsMultiEnumControl } from '@jsonforms/vue'
import { computed } from 'vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control } = useJsonFormsMultiEnumControl(props)
const dispatch = useDispatch()

const choices = computed(() => (control.value.uischema.options?.choices ?? {}) as Record<string, { exclusive?: boolean }>)
const options = computed(() => control.value.options.map(option => ({
  id: `${control.value.id}-${String(option.value)}`,
  name: `${control.value.id}-${String(option.value)}`,
  value: option.value as string,
  label: option.label,
})))
const selection = computed<string[]>(() => control.value.data ?? [])

// An exclusive choice, such as "none of these", clears the others, and any other choice clears it.
// An empty selection is no answer, so that a required question stays unanswered.
function update(next: string[]) {
  const added = next.filter(value => !selection.value.includes(value))
  const exclusive = added.find(value => choices.value[value]?.exclusive)
  const target = exclusive
    ? [exclusive]
    : added.length > 0 ? next.filter(item => !choices.value[item]?.exclusive) : next
  dispatch(Actions.update(control.value.path, () => (target.length > 0 ? target : undefined)))
}
</script>

<template>
  <DsfrCheckboxSet
    v-if="control.visible"
    :model-value="selection"
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
    :options="options"
    @update:model-value="update"
  >
    <template #legend>
      {{ fieldLabel(control) }}
      <FieldHint :control="control" />
    </template>
  </DsfrCheckboxSet>
</template>
