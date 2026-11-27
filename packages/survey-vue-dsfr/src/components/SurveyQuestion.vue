<script lang="ts" setup>
import type { SurveyQuestionData } from '@shallowred/formulaires-schema'
import type { Survey } from '../composables/use-survey.js'
import { DsfrTooltip } from '@gouvminint/vue-dsfr'
import { computed, customRef, onMounted } from 'vue'
import BooleanQuestion from './BooleanQuestion.vue'
import DateQuestion from './DateQuestion.vue'
import MultiSelectQuestion from './MultiSelectQuestion.vue'
import NumberQuestion from './NumberQuestion.vue'
import RadioButtonQuestion from './RadioButtonQuestion.vue'
import UnknownQuestionType from './UnknownQuestionType.vue'

const props = withDefaults(
  defineProps<{
    survey: Survey
    question: SurveyQuestionData
    size?: 'sm' | 'md'
    required?: boolean
  }>(),
  {
    size: 'md',
    required: false,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: any): void
}>()

/**
 * Reactive model backed by the survey answers
 */
const model = customRef((track, trigger) => {
  return {
    get() {
      track()
      const answer = props.survey.getAnswer(props.question.id)
      if (answer !== undefined && answer !== null) {
        return answer
      }
      return undefined
    },
    set(value) {
      props.survey.setAnswer(props.question.id, value)
      emit('update:model-value', value)
      trigger()
    },
  }
})

const questionComponent = computed(() => {
  const type = props.question.type
  return (
    {
      radio: RadioButtonQuestion,
      boolean: BooleanQuestion,
      checkbox: MultiSelectQuestion,
      number: NumberQuestion,
      date: DateQuestion,
    }[type as string] || UnknownQuestionType
  )
})

onMounted(() => {
  document.querySelectorAll('.sk-survey-question-tooltip').forEach((el) => {
    // Ensure the tooltip is initialized with the correct content
    const tooltip = el as HTMLElement
    if (tooltip.hasAttribute('label')) {
      tooltip.textContent = tooltip.getAttribute('label') || ''
    }
  })
})
</script>

<template>
  <div
    class="sk-survey-question"
    data-testid="survey-question"
    :data-question-id="question.id"
  >
    <hgroup
      :id="`question-${question.id}`"
      :class="[
        {
          'fr-mb-3w': size === 'md',
          'fr-mb-1w': size === 'sm',
        },
      ]"
    >
      <h3
        :class="[
          {
            'fr-h5 fr-mb-1w': size === 'md',
            'fr-text--md fr-mb-1v': size === 'sm',
          },
        ]"
        :aria-describedby="question?.description
          ? `question-description-${question.id}`
          : undefined
        "
      >
        {{ question.title }} <span
          v-if="question.required !== false || required"
          class="sk-required-question-marker"
        >*</span>
      </h3>
      <p
        v-if="question?.description"
        :id="`question-description-${question.id}`"
        class="fr-hint-text fr-mb-0"
        :class="[
          {
            'fr-text--sm': size === 'md',
            'fr-text--xs': size === 'sm',
          },
        ]"
      >
        {{ question.description }}
      </p>
    </hgroup>

    <div
      v-if="question?.tooltip"
      class="sk-survey-question-tooltip-container"
    >
      <DsfrTooltip
        type="button"
        class="sk-survey-question-tooltip fr-btn--secondary"
        data-testid="survey-question-tooltip"
        :content="typeof question.tooltip === 'string' ? question.tooltip : question.tooltip.content"
        :label="(question.tooltip as any)?.buttonLabel ?? 'En savoir plus'"
        :secondary="true"
      />
    </div>
    <component
      :is="questionComponent"
      :key="question.id"
      v-model="model"
      :question="question"
    />
  </div>
</template>

<style scoped>
.sk-survey-question :deep(.fr-hint-text) {
  /* Ensure the hint text wraps properly and takes \n (new lines) into account */
  white-space: pre-wrap;
}

.sk-survey-question-tooltip-container :deep(.fr-btn--tooltip) {
  margin-bottom: 1rem;
  max-width: none !important;
  max-height: none !important;
}

.sk-required-question-marker {
  color: var(--artwork-minor-red-marianne);
  font-weight: bold;
  margin-left: 0.25rem;
}
</style>
