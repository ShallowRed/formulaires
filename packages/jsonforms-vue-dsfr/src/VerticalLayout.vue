<script setup lang="ts">
import type { Layout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'

const props = defineProps(rendererProps<Layout>())
const { layout } = useJsonFormsLayout(props)
</script>

<template>
  <div v-if="layout.visible">
    <DispatchRenderer
      v-for="(element, index) in (layout.uischema as Layout).elements"
      :key="`${layout.path}-${index}`"
      :schema="layout.schema"
      :uischema="element"
      :path="layout.path"
      :enabled="layout.enabled"
      :renderers="layout.renderers"
      :cells="layout.cells"
    />
  </div>
</template>
