/**
 * survey-schema v3 against v2 on entreprise-innovation.json: visibility of questions
 * and pages, JSON Forms rules, required answers
 */

import type { UISchemaElement } from '@jsonforms/core'
import type { SurveySchema } from '../src/types/schema'
import type { SurveyQuestionV3 } from '../src/v3/types'
import { isVisible } from '@jsonforms/core'
import { describe, expect, it } from 'vitest'
import form from '../../form-entreprise-innovation/src/entreprise-innovation.json' with { type: 'json' }
import { SchemaNormalizer } from '../src/core/normalizer'
import { isQuestionsPageData } from '../src/types/schema'
import { compileV3ToJsonForms } from '../src/v3/jsonforms'
import { migrateV2ToV3 } from '../src/v3/migrate'
import { createConditionsAjv, isPageVisible, missingRequiredAnswers, visibleQuestions } from '../src/v3/visibility'
import { validateSurveySchemaV3 } from '../src/validation/schema-validator'
import { drawAnswerSets, v2Questions, v2Visible } from './helpers/answer-sets'

const SEED = 20261103
const SETS_PER_MODE = 1500

const v2 = new SchemaNormalizer().normalize(form as SurveySchema)
const { questionnaire, dataSchema, warnings } = migrateV2ToV3(form as SurveySchema)
const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)
const sets = drawAnswerSets(v2, SEED, SETS_PER_MODE)

const questions = v2Questions(v2)
const pages = v2.steps.flatMap(s => s.pages)
const v3Pages = questionnaire.steps.flatMap(s => s.pages)
const idOf = (q: SurveyQuestionV3) => q.scope.replace('#/properties/', '')

const bits = (flags: boolean[]) => flags.map(f => (f ? '1' : '0')).join('')

// Each Control and Category of the uischema with its ancestors: a hidden layout
// does not render its children
type Element = UISchemaElement & { scope?: string, options?: { id?: string }, elements?: Element[] }
const controls = new Map<string, Element[]>()
const categories = new Map<string, Element[]>()
function walk(element: Element, chain: Element[]): void {
  const path = [...chain, element]
  if (element.type === 'Control') {
    controls.set(element.scope!.replace('#/properties/', ''), path)
  }
  if (element.type === 'Category') {
    categories.set(element.options!.id!, path)
  }
  element.elements?.forEach(child => walk(child, path))
}
walk(uischema as unknown as Element, [])

const ajv = createConditionsAjv()
type JsonFormsAjv = Parameters<typeof isVisible>[3]
function jsonFormsVisible(path: Element[], data: object) {
  return path.every(element => isVisible(element, data, '', ajv as unknown as JsonFormsAjv, undefined))
}

describe('survey-schema v3 on entreprise-innovation.json', () => {
  it('migrates into a questionnaire valid against the v3 meta-schema', () => {
    expect(validateSurveySchemaV3(questionnaire)).toEqual({ valid: true })
    expect(warnings.map(w => w.questionId ?? w.message)).toEqual([
      'chiffre-affaires-N2',
      'bilan-total-N2',
      'effectif-total-N2',
      'root field \'engine\' has no place in the questionnaire and is dropped',
      'root field \'forceRefresh\' has no place in the questionnaire and is dropped',
    ])
  })

  // `vitest -u` writes the questionnaire and the answers schema of form-entreprise-innovation
  it('matches the questionnaire and answers schema stored in form-entreprise-innovation', async () => {
    const folder = '../../form-entreprise-innovation/src'
    await expect(`${JSON.stringify(questionnaire, null, 2)}\n`).toMatchFileSnapshot(`${folder}/entreprise-innovation.questionnaire.json`)
    await expect(`${JSON.stringify(dataSchema, null, 2)}\n`).toMatchFileSnapshot(`${folder}/entreprise-innovation.data.schema.json`)
  })

  it(`draws ${2 * SETS_PER_MODE} answer sets valid against the answers schema, which hide and show every conditional question`, () => {
    const validate = createConditionsAjv().compile(dataSchema)
    expect(sets.filter(s => !validate(s.answers))).toHaveLength(0)
    for (const q of questions.filter(q => q.visibleWhen)) {
      const shown = sets.filter(s => v2Visible(q, s.answers)).length
      expect(shown, q.id).toBeGreaterThan(0)
      expect(shown, q.id).toBeLessThan(sets.length)
    }
  })

  it('shows the same questions and pages as ConditionEvaluator', () => {
    const mismatches = sets.filter(({ answers }) => {
      const v2Q = bits(questions.map(q => v2Visible(q, answers)))
      const visible = new Set(visibleQuestions(questionnaire, answers).map(idOf))
      const v3Q = bits(questions.map(q => visible.has(q.id)))
      const v2P = bits(pages.map(p => !isQuestionsPageData(p) || p.questions.some(q => v2Visible(q, answers))))
      const v3P = bits(v3Pages.map(p => isPageVisible(p, answers)))
      return v2Q !== v3Q || v2P !== v3P
    })
    expect(mismatches).toHaveLength(0)
  })

  it('shows the same questions and pages through the uischema rules evaluated by @jsonforms/core', () => {
    const mismatches = sets.filter(({ answers }) => {
      const v2Q = bits(questions.map(q => v2Visible(q, answers)))
      const jfQ = bits(questions.map(q => jsonFormsVisible(controls.get(q.id)!, answers)))
      const v2P = bits(pages.map(p => !isQuestionsPageData(p) || p.questions.some(q => v2Visible(q, answers))))
      const jfP = bits(pages.map(p => jsonFormsVisible(categories.get(p.id)!, answers)))
      return v2Q !== jfQ || v2P !== jfP
    })
    expect(mismatches).toHaveLength(0)
  })

  it('finds the same missing required answers as Ajv2020 on the compiled schema', () => {
    const validate = createConditionsAjv().compile(schema)
    let missingSets = 0
    const mismatches = sets.filter(({ answers }) => {
      validate(answers)
      const bySchema = new Set((validate.errors ?? [])
        .filter(e => e.keyword === 'required')
        .map(e => (e.params as { missingProperty: string }).missingProperty))
      const byQuestionnaire = new Set(missingRequiredAnswers(questionnaire, answers).map(idOf))
      if (byQuestionnaire.size > 0) {
        missingSets++
      }
      return [...bySchema].sort().join() !== [...byQuestionnaire].sort().join()
    })
    expect(mismatches).toHaveLength(0)
    expect(missingSets).toBeGreaterThan(0)
  })
})
