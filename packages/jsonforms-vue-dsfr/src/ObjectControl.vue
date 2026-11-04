<script setup lang="ts">
import type { ControlElement, GroupLayout, UISchemaElement } from '@jsonforms/core'
import { createDefaultValue, findUISchema, Generate, Resolve } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonForms, useJsonFormsControlWithDetail } from '@jsonforms/vue'
import { computed, watchEffect } from 'vue'
import { isRequired } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control, handleChange } = useJsonFormsControlWithDetail(props)

const jsonforms = useJsonForms()

function parentExists(path: string): boolean {
  const segments = path.split('.')
  const parent = segments.length > 1 ? Resolve.data(jsonforms.core?.data, segments.slice(0, -1).join('.')) : jsonforms.core?.data
  return parent !== null && typeof parent === 'object'
}

// An answer is a value other than an absent value, an empty list, or an object whose values hold no answer
function holdsAnswer(data: unknown): boolean {
  if (data === undefined || data === null) {
    return false
  }
  if (Array.isArray(data)) {
    return data.length > 0
  }
  return typeof data !== 'object' || Object.values(data).some(holdsAnswer)
}

// Ajv checks the fields of an object only once the object exists, and schemas rarely carry `default: {}`: a required
// object starts empty here when the object around it exists, so that each of its fields reports its own missing
// answer. An object without any answer leaves the data once it is hidden or optional, so that it blocks nothing.
watchEffect(() => {
  const { path, visible, data, schema, rootSchema } = control.value
  if (!path) {
    return
  }
  const required = visible && isRequired(control.value)
  if (required && data === undefined && parentExists(path)) {
    handleChange(path, createDefaultValue(schema, rootSchema))
  }
  else if (!required && data !== undefined && !holdsAnswer(data)) {
    handleChange(path, undefined)
  }
})

const detailUiSchema = computed<UISchemaElement>(() => findUISchema(
  control.value.uischemas,
  control.value.schema,
  control.value.uischema.scope,
  control.value.path,
  () => {
    // For a schema with combinators, JSON Forms generates one control of the whole object, which would render this
    // object again: the fields come from its properties only, so that a field declared in a branch of anyOf or oneOf
    // is left out, and allOf keeps constraining the properties
    const { allOf, anyOf, oneOf, ...fields } = control.value.schema
    const generated = Generate.uiSchema(fields, 'Group', undefined, control.value.rootSchema)
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
    :enabled="control.enabled"
    :schema="control.schema"
    :uischema="detailUiSchema"
    :path="control.path"
    :renderers="control.renderers"
    :cells="control.cells"
  />
</template>
