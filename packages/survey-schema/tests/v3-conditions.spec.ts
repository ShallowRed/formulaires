/**
 * Translation of each v2 condition operator into a v3 condition, and its JSON Forms
 * rule
 */

import type { SurveyAnswers } from '../src/types/answer'
import type { SurveyQuestionData } from '../src/types/question'
import type { PublicodesSurveySchema } from '../src/types/schema'
import type { JsonFormsCategorizationV3, JsonFormsCategoryV3, JsonFormsOutputV3 } from '../src/v3/jsonforms'
import type { SurveyConditionV3, SurveyQuestionsPageV3, SurveySchemaV3 } from '../src/v3/types'
import { isVisible } from '@jsonforms/core'
import { describe, expect, it } from 'vitest'
import { ConditionEvaluator } from '../src/core/condition-evaluator'
import { compileV3ToJsonForms } from '../src/v3/jsonforms'
import { migrateV2ToV3 } from '../src/v3/migrate'
import { createConditionsAjv, isPageVisible, isQuestionVisible, missingRequiredAnswers, visibleAnswers } from '../src/v3/visibility'

const sources: SurveyQuestionData[] = [
  { id: 'services', title: 'Services', type: 'checkbox', choices: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'none', title: 'None', exclusive: true }] },
  { id: 'status', title: 'Status', type: 'radio', choices: [{ id: 'student', title: 'Student' }, { id: 'employed', title: 'Employed' }] },
  { id: 'age', title: 'Age', type: 'number' },
  { id: 'ok', title: 'OK', type: 'boolean' },
  { id: 'start', title: 'Start', type: 'date' },
]

function formWith(visibleWhen: string | string[]): PublicodesSurveySchema {
  return {
    id: 'operators',
    version: '1.0.0',
    title: 'Operators',
    description: '',
    engine: 'publicodes',
    forceRefresh: false,
    dispositifs: [{ id: 'aide', title: 'Aide', description: 'Une aide' }],
    steps: [{
      id: 'step',
      title: 'Step',
      pages: [
        { id: 'sources', questions: sources },
        { id: 'target-page', questions: [{ id: 'target', title: 'Target', type: 'boolean', visibleWhen }] },
        { id: 'results', type: 'intermediary-results', description: 'Résultats', dispositifs: ['aide'] },
      ],
    }],
  }
}

function migrateTarget(visibleWhen: string | string[]) {
  const { questionnaire, dataSchema, warnings } = migrateV2ToV3(formWith(visibleWhen))
  const page = questionnaire.steps[0].pages[1] as SurveyQuestionsPageV3
  return { questionnaire, dataSchema, warnings, target: page.questions[0] }
}

function pagesOf(uischema: JsonFormsOutputV3['uischema']) {
  return (uischema.elements[0] as JsonFormsCategorizationV3).elements as JsonFormsCategoryV3[]
}

const evaluator = new ConditionEvaluator()
const ajv = createConditionsAjv()
type JsonFormsAjv = Parameters<typeof isVisible>[3]

/**
 * The v3 condition and the JSON Forms rule agree with ConditionEvaluator
 */
function expectSameVisibility(visibleWhen: string | string[], answerSets: SurveyAnswers[]): void {
  const { questionnaire, dataSchema, target } = migrateTarget(visibleWhen)
  const targetControl = pagesOf(compileV3ToJsonForms(questionnaire, dataSchema).uischema)[1].elements[0]
  const conditions = Array.isArray(visibleWhen) ? visibleWhen : [visibleWhen]
  for (const answers of answerSets) {
    const expected = conditions.every(c => evaluator.evaluate(c, answers))
    expect(isQuestionVisible(target, answers), JSON.stringify(answers)).toBe(expected)
    expect(isVisible(targetControl as never, answers, '', ajv as unknown as JsonFormsAjv, undefined), JSON.stringify(answers)).toBe(expected)
  }
}

