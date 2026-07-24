import type { SurveySchema } from '@shallowred/survey-schema'
import formSchema from '@shallowred/form-entreprise-innovation/entreprise-innovation.json'
import { describe, expect, it } from 'vitest'
import { useSurvey } from '../src/composables/use-survey.js'

const schema = formSchema as unknown as SurveySchema

describe('useSurvey on the real entreprise-innovation form', () => {
  it('normalizes the schema and starts on the first visible page', () => {
    const survey = useSurvey(schema)
    expect(survey.getQuestions()).toHaveLength(78)
    expect(survey.getCurrentPage()?.id).toBe('statut-juridique')
    expect(survey.getCurrentStepIndex()).toBe(0)
  })

  it('validates the first page only once all its questions are answered', () => {
    const survey = useSurvey(schema)
    expect(survey.areAllQuestionsInPageValid()).toBe(false)

    survey.setAnswer('date-de-creation', '2024-03-10')
    survey.setAnswer('nature-activite', ['industrielle'])
    survey.setAnswer('situation-geographique', 'metropole')
    survey.setAnswer('entreprise-en-difficulte', false)
    expect(survey.areAllQuestionsInPageValid()).toBe(true)
  })

  it('navigates forward and backward across visible pages', () => {
    const survey = useSurvey(schema)
    const firstPageId = survey.getCurrentPage()?.id
    expect(survey.isFirstPage()).toBe(true)
    expect(survey.goToNextPage()).toBe(true)
    expect(survey.getCurrentPage()?.id).not.toBe(firstPageId)
    expect(survey.goToPreviousPage()).toBe(true)
    expect(survey.getCurrentPage()?.id).toBe(firstPageId)
  })

  it('keeps year N2 questions hidden until the year is selected (leading && condition)', () => {
    const survey = useSurvey(schema)
    expect(survey.isQuestionVisible('chiffre-affaires-N2')).toBe(false)

    survey.setAnswer('chiffre-affaires-selector', ['year_N2'])
    expect(survey.isQuestionVisible('chiffre-affaires-N2')).toBe(true)
  })

  it('exposes only visible, answered questions for calculation', () => {
    const survey = useSurvey(schema)
    survey.setAnswer('nature-activite', ['industrielle'])
    // Hidden question: its answer must not leak into the calculation
    survey.setAnswer('chiffre-affaires-N2', 100000)

    const answers = survey.getAnswersForCalculation()
    expect(answers['nature-activite']).toEqual(['industrielle'])
    expect(answers['chiffre-affaires-N2']).toBeUndefined()
  })

  it('reports progress and reset', () => {
    const survey = useSurvey(schema)
    expect(survey.getProgress()).toBe(0)
    survey.setAnswer('date-de-creation', '2024-03-10')
    expect(survey.getProgress()).toBeGreaterThan(0)
    survey.reset()
    expect(survey.getProgress()).toBe(0)
    expect(survey.getCurrentPage()?.id).toBe('statut-juridique')
  })
})
