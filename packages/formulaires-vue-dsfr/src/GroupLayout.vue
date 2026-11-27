<script setup lang="ts">
import type { GroupLayout } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsLayout } from '@jsonforms/vue'
import FieldHint from './FieldHint.vue'
import RequiredFieldsNotice from './RequiredFieldsNotice.vue'
import { useRequiredNotice } from './notice'

const props = defineProps(rendererProps<GroupLayout>())
const { layout } = useJsonFormsLayout(props)
const showsNotice = useRequiredNotice(props.uischema, () => layout.value.path)
</script>

<template>
  <RequiredFieldsNotice v-if="layout.visible && showsNotice(layout.uischema)" />
  <fieldset
    v-if="layout.visible"
    class="fr-fieldset jsonforms-dsfr-fieldset"
  >
    <legend
      v-if="layout.label"
      class="fr-fieldset__legend"
    >
      {{ layout.label }}
      <FieldHint :control="{ schema: layout.schema }" />
    </legend>
    <!-- A single element keeps the questions spaced as they are outside a group -->
    <div class="fr-fieldset__element">
      <DispatchRenderer
        v-for="(element, index) in (layout.uischema as GroupLayout).elements"
        :key="`${layout.path}-${index}`"
        :schema="layout.schema"
        :uischema="element"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </div>
  </fieldset>
</template>

