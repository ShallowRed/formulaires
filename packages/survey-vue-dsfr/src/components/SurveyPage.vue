<script lang="ts" setup>
import type {
  SurveyQuestionsPageData,
  SurveyResultsPageData,
} from '@shallowred/survey-schema'
import type { Survey } from '../composables/use-survey.js'
import { computed } from 'vue'
import SurveyQuestion from './SurveyQuestion.vue'

const props = defineProps<{
  survey: Survey
}>()

const currentPage = computed(() => props.survey.getCurrentPage())
const visibleQuestionsInCurrentPage = computed(() => props.survey.getVisibleQuestionsInCurrentPage())
</script>

<template>
  <div
    v-if="currentPage"
    data-testid="survey-page"
    class="fr-card fr-p-4w"
  >
    <h2
      v-if="currentPage?.title"
      class="fr-h4 fr-mb-3w"
    >
      {{ currentPage.title }}
    </h2>
    <template v-if="(currentPage as SurveyQuestionsPageData)?.questions">
      <template
        v-for="question in visibleQuestionsInCurrentPage"
        :key="question.id"
      >
        <SurveyQuestion
          :survey="survey"
          :question="question"
          :size="currentPage.title ? 'sm' : 'md'"
        />
      </template>
    </template>
    <template v-else-if="(currentPage as SurveyResultsPageData)?.type === 'intermediary-results'">
      <!-- The engine result display is the host application's concern -->
      <slot
        name="results-page"
        :page="(currentPage as SurveyResultsPageData)"
      />
    </template>
  </div>
</template>
