/**
 * Migration of a survey-schema v2 form into a v3 questionnaire and the JSON Schema
 * 2020-12 of its answers
 */

import type { SurveyChoice, SurveyQuestionData } from '../types/question.js'
import type { SurveyResultsPageData, SurveySchema } from '../types/schema.js'
import type {
  JsonSchemaV3,
  SurveyChoiceOptionsV3,
  SurveyConditionV3,
  SurveyNotionV3,
  SurveyPageV3,
  SurveyQuestionV3,
  SurveyResultsOutputV3,
  SurveySchemaV3,
  SurveyScopeV3,
} from './types.js'
import { SchemaNormalizer } from '../core/normalizer.js'
import { isResultsPageData } from '../types/schema.js'

export type MigrationWarningCode
  = | 'dropped-field'
    | 'empty-subexpression'
    | 'date-comparison'
    | 'unknown-question'
    | 'choice-without-id'
    | 'combobox-answer'
    | 'duplicate-question'
    | 'unknown-output'

export interface MigrationWarning {
  code: MigrationWarningCode
  message: string
  /** Question concerned, when the warning is about one */
  questionId?: string
}

export interface MigrateV2ToV3Options {
  /** Value of the `data` field of the questionnaire (default: `<id>.data.schema.json`) */
  dataPath?: string
}

export interface MigrateV2ToV3Result {
  questionnaire: SurveySchemaV3
  /** JSON Schema 2020-12 of the answers */
  dataSchema: Record<string, unknown>
  warnings: MigrationWarning[]
}

// Condition grammar of ConditionEvaluator: '||' first, then '&&', then
// '.includes(', '.excludes(', comparison, bare identifier.

type ConditionNode
  = | { kind: 'empty' }
    | { kind: 'and', children: ConditionNode[] }
    | { kind: 'or', children: ConditionNode[] }
    | { kind: 'includes' | 'excludes', id: string, values: string[] }
    | { kind: 'cmp', id: string, op: ComparisonOperator, value: string | number | boolean }
    | { kind: 'bare', id: string }

type ComparisonOperator = '>=' | '<=' | '!=' | '>' | '<' | '='
type ConditionTree = Exclude<ConditionNode, { kind: 'empty' }>
type ConditionLeaf = Exclude<ConditionTree, { kind: 'and' | 'or' }>

