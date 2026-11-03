/**
 * Type definitions for survey-schema v3
 *
 * A v3 questionnaire describes the order and presentation of questions. The data
 * itself (titles, types, choices, defaults) is described by a JSON Schema 2020-12
 * of the answers, which every `scope` points into.
 */

/**
 * JSON Schema value, as accepted by Ajv
 */
export type JsonSchemaV3 = boolean | { [keyword: string]: unknown }

/**
 * JSON pointer into the answers schema, of the form `#/properties/<id>`
 */
export type SurveyScopeV3 = `#/properties/${string}`

/**
 * Leaf condition: holds when the answer designated by `scope` exists and is valid
 * against `schema`
 */
export interface SurveyLeafConditionV3 {
  scope: SurveyScopeV3
  schema: JsonSchemaV3
}

export interface SurveyAllOfConditionV3 {
  allOf: SurveyConditionV3[]
}

export interface SurveyAnyOfConditionV3 {
  anyOf: SurveyConditionV3[]
}

export interface SurveyNotConditionV3 {
  not: SurveyConditionV3
}

/**
 * Visibility condition: a leaf, or a combination with the JSON Schema meaning of
 * `allOf`, `anyOf` and `not`
 */
export type SurveyConditionV3
  = | SurveyLeafConditionV3
    | SurveyAllOfConditionV3
    | SurveyAnyOfConditionV3
    | SurveyNotConditionV3

export type SurveyTooltipV3 = string | { buttonLabel?: string, content: string }

export interface SurveyNotionV3 {
  id: string
  buttonLabel?: string
}

export interface SurveyChoiceOptionsV3 {
  tooltip?: SurveyTooltipV3
  /** Selecting this choice deselects the others (checkbox questions) */
  exclusive?: boolean
}

export interface SurveyQuestionV3 {
  scope: SurveyScopeV3
  visibleWhen?: SurveyConditionV3
  /** A visible required question must be answered (default: true) */
  required?: boolean
  placeholder?: string
  tooltip?: SurveyTooltipV3
  notion?: SurveyNotionV3
  additionalNotions?: SurveyNotionV3[]
  /** Presentation of the choices, keyed by choice value */
  choices?: Record<string, SurveyChoiceOptionsV3>
  /** Name of a suggestion source that the renderer provides */
  autocomplete?: { source: string }
}

export interface SurveyQuestionsPageV3 {
  id: string
  title?: string
  description?: string
  questions: SurveyQuestionV3[]
}

export interface SurveyResultsOutputV3 {
  id: string
  title: string
  description?: string
}

export interface SurveyResultsPageV3 {
  id: string
  type: 'intermediary-results'
  title?: string
  description?: string
  /** Outputs of the rule that the page displays */
  outputs: SurveyResultsOutputV3[]
}

export type SurveyPageV3 = SurveyQuestionsPageV3 | SurveyResultsPageV3

export interface SurveyStepV3 {
  id: string
  title: string
  pages: SurveyPageV3[]
}

export interface SurveySchemaV3 {
  schemaVersion: '3.0.0'
  id: string
  version: string
  title: string
  description?: string
  /** Path of the JSON Schema 2020-12 of the answers */
  data: string
  steps: SurveyStepV3[]
}

/**
 * Answers of a v3 questionnaire: the object that the answers schema describes
 */
export type SurveyAnswersV3 = Record<string, unknown>

export function isResultsPageV3(page: SurveyPageV3): page is SurveyResultsPageV3 {
  return 'type' in page && page.type === 'intermediary-results'
}

export function isLeafConditionV3(condition: SurveyConditionV3): condition is SurveyLeafConditionV3 {
  return 'scope' in condition
}
