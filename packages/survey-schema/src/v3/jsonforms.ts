/**
 * Compilation of a survey-schema v3 questionnaire into the schema and uischema that
 * the core of JSON Forms renders
 *
 * The output copies conditions in three places: the rule of each control, the rule
 * of each page whose questions are all conditional, and the `if`/`then` that make a
 * visible question required. The questionnaire holds each condition once.
 */

import type {
  JsonSchemaV3,
  SurveyConditionV3,
  SurveyPageV3,
  SurveyQuestionV3,
  SurveyResultsOutputV3,
  SurveySchemaV3,
} from './types.js'
import { isLeafConditionV3, isResultsPageV3 } from './types.js'
import { compileConditionV3, scopedSchema, scopeToPath } from './visibility.js'

export interface JsonFormsSchemaConditionV3 {
  scope: string
  schema: JsonSchemaV3
  failWhenUndefined: true
}

export interface JsonFormsComposedConditionV3 {
  type: 'AND' | 'OR'
  conditions: JsonFormsConditionV3[]
}

export type JsonFormsConditionV3 = JsonFormsSchemaConditionV3 | JsonFormsComposedConditionV3

export interface JsonFormsRuleV3 {
  effect: 'SHOW'
  condition: JsonFormsConditionV3
}

export interface JsonFormsControlV3 {
  type: 'Control'
  scope: string
  options?: Record<string, unknown>
  rule?: JsonFormsRuleV3
}

export interface JsonFormsLabelV3 {
  type: 'Label'
  text: string
}

export interface JsonFormsIntermediaryResultsV3 {
  type: 'IntermediaryResults'
  options: { outputs: SurveyResultsOutputV3[] }
}

export interface JsonFormsCategoryV3 {
  type: 'Category'
  label: string
  options: { id: string }
  rule?: JsonFormsRuleV3
  elements: (JsonFormsControlV3 | JsonFormsLabelV3 | JsonFormsIntermediaryResultsV3)[]
}

export interface JsonFormsCategorizationV3 {
  type: 'Categorization'
  label: string
  options: Record<string, unknown>
  elements: (JsonFormsCategorizationV3 | JsonFormsCategoryV3)[]
}

export interface JsonFormsOutputV3 {
  /** Answers schema, with the required answers of visible questions */
  schema: Record<string, unknown>
  uischema: JsonFormsCategorizationV3
}

/**
 * JSON Forms condition equivalent to a v3 condition
 */
export function toJsonFormsCondition(condition: SurveyConditionV3): JsonFormsConditionV3 {
  if (isLeafConditionV3(condition)) {
    return { scope: condition.scope, schema: condition.schema, failWhenUndefined: true }
  }
  if ('allOf' in condition) {
    return { type: 'AND', conditions: condition.allOf.map(toJsonFormsCondition) }
  }
  if ('anyOf' in condition) {
    return { type: 'OR', conditions: condition.anyOf.map(toJsonFormsCondition) }
  }
  // JSON Forms has no NOT: the negation is evaluated on the whole answers object,
  // where an absent answer makes it hold
  return { scope: '#', schema: { not: compileConditionV3(condition.not) }, failWhenUndefined: true }
}

function controlOptions(question: SurveyQuestionV3): Record<string, unknown> | undefined {
  const options: Record<string, unknown> = {}
  for (const key of ['placeholder', 'tooltip', 'notion', 'additionalNotions', 'autocomplete', 'choices'] as const) {
    if (question[key] !== undefined) {
      options[key] = question[key]
    }
  }
  return Object.keys(options).length > 0 ? options : undefined
}

function control(question: SurveyQuestionV3): JsonFormsControlV3 {
  const element: JsonFormsControlV3 = { type: 'Control', scope: question.scope }
  const options = controlOptions(question) ?? {}
  if (question.visibleWhen) {
    element.rule = { effect: 'SHOW', condition: toJsonFormsCondition(question.visibleWhen) }
    // The data schema requires such an answer through `if`/`then`, which JSON Forms does not
    // read when it marks a field as required: the renderer reads this option instead
    if (question.required !== false) {
      options.required = true
    }
  }
  if (Object.keys(options).length > 0) {
    element.options = options
  }
  return element
}

/**
 * A page whose questions are all conditional is shown when one of them is
 */
function pageRule(questions: SurveyQuestionV3[]): JsonFormsRuleV3 | undefined {
  const questionConditions = questions.map(q => q.visibleWhen)
  if (!questionConditions.every((c): c is SurveyConditionV3 => c !== undefined)) {
    return undefined
  }
  const unique = new Map<string, JsonFormsConditionV3>()
  for (const condition of questionConditions.map(toJsonFormsCondition)) {
    unique.set(JSON.stringify(condition), condition)
  }
  const conditions = [...unique.values()]
  return { effect: 'SHOW', condition: conditions.length === 1 ? conditions[0] : { type: 'OR', conditions } }
}

function category(page: SurveyPageV3): JsonFormsCategoryV3 {
  const result: JsonFormsCategoryV3 = { type: 'Category', label: page.title ?? '', options: { id: page.id }, elements: [] }
  if (page.description) {
    result.elements.push({ type: 'Label', text: page.description })
  }
  if (isResultsPageV3(page)) {
    result.elements.push({ type: 'IntermediaryResults', options: { outputs: page.outputs } })
    return result
  }
  const rule = pageRule(page.questions)
  if (rule) {
    result.rule = rule
  }
  result.elements.push(...page.questions.map(control))
  return result
}

/**
 * Answers schema in which a visible question whose `required` is true (the
 * default) must have an answer
 */
function requiredAnswersSchema(questionnaire: SurveySchemaV3, dataSchema: Record<string, unknown>): Record<string, unknown> {
  const required = new Set<string>(Array.isArray(dataSchema.required) ? dataSchema.required : [])
  const allOf: unknown[] = Array.isArray(dataSchema.allOf) ? [...dataSchema.allOf] : []
  for (const step of questionnaire.steps) {
    for (const page of step.pages) {
      for (const question of isResultsPageV3(page) ? [] : page.questions) {
        if (question.required === false) {
          continue
        }
        if (question.visibleWhen) {
          allOf.push({ if: compileConditionV3(question.visibleWhen), then: scopedSchema(question.scope, true) })
        }
        else if (scopeToPath(question.scope).length === 1) {
          required.add(scopeToPath(question.scope)[0])
        }
        else {
          allOf.push(scopedSchema(question.scope, true))
        }
      }
    }
  }
  const schema: Record<string, unknown> = { ...dataSchema }
  if (required.size > 0) {
    schema.required = [...required]
  }
  if (allOf.length > 0) {
    schema.allOf = allOf
  }
  return schema
}

/**
 * Schema and uischema for JSON Forms: steps and pages as nested `Categorization`
 * and `Category`, a `SHOW` rule per conditional question and per page whose
 * questions are all conditional, an `IntermediaryResults` element per results page
 */
export function compileV3ToJsonForms(questionnaire: SurveySchemaV3, dataSchema: Record<string, unknown>): JsonFormsOutputV3 {
  const rootOptions: Record<string, unknown> = { id: questionnaire.id, version: questionnaire.version }
  if (questionnaire.description) {
    rootOptions.description = questionnaire.description
  }
  return {
    schema: requiredAnswersSchema(questionnaire, dataSchema),
    uischema: {
      type: 'Categorization',
      label: questionnaire.title,
      options: rootOptions,
      elements: questionnaire.steps.map(step => ({
        type: 'Categorization',
        label: step.title,
        options: { id: step.id },
        elements: step.pages.map(category),
      })),
    },
  }
}
