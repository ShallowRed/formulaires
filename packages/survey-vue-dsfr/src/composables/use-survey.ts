/**
 * Headless survey state and navigation
 *
 * Port of the aides-simplifiees production store composables
 * (inertia/composables/surveys/*), rescoped to a single survey instance:
 * no Pinia, no analytics, no per-slug maps.
 */

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyDeepStep,
  SurveyNormalizedSchema,
  SurveyPageData,
  SurveyQuestionData,
  SurveyQuestionsPageData,
  SurveyResultsPageData,
  SurveySchema,
} from '@shallowred/formulaires-schema'
import { ConditionEvaluator, SchemaNormalizer } from '@shallowred/formulaires-schema'
import { ref } from 'vue'
import { isAnswerValid } from './validation.js'

export interface UseSurveyOptions {
  /** Initial answers, e.g. to replay a saved case */
  initialAnswers?: SurveyAnswers
}

export type Survey = ReturnType<typeof useSurvey>

export function useSurvey(rawSchema: SurveySchema, options: UseSurveyOptions = {}) {
  const normalizer = new SchemaNormalizer()
  const schema: SurveyNormalizedSchema = normalizer.normalize(rawSchema)
  const evaluator = new ConditionEvaluator()

  const answers = ref<SurveyAnswers>({ ...options.initialAnswers })
  const currentPageId = ref<string | null>(null)

  /**
   * Questions
   */

  function getQuestions(): SurveyQuestionData[] {
    return schema.steps.flatMap(step =>
      step.pages.flatMap(page => (page as SurveyQuestionsPageData).questions ?? []),
    )
  }

  function findQuestionById(questionId: string): SurveyQuestionData | null {
    return getQuestions().find(q => q.id === questionId) ?? null
  }

  /**
   * Visibility
   */

  function isQuestionVisible(questionId: string): boolean {
    const question = findQuestionById(questionId)
    if (!question) {
      return false
    }
    if (question.visibleWhen) {
      // An array of conditions means AND between them
      if (Array.isArray(question.visibleWhen)) {
        return question.visibleWhen.every(condition =>
          evaluator.evaluate(condition, answers.value),
        )
      }
      return evaluator.evaluate(question.visibleWhen, answers.value)
    }
    return true
  }

  function getVisibleQuestions(): SurveyQuestionData[] {
    return getQuestions().filter(question => isQuestionVisible(question.id))
  }

  /**
   * Answers
   */

  function getAnswer(questionId: string): SurveyAnswerValue {
    const answer = answers.value[questionId]
    return answer === undefined ? null : answer
  }

  function hasAnswer(questionId: string): boolean {
    return answers.value[questionId] !== undefined
  }

  function setAnswer(questionId: string, value: SurveyAnswerValue) {
    answers.value[questionId] = value
  }

  /** Answers restricted to currently visible questions, as sent to the engine */
  function getAnswersForCalculation(): SurveyAnswers {
    return Object.fromEntries(
      Object.entries(answers.value).filter(([questionId, answer]) => {
        return findQuestionById(questionId)
          && isQuestionVisible(questionId)
          && answer !== undefined
      }),
    )
  }

  /**
   * Pages
   */

  function getAllPages(): SurveyPageData[] {
    return schema.steps.flatMap(step => step.pages || [])
  }

  function getAllQuestionsPages(): SurveyQuestionsPageData[] {
    return getAllPages()
      .filter(page => (page as SurveyQuestionsPageData).questions !== undefined) as SurveyQuestionsPageData[]
  }

  function setCurrentPageId(pageId: string) {
    currentPageId.value = pageId
  }

  function setFirstPage() {
    const firstPage = getAllQuestionsPages()
      .find(page => page.questions?.some(question => isQuestionVisible(question.id)))
    if (firstPage) {
      setCurrentPageId(firstPage.id)
    }
  }

  function getCurrentPage(): SurveyPageData | null {
    if (currentPageId.value === null) {
      setFirstPage()
    }
    return getAllPages().find(page => page.id === currentPageId.value) ?? null
  }

  /** A page is visible if any of its questions is, or if it shows results */
  function isPageVisible(page: SurveyPageData): boolean {
    if ((page as SurveyResultsPageData).type === 'intermediary-results') {
      return true
    }
    return (page as SurveyQuestionsPageData).questions
      ?.some(question => isQuestionVisible(question.id)) ?? false
  }

  function getNextVisiblePage(): SurveyPageData | null {
    const currentPage = getCurrentPage()
    if (!currentPage) {
      return null
    }
    const allPages = getAllPages()
    const currentIndex = allPages.findIndex(page => page.id === currentPage.id)
    if (currentIndex === -1) {
      return null
    }
    for (let i = currentIndex + 1; i < allPages.length; i++) {
      if (isPageVisible(allPages[i])) {
        return allPages[i]
      }
    }
    return null
  }

  function getPreviousVisiblePage(): SurveyPageData | null {
    const currentPage = getCurrentPage()
    if (!currentPage) {
      return null
    }
    const allPages = getAllPages()
    const currentIndex = allPages.findIndex(page => page.id === currentPage.id)
    if (currentIndex === -1) {
      return null
    }
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (isPageVisible(allPages[i])) {
        return allPages[i]
      }
    }
    return null
  }

  function isFirstPage(): boolean {
    return getPreviousVisiblePage() === null
  }

  function isLastPage(): boolean {
    return getNextVisiblePage() === null
  }

  function goToNextPage(): boolean {
    const nextPage = getNextVisiblePage()
    if (nextPage) {
      setCurrentPageId(nextPage.id)
      return true
    }
    return false
  }

  function goToPreviousPage(): boolean {
    const previousPage = getPreviousVisiblePage()
    if (previousPage) {
      setCurrentPageId(previousPage.id)
      return true
    }
    return false
  }

  /**
   * Steps
   */

  function getAllSteps(): SurveyDeepStep[] {
    return schema.steps
  }

  function getCurrentStepIndex(): number | null {
    const currentPage = getCurrentPage()
    if (!currentPage) {
      return null
    }
    const stepIndex = schema.steps
      .findIndex(step => step.pages.some(page => page.id === currentPage.id))
    return stepIndex === -1 ? null : stepIndex
  }

  /**
   * Validation
   */

  function getVisibleQuestionsInCurrentPage(): SurveyQuestionData[] {
    const currentPage = getCurrentPage()
    if (!currentPage) {
      return []
    }
    return ((currentPage as SurveyQuestionsPageData).questions ?? [])
      .filter(question => isQuestionVisible(question.id))
  }

  function areAllQuestionsInPageValid(): boolean {
    return getVisibleQuestionsInCurrentPage()
      .every(question => isAnswerValid(question, getAnswer(question.id)))
  }

  function areAllRequiredQuestionsAnswered(): boolean {
    return getVisibleQuestions()
      .filter(question => question.required !== false)
      .every(question => hasAnswer(question.id))
  }

  /**
   * Progress
   */

  function getProgress(): number {
    const questions = getQuestions()
    let visibleQuestionsCount = questions
      .filter(question => isQuestionVisible(question.id)).length
    if (visibleQuestionsCount === 0) {
      visibleQuestionsCount = questions.length
    }
    const answeredVisibleQuestionsCount = Object.keys(answers.value)
      .filter(questionId => isQuestionVisible(questionId)).length
    return Math.min(
      Math.round((answeredVisibleQuestionsCount / visibleQuestionsCount) * 100),
      100,
    )
  }

  function reset() {
    answers.value = {}
    setFirstPage()
  }

  return {
    schema,
    answers,
    currentPageId,
    // Questions
    getQuestions,
    findQuestionById,
    isQuestionVisible,
    getVisibleQuestions,
    // Answers
    getAnswer,
    hasAnswer,
    setAnswer,
    getAnswersForCalculation,
    // Pages
    getAllPages,
    getCurrentPage,
    setCurrentPageId,
    setFirstPage,
    getNextVisiblePage,
    getPreviousVisiblePage,
    isFirstPage,
    isLastPage,
    goToNextPage,
    goToPreviousPage,
    // Steps
    getAllSteps,
    getCurrentStepIndex,
    // Validation
    getVisibleQuestionsInCurrentPage,
    areAllQuestionsInPageValid,
    areAllRequiredQuestionsAnswered,
    // Progress
    getProgress,
    reset,
  }
}