const leaf = (id: string, schema: unknown) => ({ scope: `#/properties/${id}`, schema }) as SurveyConditionV3

describe('v2 operators in v3', () => {
  it.each<[string, SurveyConditionV3, SurveyAnswers[]]>([
    [
      'services.includes(\'a\')',
      leaf('services', { type: 'array', contains: { const: 'a' } }),
      [{}, { services: [] }, { services: ['a'] }, { services: ['b'] }],
    ],
    [
      'services.includes(\'a\', \'b\')',
      leaf('services', { type: 'array', contains: { enum: ['a', 'b'] } }),
      [{}, { services: ['none'] }, { services: ['b'] }],
    ],
    [
      'status.includes(\'student\')',
      leaf('status', { const: 'student' }),
      [{}, { status: 'student' }, { status: 'employed' }],
    ],
    [
      'status.includes(\'student\', \'employed\')',
      leaf('status', { enum: ['student', 'employed'] }),
      [{}, { status: 'employed' }],
    ],
    [
      'services.excludes(\'a\')',
      { not: leaf('services', { type: 'array', contains: { const: 'a' } }) },
      [{}, { services: [] }, { services: ['a'] }, { services: ['b'] }],
    ],
    [
      'status=student',
      leaf('status', { const: 'student' }),
      [{}, { status: 'student' }, { status: 'employed' }],
    ],
    [
      'ok=true',
      leaf('ok', { const: true }),
      [{}, { ok: true }, { ok: false }],
    ],
    [
      'age=18',
      leaf('age', { const: 18 }),
      [{}, { age: 18 }, { age: 19 }],
    ],
    [
      'status!=student',
      leaf('status', { not: { const: 'student' } }),
      [{}, { status: 'student' }, { status: 'employed' }],
    ],
    ['age>18', leaf('age', { type: 'number', exclusiveMinimum: 18 }), [{}, { age: 17 }, { age: 18 }, { age: 19 }]],
    ['age>=18', leaf('age', { type: 'number', minimum: 18 }), [{}, { age: 17 }, { age: 18 }, { age: 19 }]],
    ['age<18', leaf('age', { type: 'number', exclusiveMaximum: 18 }), [{}, { age: 17 }, { age: 18 }, { age: 19 }]],
    ['age<=18', leaf('age', { type: 'number', maximum: 18 }), [{}, { age: 17 }, { age: 18 }, { age: 19 }]],
    [
      'ok',
      leaf('ok', { not: { enum: [false, 0, '', null] } }),
      [{}, { ok: false }, { ok: true }],
    ],
    [
      'ok=true && age>=18',
      { allOf: [leaf('ok', { const: true }), leaf('age', { type: 'number', minimum: 18 })] },
      [{}, { ok: true }, { ok: true, age: 18 }, { ok: false, age: 18 }],
    ],
    [
      'ok=true || age>=18',
      { anyOf: [leaf('ok', { const: true }), leaf('age', { type: 'number', minimum: 18 })] },
      [{}, { ok: true }, { age: 18 }, { ok: false, age: 17 }],
    ],
  ])('%s', (expression, expected, answerSets) => {
    expect(migrateTarget(expression).target.visibleWhen).toEqual(expected)
    expectSameVisibility(expression, answerSets)
  })

  it('reads an array of conditions as a conjunction', () => {
    const conditions = ['ok=true', 'status=student']
    expect(migrateTarget(conditions).target.visibleWhen).toEqual({
      allOf: [leaf('ok', { const: true }), leaf('status', { const: 'student' })],
    })
    expectSameVisibility(conditions, [{}, { ok: true }, { ok: true, status: 'student' }])
  })

  it('removes an empty operand of a conjunction and reports it', () => {
    const { target, warnings } = migrateTarget('  && services.includes(\'a\')')
    expect(target.visibleWhen).toEqual(leaf('services', { type: 'array', contains: { const: 'a' } }))
    expect(warnings.filter(w => w.code === 'empty-subexpression').map(w => w.questionId)).toEqual(['target'])
    expectSameVisibility('  && services.includes(\'a\')', [{}, { services: ['a'] }, { services: ['b'] }])
  })

  it('drops a disjunction that contains an empty operand, which always holds', () => {
    const { target, warnings } = migrateTarget('status=student || ')
    expect(target.visibleWhen).toBeUndefined()
    expect(warnings.map(w => w.code)).toContain('empty-subexpression')
    expectSameVisibility('status=student || ', [{}, { status: 'employed' }])
  })

  it('reports a date comparison, which JSON Schema cannot express', () => {
    const { target, warnings } = migrateTarget('start>2020-01-01')
    expect(target.visibleWhen).toEqual(leaf('start', false))
    expect(warnings.map(w => w.code)).toContain('date-comparison')
  })
})

