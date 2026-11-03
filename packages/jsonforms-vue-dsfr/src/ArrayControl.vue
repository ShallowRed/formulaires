<script setup lang="ts">
import type { ControlElement, JsonSchema, UISchemaElement } from '@jsonforms/core'
import { composePaths, createDefaultValue, findUISchema, Resolve } from '@jsonforms/core'
import { DsfrButton } from '@gouvminint/vue-dsfr'
import { DispatchRenderer, rendererProps, useJsonFormsArrayControl } from '@jsonforms/vue'
import { computed, ref } from 'vue'
import FieldHint from './FieldHint.vue'
import { fieldLabel } from './labels'

const props = defineProps(rendererProps<ControlElement>())
const { control, addItem, removeItems } = useJsonFormsArrayControl(props)

const arraySchema = computed<JsonSchema | undefined>(() => Resolve.schema(props.schema, control.value.uischema.scope, control.value.rootSchema))
const items = computed<unknown[]>(() => control.value.data ?? [])
const itemTitle = computed(() => control.value.schema.title ?? 'Élément')
const minItemsReached = computed(() => items.value.length <= (arraySchema.value?.minItems ?? 0))
const maxItemsReached = computed(() => arraySchema.value?.maxItems !== undefined && items.value.length >= arraySchema.value.maxItems)

const itemUiSchema = computed<UISchemaElement>(() => findUISchema(
  control.value.uischemas,
  control.value.schema,
  control.value.uischema.scope,
  control.value.path,
  undefined,
  control.value.uischema,
  control.value.rootSchema,
))

// Screen readers hear each change of the list, which a sighted person sees at once
const announcement = ref('')

function add() {
  const position = items.value.length + 1
  addItem(control.value.path, createDefaultValue(control.value.schema, control.value.rootSchema))()
  announcement.value = `${itemTitle.value} ${position} ajouté`
}

function remove(index: number) {
  removeItems?.(control.value.path, [index])()
  announcement.value = `${itemTitle.value} ${index + 1} supprimé`
}
</script>

<template>
  <fieldset
    v-if="control.visible"
    class="fr-fieldset jsonforms-dsfr-fieldset"
  >
    <legend class="fr-fieldset__legend">
      {{ fieldLabel(control) }}
      <FieldHint :control="{ description: control.description, schema: arraySchema ?? control.schema, uischema: control.uischema }" />
    </legend>
    <div
      v-for="(_, index) in items"
      :key="`${control.path}-${index}`"
      class="fr-fieldset__element array-item"
    >
      <p class="fr-text--bold fr-mb-2w">
        {{ itemTitle }} {{ index + 1 }}
      </p>
      <DispatchRenderer
        :schema="control.schema"
        :uischema="itemUiSchema"
        :path="composePaths(control.path, `${index}`)"
        :enabled="control.enabled"
        :renderers="control.renderers"
        :cells="control.cells"
      />
      <DsfrButton
        :label="`Supprimer « ${itemTitle} ${index + 1} »`"
        :disabled="!control.enabled || minItemsReached"
        class="fr-mt-1w"
        icon="fr-icon-delete-line"
        tertiary
        size="sm"
        type="button"
        @click="remove(index)"
      />
    </div>
    <div class="fr-fieldset__element">
      <p
        v-if="control.errors"
        class="fr-error-text"
      >
        {{ control.errors }}
      </p>
      <DsfrButton
        :label="`Ajouter un élément pour « ${control.label} »`"
        :disabled="!control.enabled || maxItemsReached"
        icon="fr-icon-add-line"
        secondary
        type="button"
        @click="add"
      />
    </div>
    <p
      class="fr-sr-only"
      aria-live="polite"
    >
      {{ announcement }}
    </p>
  </fieldset>
</template>

<style scoped>
.array-item {
  padding: 1.5rem;
  /* The border lines up with the fields, which the DSFR indents by 0.5rem */
  margin: 0 0.5rem 1rem;
  border: 1px solid var(--border-default-grey);
}
</style>
