<script lang="ts" setup>
import type { JsonFormsRendererRegistryEntry, UISchemaElement, ValidationMode } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/formulaires-vue-dsfr'
import { computed, ref } from 'vue'
import CodeBlock from './CodeBlock.vue'
import FormFrame from './FormFrame.vue'

const props = withDefaults(defineProps<{
  schema: Record<string, unknown>
  uischema?: UISchemaElement
  data?: Record<string, unknown>
  validationMode?: ValidationMode
  renderers?: readonly JsonFormsRendererRegistryEntry[]
}>(), {
  uischema: undefined,
  data: () => ({}),
  validationMode: 'ValidateAndHide',
  renderers: () => dsfrRenderers,
})

const ajv = createAjv2020()
const answers = ref<Record<string, unknown>>(structuredClone(props.data))

const schemaJson = computed(() => JSON.stringify(props.schema, null, 2))
const uischemaJson = computed(() => props.uischema && JSON.stringify(props.uischema, null, 2))
const answersJson = computed(() => JSON.stringify(answers.value, null, 2))
</script>

<template>
  <div class="fr-grid-row fr-grid-row--gutters">
    <div class="fr-col-12 fr-col-xl-6">
      <slot name="source">
        <h3 class="fr-h6 fr-mb-1w">
          JSON Schema
        </h3>
        <CodeBlock :code="schemaJson" language="json" />
        <template v-if="uischemaJson">
          <h3 class="fr-h6 fr-mt-3w fr-mb-1w">
            Uischema
          </h3>
          <CodeBlock :code="uischemaJson" language="json" />
        </template>
      </slot>
    </div>
    <div class="fr-col-12 fr-col-xl-6">
      <h3 class="fr-h6 fr-mb-1w">
        Formulaire
      </h3>
      <FormFrame scrollable>
        <form
          novalidate
          @submit.prevent
        >
          <JsonForms
            :data="answers"
            :schema="schema"
            :uischema="uischema"
            :renderers="renderers"
            :ajv="ajv"
            :i18n="dsfrI18n"
            :validation-mode="validationMode"
            @change="event => answers = event.data"
          />
        </form>
      </FormFrame>
      <slot
        name="result"
        :answers="answers"
      >
        <h3 class="fr-h6 fr-mt-3w fr-mb-1w">
          Réponses
        </h3>
        <CodeBlock :code="answersJson" language="json" />
      </slot>
    </div>
  </div>
</template>
