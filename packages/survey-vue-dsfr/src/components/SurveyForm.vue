<script lang="ts" setup>
import type { DsfrButtonProps } from '@gouvminint/vue-dsfr'
import type { Survey } from '../composables/use-survey.js'
import { DsfrStepper } from '@gouvminint/vue-dsfr'
import { computed, nextTick, onMounted, ref } from 'vue'
import SurveyNavigation from './SurveyNavigation.vue'
import SurveyPage from './SurveyPage.vue'

const props = defineProps<{
  survey: Survey
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const currentPage = computed(() => props.survey.getCurrentPage())
const isLastPage = computed(() => props.survey.isLastPage())
const areAllRequiredQuestionsAnswered = computed(() => props.survey.areAllRequiredQuestionsAnswered())
const currentStepIndex = computed(() => props.survey.getCurrentStepIndex())
const areAllQuestionsInPageValid = computed(() => props.survey.areAllQuestionsInPageValid())

const stepTitles = computed(() => {
  return props.survey.schema.steps.map(step => step.title).filter(Boolean)
})

const pageContainer = ref<HTMLElement | null>(null)
const formContainer = ref<HTMLElement | null>(null)
const surveyPageChangeAnnouncer = ref<HTMLElement | null>(null)

/**
 * When the user navigates to a new page, focus the page container for tab
 * navigation and announce the new page to screen readers.
 */
function focusRenderedSurveyPage() {
  nextTick(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formContainer.value?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    pageContainer.value?.focus()

    if (surveyPageChangeAnnouncer.value && currentPage.value?.title) {
      surveyPageChangeAnnouncer.value.textContent = `Page : ${currentPage.value.title}`
    }
  })
}
onMounted(() => {
  focusRenderedSurveyPage()
})

function handleNext() {
  if (props.survey.goToNextPage()) {
    focusRenderedSurveyPage()
  }
}

function handlePrevious() {
  if (props.survey.goToPreviousPage()) {
    focusRenderedSurveyPage()
  }
}

function handleComplete() {
  if (props.survey.areAllRequiredQuestionsAnswered()) {
    emit('complete')
  }
}

/**
 * Enter moves to the next page (or completes on the last page), except when
 * the focus is on a control that consumes the key.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || !areAllQuestionsInPageValid.value) {
    return
  }
  const isDesiredTarget = !(event.target instanceof HTMLButtonElement)
    && !(event.target instanceof HTMLTextAreaElement)
    && !(event.target instanceof HTMLInputElement && event.target.type === 'search')
    && !(event.target instanceof HTMLSelectElement)
  if (!isDesiredTarget) {
    return
  }
  event.preventDefault()
  if (!isLastPage.value) {
    handleNext()
  }
  else {
    handleComplete()
  }
}

const showNextBtn = computed(() => !isLastPage.value)
const showFinishBtn = computed(() => isLastPage.value && areAllRequiredQuestionsAnswered.value)

const buttons = computed(() => ([
  {
    label: 'Précédent',
    secondary: true,
    icon: { name: 'ri:arrow-left-line', ssr: true },
    disabled: props.survey.isFirstPage(),
    onClick: handlePrevious,
  },
  showNextBtn.value
    ? {
        label: 'Suivant',
        iconRight: true,
        icon: { name: 'ri:arrow-right-line', ssr: true },
        disabled: !areAllQuestionsInPageValid.value,
        onClick: handleNext,
      }
    : null,
  showFinishBtn.value
    ? {
        label: 'Terminer',
        iconRight: true,
        icon: { name: 'ri:arrow-right-line', ssr: true },
        onClick: handleComplete,
      }
    : null,
].filter(Boolean) as DsfrButtonProps[]))
</script>

<template>
  <div ref="formContainer">
    <!-- Live region for announcing survey page changes to screen readers -->
    <div
      ref="surveyPageChangeAnnouncer"
      class="fr-sr-only"
      aria-live="polite"
      aria-atomic="true"
    />

    <DsfrStepper
      v-if="Number.isInteger(currentStepIndex)"
      :steps="stepTitles"
      :current-step="(currentStepIndex as number) + 1"
    />
    <div
      ref="pageContainer"
      tabindex="-1"
      data-testid="survey-page-container"
      @keydown="onKeydown"
    >
      <SurveyPage :survey="survey">
        <template #results-page="slotProps">
          <slot
            name="results-page"
            v-bind="slotProps"
          />
        </template>
      </SurveyPage>
    </div>
    <SurveyNavigation :buttons="buttons" />
  </div>
</template>
