/**
 * Publicodes eligibility runner for survey-schema forms
 *
 * Faithful port of the aides-simplifiees production eligibility service
 * (inertia/services/eligibility_service.ts), decoupled from the application
 * store: the normalized schema is passed as an argument and question lookup
 * is done locally.
 */

import type {
  PublicodesDispositif,
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyNormalizedSchema,
  SurveyQuestionData,
  SurveyQuestionsPageData,
} from '@shallowred/survey-schema'
import Engine from 'publicodes'

export interface DispositifEligibilityInfo {
  id: string
  title: string
  description: string
  value: boolean | null | string | number
  status: 'eligible' | 'ineligible' | 'potential' | 'error'
  reason?: string
  missingInfo?: string[]
}

export interface EligibilityResults {
  eligibleDispositifs: DispositifEligibilityInfo[]
  potentialDispositifs: DispositifEligibilityInfo[]
  ineligibleDispositifs: DispositifEligibilityInfo[]
  /** Flat map of `<dispositif>` -> montant and `<dispositif>-eligibilite` -> boolean */
  aidesResults: Record<string, boolean | number>
}

/** Raw publicodes rules as exported by a model package */
export type PublicodesRules = Record<string, unknown>

// Utility: convert kebab-case or snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

// Utility: convert date from YYYY-MM-DD to DD/MM/YYYY
function convertDateToFrenchFormat(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string')
    return dateStr
  const parts = dateStr.split('-')
  if (parts.length !== 3)
    return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

/**
 * Create a publicodes engine from raw rules
 *
 * `automaticNamespaceDisabling: false` is required by models where sibling
 * namespaces stay active independently (e.g. entreprise-innovation).
 */
export function createEngine(rules: PublicodesRules): Engine {
  return new Engine(rules as any, {
    flag: {
      automaticNamespaceDisabling: false,
    },
  })
}

/**
 * Publicodes form of an answer that is not a plain value: a checkbox answer expands into one sub-rule per choice,
 * a date is written DD/MM/YYYY
 */
type AnswerShape = { kind: 'checkbox', choices: string[] } | { kind: 'date' }

/**
 * Map survey answers to a publicodes situation
 *
 * - question IDs are cast from kebab-case to camelCase rule names
 * - answers whose cast name matches no rule are dropped
 * - checkbox answers expand to one `parent . choice` boolean sub-rule per choice
 * - booleans become oui/non, dates DD/MM/YYYY, strings get wrapped in quotes
 */
export function mapAnswersToSituation(
  engine: Engine,
  schema: SurveyNormalizedSchema,
  answers: SurveyAnswers,
): Record<string, string | number | boolean> {
  return situationOf(engine, answers, (camelCaseId) => {
    const question = schema ? findQuestionByCamelCaseId(schema, camelCaseId) : null
    if (question?.type === 'checkbox') {
      return { kind: 'checkbox', choices: (question.choices ?? []).map(choice => choice.id) }
    }
    return question?.type === 'date' ? { kind: 'date' } : null
  })
}

function situationOf(
  engine: Engine,
  answers: SurveyAnswers,
  shapeOf: (camelCaseId: string) => AnswerShape | null,
): Record<string, string | number | boolean> {
  const mapped: Record<string, SurveyAnswerValue> = {}
  for (const [key, value] of Object.entries(answers)) {
    mapped[toCamelCase(key)] = value
  }

  // Filter out keys that don't exist in the publicodes model
  const validMappedAnswers: Record<string, SurveyAnswerValue> = {}
  Object.keys(mapped).forEach((key) => {
    try {
      engine.getRule(key as any)
      validMappedAnswers[key] = mapped[key]
    }
    catch {
      // Not a rule of the model: the answer only serves the form logic
    }
  })

  // Transform values to publicodes format
  const situation: Record<string, string | number | boolean> = {}

  Object.entries(validMappedAnswers).forEach(([key, value]) => {
    const shape = shapeOf(key)

    if (shape?.kind === 'checkbox' && Array.isArray(value)) {
      // For checkbox questions, create a new entry for each possible choice
      shape.choices.forEach((choice) => {
        const publicodesKey = `${key} . ${toCamelCase(choice)}`
        situation[publicodesKey] = value.includes(choice) ? 'oui' : 'non'
      })
    }
    else {
      let transformedValue: string | number | boolean
      if (value === true) {
        transformedValue = 'oui'
      }
      else if (value === false) {
        transformedValue = 'non'
      }
      else if (typeof value === 'string') {
        if (shape?.kind === 'date') {
          transformedValue = convertDateToFrenchFormat(value)
        }
        else {
          // Wrap string values with quotes: value -> "'value'"
          transformedValue = `"${value}"`
        }
      }
      else if (typeof value === 'number') {
        transformedValue = value
      }
      else {
        // Skip null, undefined, arrays, or objects
        return
      }
      situation[key] = transformedValue
    }
  })

  return situation
}

function findQuestionByCamelCaseId(
  schema: SurveyNormalizedSchema,
  camelCaseId: string,
): SurveyQuestionData | null {
  for (const step of schema.steps) {
    for (const page of step.pages) {
      const questions = (page as SurveyQuestionsPageData).questions ?? []
      const question = questions.find(q => toCamelCase(q.id) === camelCaseId)
      if (question)
        return question
    }
  }
  return null
}

/**
 * Calculate eligibility for dispositifs based on survey answers
 *
 * Evaluates `<dispositif> . eligibilite` and `<dispositif> . montant` for each
 * dispositif, and sorts them into eligible / ineligible / potential buckets.
 */
export function calculateEligibility(
  rules: PublicodesRules,
  schema: SurveyNormalizedSchema,
  answers: SurveyAnswers,
  dispositifsToEvaluate?: PublicodesDispositif[],
): EligibilityResults {
  const engine = createEngine(rules)
  const dispositifs = dispositifsToEvaluate
    ?? (schema.engine === 'publicodes' ? schema.dispositifs : [])
  engine.setSituation(mapAnswersToSituation(engine, schema, answers) as any)
  return evaluateDispositifs(engine, dispositifs)
}

/**
 * Calculate eligibility from the answers of a survey-schema v3 questionnaire
 *
 * The JSON Schema of the answers gives the checkbox answers (arrays of `oneOf` or `enum` choices) and the
 * dates (`format: date`).
 */
export function calculateEligibilityV3(
  rules: PublicodesRules,
  dataSchema: Record<string, unknown>,
  answers: SurveyAnswers,
  dispositifs: PublicodesDispositif[],
): EligibilityResults {
  const engine = createEngine(rules)
  const properties = (dataSchema.properties ?? {}) as Record<string, Record<string, any>>
  const shapes = new Map<string, AnswerShape>()
  for (const [id, property] of Object.entries(properties)) {
    const choices: string[] = property.type !== 'array'
      ? []
      : property.items?.enum ?? (property.items?.oneOf ?? []).map((choice: { const: string }) => choice.const)
    if (choices.length > 0) {
      shapes.set(toCamelCase(id), { kind: 'checkbox', choices })
    }
    else if (property.format === 'date') {
      shapes.set(toCamelCase(id), { kind: 'date' })
    }
  }
  engine.setSituation(situationOf(engine, answers, camelCaseId => shapes.get(camelCaseId) ?? null) as any)
  return evaluateDispositifs(engine, dispositifs)
}

function evaluateDispositifs(engine: Engine, dispositifs: PublicodesDispositif[]): EligibilityResults {
  const results: EligibilityResults = {
    eligibleDispositifs: [],
    potentialDispositifs: [],
    ineligibleDispositifs: [],
    aidesResults: {},
  }

  for (const dispositif of dispositifs) {
    try {
      const evaluation = engine.evaluate(`${dispositif.id} . eligibilite`)
      const value = evaluation.nodeValue as boolean | null | string | number
      const baseResult = {
        id: dispositif.id,
        title: dispositif.title || dispositif.id,
        description: dispositif.description,
        value,
      }

      results.aidesResults[`${dispositif.id}-eligibilite`] = (value ?? false) as boolean | number

      try {
        const montantEvaluation = engine.evaluate(`${dispositif.id} . montant`)
        results.aidesResults[dispositif.id] = (montantEvaluation.nodeValue ?? 0) as boolean | number
      }
      catch {
        // If montant doesn't exist, set it to 0
        results.aidesResults[dispositif.id] = 0
      }

      if (value === true) {
        results.eligibleDispositifs.push({
          ...baseResult,
          status: 'eligible',
        })
      }
      else if (value === false) {
        let reason = 'Les conditions d\'éligibilité ne sont pas remplies.'
        try {
          const reasonEval = engine
            .evaluate(`${dispositif.id} . eligibilite . explications`)
            .nodeValue
          const reasonString = String(reasonEval || '').replaceAll(/Non applicable/g, '')
          if (reasonString && reasonString.trim()) {
            reason = reasonString
          }
        }
        catch {
          // Model has no explications rule for this dispositif
        }
        results.ineligibleDispositifs.push({
          ...baseResult,
          status: 'ineligible',
          reason,
        })
      }
      else {
        let reason
          = 'Des informations supplémentaires sont nécessaires pour déterminer l\'éligibilité.'
        const missingVars = Object.keys(evaluation.missingVariables || {})
        if (missingVars.length > 0) {
          reason = `Informations manquantes : ${missingVars.join(', ')}.`
        }
        results.potentialDispositifs.push({
          ...baseResult,
          status: 'potential',
          reason,
          missingInfo: missingVars,
        })
      }
    }
    catch (error) {
      results.potentialDispositifs.push({
        id: dispositif.id,
        title: dispositif.title || dispositif.id,
        description: dispositif.description,
        value: null,
        status: 'error',
        reason: `Erreur lors de l'évaluation de la règle : ${(error as Error).message}`,
      })
    }
  }

  return results
}