const COMPARISON_OPERATORS: ComparisonOperator[] = ['>=', '<=', '!=', '>', '<', '=']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function stripQuotes(value: string): string {
  return value.replace(/^["'](.+)["']$/, '$1')
}

function parseValue(raw: string): string | number | boolean {
  const value = stripQuotes(raw)
  const asNumber = Number(value)
  if (!Number.isNaN(asNumber)) {
    return asNumber
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return value
}

function parseCondition(raw: string): ConditionNode {
  const expr = raw.trim()
  if (expr === '') {
    return { kind: 'empty' }
  }
  if (expr.includes('||')) {
    return { kind: 'or', children: expr.split('||').map(parseCondition) }
  }
  if (expr.includes('&&')) {
    return { kind: 'and', children: expr.split('&&').map(parseCondition) }
  }
  for (const kind of ['includes', 'excludes'] as const) {
    if (expr.includes(`.${kind}(`)) {
      const match = expr.match(new RegExp(`^(.+)\\.${kind}\\((.+)\\)$`))
      if (!match) {
        throw new Error(`Invalid ${kind} expression: ${expr}`)
      }
      const values = match[2].split(',').map(v => stripQuotes(v.trim()))
      return { kind, id: match[1].trim(), values }
    }
  }
  for (const op of COMPARISON_OPERATORS) {
    if (expr.includes(op)) {
      const parts = expr.split(op)
      if (parts.length !== 2) {
        continue
      }
      return { kind: 'cmp', id: parts[0].trim(), op, value: parseValue(parts[1].trim()) }
    }
  }
  if (COMPARISON_OPERATORS.some(op => expr.includes(op))) {
    throw new Error(`No valid operator found in expression: ${expr}`)
  }
  return { kind: 'bare', id: expr }
}

/**
 * Empty operands are true in ConditionEvaluator: an AND drops them, an OR that
 * contains one always holds.
 */
function dropEmpty(node: ConditionNode, onEmpty: () => void): ConditionNode {
  if (node.kind !== 'and' && node.kind !== 'or') {
    return node
  }
  const children = node.children.map(c => dropEmpty(c, onEmpty))
  const empty = children.filter(c => c.kind === 'empty').length
  if (empty > 0) {
    onEmpty()
  }
  if (node.kind === 'or' && empty > 0) {
    return { kind: 'empty' }
  }
  const kept = children.filter(c => c.kind !== 'empty')
  if (kept.length === 0) {
    return { kind: 'empty' }
  }
  return kept.length === 1 ? kept[0] : { kind: node.kind, children: kept }
}

interface ConditionContext {
  questionTypes: Map<string, SurveyQuestionData['type']>
  warn: (code: MigrationWarningCode, message: string) => void
}

const BOUNDS: Record<'>' | '>=' | '<' | '<=', string> = {
  '>': 'exclusiveMinimum',
  '>=': 'minimum',
  '<': 'exclusiveMaximum',
  '<=': 'maximum',
}

function leafSchema(node: ConditionLeaf, context: ConditionContext): JsonSchemaV3 {
  switch (node.kind) {
    case 'includes':
    case 'excludes': {
      const inner = node.values.length === 1 ? { const: node.values[0] } : { enum: node.values }
      return context.questionTypes.get(node.id) === 'checkbox' ? { type: 'array', contains: inner } : inner
    }
    case 'cmp': {
      if (node.op === '=') {
        return { const: node.value }
      }
      if (node.op === '!=') {
        return { not: { const: node.value } }
      }
      if (typeof node.value === 'string') {
        // ConditionEvaluator compares ISO dates as dates and any other string as NaN
        if (ISO_DATE.test(node.value)) {
          context.warn('date-comparison', `'${node.id}${node.op}${node.value}' compares dates, which JSON Schema cannot express: the condition never holds`)
        }
        return false
      }
      return { type: 'number', [BOUNDS[node.op]]: Number(node.value) }
    }
    case 'bare':
      return { not: { enum: [false, 0, '', null] } }
  }
}

// dropEmpty leaves no empty node below an AND or an OR
function toCondition(node: ConditionTree, context: ConditionContext): SurveyConditionV3 {
  if (node.kind === 'and' || node.kind === 'or') {
    const children = node.children.map(c => toCondition(c as ConditionTree, context))
    return node.kind === 'and' ? { allOf: children } : { anyOf: children }
  }
  if (!context.questionTypes.has(node.id)) {
    context.warn('unknown-question', `condition refers to '${node.id}', which is not a question of the form`)
  }
  const leaf = { scope: scopeOf(node.id), schema: leafSchema(node, context) }
  return node.kind === 'excludes' ? { not: leaf } : leaf
}

function questionCondition(question: SurveyQuestionData, context: ConditionContext): SurveyConditionV3 | undefined {
  const raw = question.visibleWhen
  if (!raw) {
    return undefined
  }
  const onEmpty = () => context.warn('empty-subexpression', `empty operand removed from the condition of '${question.id}'`)
  const nodes = (Array.isArray(raw) ? raw : [raw])
    .map(part => dropEmpty(parseCondition(part), onEmpty))
    .filter((n): n is ConditionTree => n.kind !== 'empty')
  if (nodes.length === 0) {
    return undefined
  }
  return toCondition(nodes.length === 1 ? nodes[0] : { kind: 'and', children: nodes }, context)
}

function scopeOf(id: string): SurveyScopeV3 {
  return `#/properties/${id.replace(/~/g, '~0').replace(/\//g, '~1')}`
}

// Fields that v2 types do not declare but that production forms carry
interface LooseChoice extends SurveyChoice {
  description?: string
}
type LooseQuestion = SurveyQuestionData & {
  additionalNotions?: SurveyNotionV3[]
  choices?: LooseChoice[]
}

function dataProperty(question: LooseQuestion, warn: (code: MigrationWarningCode, message: string) => void): Record<string, unknown> {
  const property: Record<string, unknown> = { title: question.title }
  if (question.description) {
    property.description = question.description
  }
  const choiceEntries = () => (question.choices ?? []).flatMap((choice) => {
    if (!choice.id) {
      warn('choice-without-id', `choice '${choice.title}' of '${question.id}' has no id and is dropped`)
      return []
    }
    const entry: Record<string, unknown> = { const: choice.id, title: choice.title }
    if (choice.description) {
      entry.description = choice.description
    }
    return [entry]
  })
  switch (question.type) {
    case 'number':
      property.type = 'number'
      if (question.min !== undefined) {
        property.minimum = question.min
      }
      if (question.max !== undefined) {
        property.maximum = question.max
      }
      if (question.step !== undefined) {
        warn('dropped-field', `'step' of '${question.id}' is dropped`)
      }
      break
    case 'boolean':
      property.type = 'boolean'
      break
    case 'date':
      Object.assign(property, { type: 'string', format: 'date' })
      break
    case 'radio':
      Object.assign(property, { type: 'string', oneOf: choiceEntries() })
      break
    case 'checkbox': {
      Object.assign(property, { type: 'array', uniqueItems: true, items: { oneOf: choiceEntries() } })
      const exclusive = question.choices.filter(c => c.exclusive && c.id).map(c => c.id)
      if (exclusive.length > 0) {
        property.allOf = exclusive.map(id => ({ if: { contains: { const: id } }, then: { maxItems: 1 } }))
      }
      break
    }
    case 'combobox':
      property.type = 'string'
      warn('combobox-answer', `the answer of '${question.id}' is described as the selected value, a string`)
      break
    default:
      throw new Error(`Unsupported question type: ${(question as { type: string }).type}`)
  }
  if (question.default !== undefined) {
    property.default = question.default
  }
  return property
}

function migrateQuestion(question: LooseQuestion, context: ConditionContext): SurveyQuestionV3 {
  const result: SurveyQuestionV3 = { scope: scopeOf(question.id) }
  const condition = questionCondition(question, context)
  if (condition) {
    result.visibleWhen = condition
  }
  if (question.required === false) {
    result.required = false
  }
  const autocompleteConfig = question.type === 'combobox' ? question.autocompleteConfig : undefined
  const placeholder = question.placeholder ?? autocompleteConfig?.placeholder
  if (placeholder) {
    result.placeholder = placeholder
  }
  if (question.tooltip) {
    result.tooltip = question.tooltip
  }
  if (question.notion) {
    result.notion = question.notion
  }
  if (question.additionalNotions?.length) {
    result.additionalNotions = question.additionalNotions
  }
  const choices: Record<string, SurveyChoiceOptionsV3> = {}
  for (const choice of question.choices ?? []) {
    const options: SurveyChoiceOptionsV3 = {}
    if (choice.tooltip) {
      options.tooltip = choice.tooltip
    }
    if (choice.exclusive) {
      options.exclusive = true
    }
    if (choice.id && Object.keys(options).length > 0) {
      choices[choice.id] = options
    }
  }
  if (Object.keys(choices).length > 0) {
    result.choices = choices
  }
  if (question.type === 'combobox' && question.autocompleteFunction) {
    result.autocomplete = { source: question.autocompleteFunction }
  }
  const droppedConfig = Object.keys(autocompleteConfig ?? {}).filter(k => k !== 'placeholder')
  if (droppedConfig.length > 0) {
    context.warn('dropped-field', `autocompleteConfig ${droppedConfig.join(', ')} of '${question.id}' is dropped`)
  }
  return result
}

function resultsOutputs(page: SurveyResultsPageData, form: SurveySchema, warn: ConditionContext['warn']): SurveyResultsOutputV3[] {
  const available = 'dispositifs' in form ? form.dispositifs : []
  if (!page.dispositifs) {
    return available
  }
  return page.dispositifs.flatMap((id) => {
    const output = available.find(d => d.id === id)
    if (!output) {
      warn('unknown-output', `page '${page.id}' displays '${id}', which is not a dispositif of the form`)
    }
    return output ? [output] : []
  })
}

/**
 * Migrate a v2 form into a v3 questionnaire and the JSON Schema of its answers.
 * Conditions keep the meaning that ConditionEvaluator gives them.
 */
export function migrateV2ToV3(form: SurveySchema, options: MigrateV2ToV3Options = {}): MigrateV2ToV3Result {
  const normalized = new SchemaNormalizer().normalize(form)
  const warnings: MigrationWarning[] = []
  const questionTypes = new Map<string, SurveyQuestionData['type']>()
  for (const step of normalized.steps) {
    for (const page of step.pages) {
      for (const question of isResultsPageData(page) ? [] : page.questions) {
        questionTypes.set(question.id, question.type)
      }
    }
  }

  const properties: Record<string, unknown> = {}
  let hasResultsPage = false
  const steps = normalized.steps.map(step => ({
    id: step.id,
    title: step.title,
    pages: step.pages.map((page): SurveyPageV3 => {
      if (isResultsPageData(page)) {
        hasResultsPage = true
        const warn = (code: MigrationWarningCode, message: string) => warnings.push({ code, message })
        return {
          id: page.id,
          type: 'intermediary-results',
          ...(page.title ? { title: page.title } : {}),
          ...(page.description ? { description: page.description } : {}),
          outputs: resultsOutputs(page, form, warn),
        }
      }
      const questions = page.questions.map((question) => {
        const warn = (code: MigrationWarningCode, message: string) => warnings.push({ code, message, questionId: question.id })
        if (question.id in properties) {
          warn('duplicate-question', `question '${question.id}' appears more than once; the last one describes its data`)
        }
        properties[question.id] = dataProperty(question, warn)
        return migrateQuestion(question, { questionTypes, warn })
      })
      return {
        id: page.id,
        ...(page.title ? { title: page.title } : {}),
        questions,
      }
    }),
  }))

  const dropped = ['engine', 'forceRefresh', 'questionsToApi'].filter(field => field in form)
  if ('tests' in form && Array.isArray(form.tests) && form.tests.length > 0) {
    dropped.push('tests')
  }
  if (!hasResultsPage && 'dispositifs' in form && form.dispositifs.length > 0) {
    dropped.push('dispositifs')
  }
  for (const field of dropped) {
    warnings.push({ code: 'dropped-field', message: `root field '${field}' has no place in the questionnaire and is dropped` })
  }

  const questionnaire: SurveySchemaV3 = {
    schemaVersion: '3.0.0',
    id: form.id,
    version: form.version,
    title: form.title,
    ...(form.description ? { description: form.description } : {}),
    data: options.dataPath ?? `${form.id}.data.schema.json`,
    steps,
  }
  const dataSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `urn:survey-schema:${form.id}:data`,
    type: 'object',
    properties,
    additionalProperties: false,
  }
  return { questionnaire, dataSchema, warnings }
}
