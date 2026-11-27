/**
 * Visibility and required answers of a formulaires-schema v3 questionnaire
 *
 * Each condition compiles into one JSON Schema of the whole answers object, which
 * Ajv2020 evaluates.
 */

import type { ValidateFunction } from 'ajv'
import type {
  JsonSchemaV3,
  SurveyAnswersV3,
  SurveyConditionV3,
  SurveyPageV3,
  SurveyQuestionV3,
  SurveySchemaV3,
  SurveyScopeV3,
} from './types.js'
import addFormats from 'ajv-formats'
import Ajv2020 from 'ajv/dist/2020.js'
import { isLeafConditionV3, isResultsPageV3 } from './types.js'

/**
 * Property names along a `#/properties/<a>/properties/<b>` pointer
 */
export function scopeToPath(scope: SurveyScopeV3): string[] {
  const tokens = scope.replace(/^#\//, '').split('/')
  if (tokens.length % 2 !== 0 || tokens.some((t, i) => i % 2 === 0 && t !== 'properties')) {
    throw new Error(`Unsupported scope: ${scope}`)
  }
  return tokens
    .filter((_, i) => i % 2 === 1)
    .map(t => t.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/**
 * Schema of the answers object that holds when the answer at `scope` exists and is
 * valid against `schema` (`true` checks presence only)
 */
export function scopedSchema(scope: SurveyScopeV3, schema: JsonSchemaV3): Record<string, unknown> {
  const names = scopeToPath(scope)
  let result: JsonSchemaV3 = schema
  for (let index = names.length - 1; index >= 0; index--) {
    const name = names[index]
    const level: Record<string, unknown> = { required: [name] }
    if (result !== true) {
      level.properties = { [name]: result }
    }
    // The root is the answers object; nested levels must be objects
    if (index > 0) {
      level.type = 'object'
    }
    result = level
  }
  return result as Record<string, unknown>
}

/**
 * JSON Schema of the answers object equivalent to a v3 condition
 */
export function compileConditionV3(condition: SurveyConditionV3): Record<string, unknown> {
  if (isLeafConditionV3(condition)) {
    return scopedSchema(condition.scope, condition.schema)
  }
  if ('allOf' in condition) {
    return { allOf: condition.allOf.map(compileConditionV3) }
  }
  if ('anyOf' in condition) {
    return { anyOf: condition.anyOf.map(compileConditionV3) }
  }
  return { not: compileConditionV3(condition.not) }
}

/**
 * Ajv2020 instance with formats, which evaluates the conditions and validates the answers
 */
export function createConditionsAjv(): Ajv2020 {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  return ajv
}

let sharedAjv: Ajv2020 | undefined
const compiled = new WeakMap<SurveyConditionV3, ValidateFunction>()

function conditionValidator(condition: SurveyConditionV3): ValidateFunction {
  let validate = compiled.get(condition)
  if (!validate) {
    sharedAjv ??= createConditionsAjv()
    validate = sharedAjv.compile(compileConditionV3(condition))
    compiled.set(condition, validate)
  }
  return validate
}

/**
 * Whether a condition holds for the given answers
 */
export function evaluateConditionV3(condition: SurveyConditionV3, answers: SurveyAnswersV3): boolean {
  return conditionValidator(condition)(answers) as boolean
}

/**
 * A question without condition is visible
 */
export function isQuestionVisible(question: SurveyQuestionV3, answers: SurveyAnswersV3): boolean {
  return question.visibleWhen === undefined || evaluateConditionV3(question.visibleWhen, answers)
}

/**
 * A questions page is visible when one of its questions is; a results page always is
 */
export function isPageVisible(page: SurveyPageV3, answers: SurveyAnswersV3): boolean {
  return isResultsPageV3(page) || page.questions.some(q => isQuestionVisible(q, answers))
}

function allQuestions(questionnaire: SurveySchemaV3): SurveyQuestionV3[] {
  return questionnaire.steps.flatMap(step =>
    step.pages.flatMap(page => (isResultsPageV3(page) ? [] : page.questions)),
  )
}

/**
 * Visible questions, in questionnaire order
 */
export function visibleQuestions(questionnaire: SurveySchemaV3, answers: SurveyAnswersV3): SurveyQuestionV3[] {
  return allQuestions(questionnaire).filter(q => isQuestionVisible(q, answers))
}

/**
 * Value along property names, `undefined` when it or one of its parents is absent
 */
function valueAt(answers: SurveyAnswersV3, names: string[]): unknown {
  return names.reduce<unknown>(
    (value, name) => (value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[name] : undefined),
    answers,
  )
}

function answerAt(answers: SurveyAnswersV3, scope: SurveyScopeV3): unknown {
  return valueAt(answers, scopeToPath(scope))
}

/**
 * Answers without those of the hidden questions, which do not reach the calculation
 */
export function visibleAnswers(questionnaire: SurveySchemaV3, answers: SurveyAnswersV3): SurveyAnswersV3 {
  // Answers are JSON data; a JSON copy also reads through the proxies of a reactive store
  const result = JSON.parse(JSON.stringify(answers)) as SurveyAnswersV3
  for (const question of allQuestions(questionnaire)) {
    if (!isQuestionVisible(question, answers)) {
      const names = scopeToPath(question.scope)
      const parent = valueAt(result, names.slice(0, -1))
      if (parent !== null && typeof parent === 'object') {
        delete (parent as Record<string, unknown>)[names[names.length - 1]]
      }
    }
  }
  return result
}

/**
 * Visible questions whose `required` (true by default) has no answer
 */
export function missingRequiredAnswers(questionnaire: SurveySchemaV3, answers: SurveyAnswersV3): SurveyQuestionV3[] {
  return visibleQuestions(questionnaire, answers)
    .filter(q => q.required !== false && answerAt(answers, q.scope) === undefined)
}
