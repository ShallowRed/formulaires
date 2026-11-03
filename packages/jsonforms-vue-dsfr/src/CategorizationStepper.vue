<script setup lang="ts">
import type { Categorization, Category, ControlElement, JsonSchema, Layout, UISchemaElement } from '@jsonforms/core'
import { isVisible, toDataPathSegments } from '@jsonforms/core'
import { DsfrAlert, DsfrButton, DsfrStepper } from '@gouvminint/vue-dsfr'
import { DispatchRenderer, rendererProps, useJsonForms, useJsonFormsLayout } from '@jsonforms/vue'
import { computed, nextTick, ref } from 'vue'

interface Page {
  step: string
  category: Category
}

const props = defineProps(rendererProps<Layout>())
const { layout } = useJsonFormsLayout(props)
const jsonforms = useJsonForms()

// Steps are the Categorization children of the root, pages the Category inside them;
// a Category at the root is a step with a single page
const pages = computed<Page[]>(() => ((layout.value.uischema as Categorization).elements ?? []).flatMap(element =>
  element.type === 'Categorization'
    ? (element as Categorization).elements.map(category => ({ step: element.label as string, category: category as Category }))
    : [{ step: element.label as string, category: element as Category }],
))

function visible(element: UISchemaElement): boolean {
  const core = jsonforms.core!
  return isVisible(element, core.data, layout.value.path, core.ajv!, jsonforms.config)
}

const visiblePages = computed(() => pages.value.filter(page => visible(page.category)))
const steps = computed(() => [...new Set(visiblePages.value.map(page => page.step))])

const currentIndex = ref(0)
const current = computed(() => visiblePages.value[Math.min(currentIndex.value, visiblePages.value.length - 1)])
const isLast = computed(() => currentIndex.value >= visiblePages.value.length - 1)

function controlsOf(element: UISchemaElement): ControlElement[] {
  if (element.type === 'Control') {
    return [element as ControlElement]
  }
  return ((element as Layout).elements ?? []).flatMap(controlsOf)
}

function propertyOf(scope: string): string {
  return toDataPathSegments(scope)[0]!
}

// Answers the page still lacks, read from the errors JSON Forms computes on the whole form
const pageErrors = computed(() => {
  if (!current.value) {
    return []
  }
  const errors = jsonforms.core?.errors ?? []
  const schema = jsonforms.core!.schema as JsonSchema & { properties?: Record<string, JsonSchema> }
  return controlsOf(current.value.category)
    .filter(control => visible(control))
    .map(control => propertyOf(control.scope))
    .filter(property => errors.some(error =>
      error.instancePath === `/${property}`
      || error.instancePath.startsWith(`/${property}/`)
      || (error.keyword === 'required' && error.instancePath === '' && error.params.missingProperty === property),
    ))
    .map(property => schema.properties?.[property]?.title ?? property)
})

const showErrors = ref(false)
const pageContainer = ref<HTMLElement | null>(null)
const announcement = ref('')

function goTo(index: number) {
  currentIndex.value = index
  showErrors.value = false
  nextTick(() => {
    pageContainer.value?.focus()
    announcement.value = `Page ${currentIndex.value + 1} sur ${visiblePages.value.length} : ${current.value?.category.label || current.value?.step}`
  })
}

function next() {
  if (pageErrors.value.length > 0) {
    showErrors.value = true
    return
  }
  if (isLast.value) {
    pageContainer.value?.dispatchEvent(new CustomEvent('categorization-complete', { bubbles: true, detail: jsonforms.core?.data }))
    return
  }
  goTo(currentIndex.value + 1)
}
</script>

<template>
  <div v-if="layout.visible && current">
    <DsfrStepper
      v-if="steps.length > 1"
      :steps="steps"
      :current-step="steps.indexOf(current.step) + 1"
    />
    <div
      ref="pageContainer"
      class="page"
      tabindex="-1"
    >
      <h3 v-if="current.category.label">
        {{ current.category.label }}
      </h3>
      <DispatchRenderer
        v-for="(element, index) in current.category.elements"
        :key="`${currentIndex}-${index}`"
        :schema="layout.schema"
        :uischema="element"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </div>
    <DsfrAlert
      v-if="showErrors && pageErrors.length > 0"
      class="fr-mb-3w"
      type="error"
      title="Il manque des réponses sur cette page"
      :description="pageErrors.join(', ')"
    />
    <ul class="fr-btns-group fr-btns-group--inline-md fr-mt-4w">
      <li v-if="currentIndex > 0">
        <DsfrButton
          label="Précédent"
          secondary
          type="button"
          @click="goTo(currentIndex - 1)"
        />
      </li>
      <li>
        <DsfrButton
          :label="isLast ? 'Terminer' : 'Suivant'"
          type="button"
          @click="next"
        />
      </li>
    </ul>
    <p
      class="fr-sr-only"
      aria-live="polite"
    >
      {{ announcement }}
    </p>
  </div>
</template>

<style scoped>
.page:focus {
  outline: none;
}
</style>
