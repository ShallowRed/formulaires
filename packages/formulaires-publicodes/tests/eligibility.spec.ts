import type { PublicodesNormalizedSchema } from '@shallowred/formulaires-schema'
// The package entry uses `assert { type: 'json' }`, removed from Node >= 22:
// import the compiled rules directly instead
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { migrateV2ToV3 } from '@shallowred/formulaires-schema'
import { describe, expect, it } from 'vitest'
import { calculateEligibility, calculateEligibilityV3, createEngine, mapAnswersToSituation } from '../src/index.js'

/**
 * Minimal schema slice of the entreprise-innovation form: just enough
 * questions to type the answers used by the test cases below.
 */
const schema: PublicodesNormalizedSchema = {
  id: 'entreprise-innovation',
  title: 'Aides innovation',
  version: '1.0.2',
  forceRefresh: false,
  description: 'Cas de tests du runner',
  engine: 'publicodes',
  dispositifs: [
    { id: 'cir', title: 'Crédit d\'Impôt Recherche (CIR)', description: '' },
    { id: 'cii', title: 'Crédit d\'Impôt Innovation (CII)', description: '' },
  ],
  steps: [
    {
      id: 'test',
      title: 'Test',
      pages: [
        {
          id: 'test-page',
          questions: [
            {
              id: 'nature-activite',
              title: 'Nature de l\'activité',
              type: 'checkbox',
              choices: [
                { id: 'industrielle', title: 'Industrielle' },
                { id: 'commerciale', title: 'Commerciale' },
                { id: 'artisanale', title: 'Artisanale' },
                { id: 'agricole', title: 'Agricole' },
              ],
            },
            {
              id: 'date-de-creation',
              title: 'Date de création',
              type: 'date',
            },
            {
              id: 'activite-nouvelle',
              title: 'Activité nouvelle',
              type: 'boolean',
            },
            {
              id: 'chiffre-affaires-n',
              title: 'Chiffre d\'affaires N',
              type: 'number',
            },
          ],
        },
      ],
    },
  ],
}

describe('mapAnswersToSituation', () => {
  const engine = createEngine(rules as any)

  it('expands checkbox answers into oui/non sub-rules', () => {
    const situation = mapAnswersToSituation(engine, schema, {
      'nature-activite': ['industrielle'],
    })
    expect(situation['natureActivite . industrielle']).toBe('oui')
    expect(situation['natureActivite . commerciale']).toBe('non')
  })

  it('casts booleans to oui/non, keeps numbers, formats dates', () => {
    const situation = mapAnswersToSituation(engine, schema, {
      'activite-nouvelle': true,
      'chiffre-affaires-n': 500000,
      'date-de-creation': '2024-03-10',
    })
    expect(situation.activiteNouvelle).toBe('oui')
    expect(situation.chiffreAffairesN).toBe(500000)
    expect(situation.dateDeCreation).toBe('10/03/2024')
  })

  it('drops answers that match no rule of the model', () => {
    const situation = mapAnswersToSituation(engine, schema, {
      'question-purement-formulaire': 'valeur',
    })
    expect(situation).toEqual({})
  })
})

describe('calculateEligibility on the entreprise-innovation model', () => {
  it('evaluates dispositifs and returns montant and eligibility buckets', () => {
    const results = calculateEligibility(rules as any, schema, {
      'nature-activite': ['industrielle'],
    })

    const evaluated = [
      ...results.eligibleDispositifs,
      ...results.potentialDispositifs,
      ...results.ineligibleDispositifs,
    ]
    expect(evaluated.map(d => d.id).sort()).toEqual(['cii', 'cir'])
    expect(results.aidesResults).toHaveProperty('cir-eligibilite')
    expect(results.aidesResults).toHaveProperty('cir')
  })

  it('reports missing variables on undetermined dispositifs', () => {
    const results = calculateEligibility(rules as any, schema, {})
    for (const dispositif of results.potentialDispositifs) {
      expect(dispositif.missingInfo!.length).toBeGreaterThan(0)
    }
    const total = results.eligibleDispositifs.length
      + results.potentialDispositifs.length
      + results.ineligibleDispositifs.length
    expect(total).toBe(2)
  })
})

describe('calculateEligibilityV3', () => {
  const { dataSchema } = migrateV2ToV3(schema)

  it.each([
    { 'nature-activite': ['industrielle'] },
    { 'nature-activite': ['commerciale', 'artisanale'], 'date-de-creation': '2024-03-10', 'activite-nouvelle': true },
    {},
  ])('gives the results of the v2 form for the answers %j', (answers) => {
    expect(calculateEligibilityV3(rules as any, dataSchema, answers, schema.dispositifs))
      .toEqual(calculateEligibility(rules as any, schema, answers))
  })

  it('reads the choices of a checkbox answer from `enum`', () => {
    const enumSchema = {
      type: 'object',
      properties: {
        'nature-activite': { type: 'array', uniqueItems: true, items: { enum: ['industrielle', 'commerciale', 'artisanale', 'agricole'] } },
      },
    }
    const answers = { 'nature-activite': ['industrielle'] }
    expect(calculateEligibilityV3(rules as any, enumSchema, answers, schema.dispositifs))
      .toEqual(calculateEligibility(rules as any, schema, answers))
  })
})
