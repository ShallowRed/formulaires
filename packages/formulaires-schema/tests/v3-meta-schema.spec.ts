/**
 * Errors of the v3 meta-schema on a page and on a condition: those of the kind the
 * document selects, without the errors of the other kinds
 */

import { describe, expect, it } from 'vitest'
import { validateSurveySchemaV3 } from '../src/validation/schema-validator'

function questionnaireWith(page: object) {
  return {
    schemaVersion: '3.0.0',
    id: 'test',
    version: '1.0.0',
    title: 'Test',
    data: './test.schema.json',
    steps: [{ id: 'step', title: 'Step', pages: [page] }],
  }
}

const question = { scope: '#/properties/age' }

function errorsOf(page: object) {
  return (validateSurveySchemaV3(questionnaireWith(page)).errors ?? [])
    .map(error => `${error.path} ${error.keyword} ${JSON.stringify(error.params)}`)
}

describe('v3 meta-schema', () => {
  it('reports the errors of a page of questions alone', () => {
    expect(errorsOf({ id: 'page', questions: [question], extra: 1 })).toEqual([
      '/steps/0/pages/0 additionalProperties {"additionalProperty":"extra"}',
    ])
  })

  it('reports the errors of a page of intermediary results alone', () => {
    expect(errorsOf({ id: 'page', type: 'intermediary-results' })).toEqual([
      '/steps/0/pages/0 required {"missingProperty":"outputs"}',
    ])
  })

  it('refuses a page that mixes questions and intermediary results', () => {
    expect(errorsOf({ id: 'page', type: 'intermediary-results', outputs: [], questions: [question] })).toEqual([
      '/steps/0/pages/0 additionalProperties {"additionalProperty":"questions"}',
    ])
  })

  it('reports the errors of a condition of the kind its key selects', () => {
    const visibleWhen = { anyOf: [{ scope: '#/properties/age' }] }
    expect(errorsOf({ id: 'page', questions: [{ ...question, visibleWhen }] })).toEqual([
      '/steps/0/pages/0/questions/0/visibleWhen/anyOf/0 required {"missingProperty":"schema"}',
    ])
  })

  it('reports the errors of a negated condition alone', () => {
    const visibleWhen = { not: { scope: '#/properties/age' } }
    expect(errorsOf({ id: 'page', questions: [{ ...question, visibleWhen }] })).toEqual([
      '/steps/0/pages/0/questions/0/visibleWhen/not required {"missingProperty":"schema"}',
    ])
  })

  it('refuses a condition with two kinds', () => {
    const visibleWhen = { allOf: [{ scope: '#/properties/age', schema: {} }], anyOf: [] }
    expect(errorsOf({ id: 'page', questions: [{ ...question, visibleWhen }] })).toEqual([
      '/steps/0/pages/0/questions/0/visibleWhen additionalProperties {"additionalProperty":"anyOf"}',
    ])
  })
})
