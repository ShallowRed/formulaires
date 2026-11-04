<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import RadioField from './RadioField.vue'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControl(props)

const options = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
]
</script>

<template>
  <RadioField
    v-if="control.visible"
    :control="control"
    :options="options"
    inline
    @change="value => handleChange(control.path, value)"
  />
</template>