describe('compileV3ToJsonForms', () => {
  const { questionnaire, dataSchema } = migrateTarget('services.excludes(\'a\')')
  const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)
  const [sourcesPage, targetPage, resultsPage] = pagesOf(uischema)

  it('evaluates a negation on the whole answers object', () => {
    expect(targetPage.elements[0]).toMatchObject({
      type: 'Control',
      scope: '#/properties/target',
      rule: { effect: 'SHOW', condition: { scope: '#', failWhenUndefined: true } },
    })
  })

  it('shows a page whose questions are all conditional when one of them is visible', () => {
    expect(sourcesPage).not.toHaveProperty('rule')
    expect(targetPage.rule).toEqual((targetPage.elements[0] as { rule: unknown }).rule)
    expect(isPageVisible(questionnaire.steps[0].pages[1], { services: ['a'] })).toBe(false)
    expect(isPageVisible(questionnaire.steps[0].pages[2], { services: ['a'] })).toBe(true)
  })

  it('renders a results page as an IntermediaryResults element', () => {
    expect(resultsPage).toEqual({
      type: 'Category',
      label: '',
      options: { id: 'results' },
      elements: [
        { type: 'Label', text: 'Résultats' },
        { type: 'IntermediaryResults', options: { outputs: [{ id: 'aide', title: 'Aide', description: 'Une aide' }] } },
      ],
    })
  })

  it('requires the answers of visible questions in the schema', () => {
    expect(schema.required).toEqual(['services', 'status', 'age', 'ok', 'start'])
    const validate = createConditionsAjv().compile(schema)
    const complete = { services: ['b'], status: 'student', age: 30, ok: true, start: '2024-01-01' }
    expect(validate(complete)).toBe(false)
    expect(missingRequiredAnswers(questionnaire, complete).map(q => q.scope)).toEqual(['#/properties/target'])
    expect(validate({ ...complete, services: ['a'] })).toBe(true)
    expect(missingRequiredAnswers(questionnaire, { ...complete, services: ['a'] })).toEqual([])
  })

  it('drops the answers of hidden questions', () => {
    const answers = { services: ['b'], status: 'student', target: true }
    expect(visibleAnswers(questionnaire, answers)).toEqual(answers)
    expect(visibleAnswers(questionnaire, { ...answers, services: ['a'] })).toEqual({ services: ['a'], status: 'student' })
  })

  it('drops the nested answer of a hidden question', () => {
    const nested: SurveySchemaV3 = {
      schemaVersion: '3.0.0',
      id: 'nested',
      version: '1.0.0',
      title: 'Nested',
      data: 'answers.schema.json',
      steps: [{ id: 'step', title: 'Step', pages: [{ id: 'page', questions: [
        { scope: '#/properties/foyer/properties/isole' },
        { scope: '#/properties/foyer/properties/enfants', visibleWhen: { scope: '#/properties/foyer/properties/isole', schema: { const: true } } },
      ] }] }],
    }
    expect(visibleAnswers(nested, { foyer: { isole: false, enfants: 2 } })).toEqual({ foyer: { isole: false } })
  })
})
