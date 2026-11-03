<script setup lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsEnumControl } from '@jsonforms/vue'
import ChoiceField from './ChoiceField.vue'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsEnumControl(props)
</script>

<template>
  <ChoiceField
    v-if="control.visible"
    :control="control"
    @change="value => handleChange(control.path, value)"
  />
</template>
