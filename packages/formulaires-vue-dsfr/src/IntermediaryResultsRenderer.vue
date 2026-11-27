<script setup lang="ts">
import type { UISchemaElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsRenderer } from '@jsonforms/vue'
import { computed } from 'vue'

interface Output {
  id: string
  title: string
  description?: string
}

const props = defineProps(rendererProps<UISchemaElement>())
const { renderer } = useJsonFormsRenderer(props)

// Without a calculation engine, the page lists what the engine will compute; an application registers
// its own renderer with a higher rank to show the values
const outputs = computed(() => (renderer.value.uischema.options?.outputs ?? []) as Output[])
</script>

<template>
  <div class="fr-callout">
    <ul class="fr-callout__text">
      <li
        v-for="output in outputs"
        :key="output.id"
      >
        <strong>{{ output.title }}</strong>
        <template v-if="output.description">
          : {{ output.description }}
        </template>
      </li>
    </ul>
  </div>
</template>
