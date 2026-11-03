<script setup lang="ts">
import type { ControlElement, GroupLayout, UISchemaElement } from '@jsonforms/core'
import { findUISchema, Generate } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsControlWithDetail } from '@jsonforms/vue'
import { computed } from 'vue'

const props = defineProps(rendererProps<ControlElement>())
const { control } = useJsonFormsControlWithDetail(props)

const detailUiSchema = computed<UISchemaElement>(() => findUISchema(
  control.value.uischemas,
  control.value.schema,
  control.value.uischema.scope,
  control.value.path,
  () => {
    const generated = Generate.uiSchema(control.value.schema, 'Group', undefined, control.value.rootSchema)
    if (control.value.path) {
      (generated as GroupLayout).label = control.value.label
    }
    else {
      generated.type = 'VerticalLayout'
    }
    return generated
  },
  control.value.uischema,
  control.value.rootSchema,
))
</script>

<template>
  <DispatchRenderer
    v-if="control.visible"
    :visible="control.visible"
    :enabled="control.enabled"
    :schema="control.schema"
    :uischema="detailUiSchema"
    :path="control.path"
    :renderers="control.renderers"
    :cells="control.cells"
  />
</template>
