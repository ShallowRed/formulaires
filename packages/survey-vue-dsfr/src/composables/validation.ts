/**
 * Per-question answer validation
 *
 * Port of the aides-simplifiees production validation service
 * (inertia/services/validation_service.ts).
 */

import type { SurveyAnswerValue, SurveyQuestionData } from '@shallowred/survey-schema'

export function isAnswerValid(question: SurveyQuestionData, answer: SurveyAnswerValue): boolean {
  if (!question) {
    return false
  }

  // Questions are required unless explicitly marked otherwise
  const isRequired = question.required !== false

  if (!isRequired && (answer === undefined || answer === null || answer === '')) {
    return true
  }

  switch (question.type) {
    case 'radio':
    case 'date':
      // For radio and date, any non-empty value is valid
      return !!answer
    case 'boolean':
      // For boolean, both true and false are valid answers
      return answer === true || answer === false
    case 'checkbox':
      // For checkbox, the answer should be an array with at least one item
      return Array.isArray(answer) && answer.length > 0
    case 'number':
      // For number, we need to check if it's a number including 0
      return answer === 0 || !!answer
    case 'combobox':
      return answer !== undefined && answer !== null && answer !== ''
    default:
      return false
  }
}
