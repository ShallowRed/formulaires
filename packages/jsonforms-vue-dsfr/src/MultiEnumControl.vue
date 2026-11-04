<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { Actions } from '@jsonforms/core'
import { DsfrCheckboxSet, DsfrTooltip } from '@gouvminint/vue-dsfr'
import { rendererProps, useDispatch, useJsonFormsMultiEnumControl } from '@jsonforms/vue'
import { computed } from 'vue'
import FieldHint from './FieldHint.vue'
import { choicesOf, choiceTooltip, fieldLabel } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control } = useJsonFormsMultiEnumControl(props)
const dispatch = useDispatch()

const choices = computed(() => choicesOf(control.value.uischema.options))
const options = computed(() => control.value.options.map(option => ({
  id: `${control.value.id}-${String(option.value)}`,
  value: option.value as string,
  label: option.label,
  tooltip: choiceTooltip(control.value.uischema.options, option.value, option.label),
})))
const selection = computed<string[]>(() => control.value.data ?? [])

// An exclusive choice, such as "none of these", clears the others, and any other choice clears it.
// An empty selection is no answer, so that a required question stays unanswered.
function toggle(value: string, checked: boolean) {
  update(checked ? [...selection.value, value] : selection.value.filter(item => item !== value))
}

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
    :error-message="control.errors || undefined"
    :disabled="!control.enabled"
  >
    <template #legend>
      {{ fieldLabel(control) }}
      <FieldHint :control="control" />
    </template>
    <!-- The DSFR markup of a checkbox, so that the tooltip button of a choice follows its label -->
    <div
      v-for="option in options"
      :key="option.value"
      class="fr-fieldset__element"
    >
      <div
        class="fr-checkbox-group"
        :class="{ 'jsonforms-dsfr-choice': option.tooltip }"
      >
        <input
          :id="option.id"
          type="checkbox"
          :name="option.id"
          :value="option.value"
          :checked="selection.includes(option.value)"
          :disabled="!control.enabled"
          @change="event => toggle(option.value, (event.target as HTMLInputElement).checked)"
        >
        <label
          class="fr-label"
          :for="option.id"
        >{{ option.label }}</label>
        <DsfrTooltip
          v-if="option.tooltip"
          :content="option.tooltip.content"
          :aria-label="option.tooltip.buttonLabel"
        />
      </div>
    </div>
  </DsfrCheckboxSet>
</template>
