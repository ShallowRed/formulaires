<script setup lang="ts">
import type { LabelElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsLabel } from '@jsonforms/vue'

const props = defineProps(rendererProps<LabelElement>())
const { label } = useJsonFormsLabel(props)
</script>

<template>
  <p
    v-if="label.visible"
    class="fr-text--lg"
  >
    {{ label.text }}
  </p>
</template>
