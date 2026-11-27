import type { SurveySchemaV3 } from '@shallowred/formulaires-schema'

export const bikeAidAnswers = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    'age': { type: 'integer', title: 'Quel est votre âge ?', minimum: 0, maximum: 120 },
    'boursier': { type: 'boolean', title: 'Êtes-vous boursier ?' },
    'velo-electrique': { type: 'boolean', title: 'Le vélo est-il électrique ?' },
    'prix': { type: 'number', title: 'Prix du vélo (en euros)', minimum: 0 },
  },
}

export const bikeAidQuestionnaire: SurveySchemaV3 = {
  schemaVersion: '3.0.0',
  id: 'aide-velo',
  version: '1.0.0',
  title: 'Aide à l\'achat d\'un vélo',
  data: './aide-velo.schema.json',
  steps: [
    {
      id: 'profil',
      title: 'Votre profil',
      pages: [
        {
          id: 'profil-page',
          questions: [
            { scope: '#/properties/age' },
            { scope: '#/properties/boursier' },
          ],
        },
      ],
    },
    {
      id: 'velo',
      title: 'Votre vélo',
      pages: [
        {
          id: 'velo-page',
          questions: [
            {
              scope: '#/properties/velo-electrique',
              visibleWhen: {
                allOf: [
                  { scope: '#/properties/age', schema: { minimum: 18 } },
                  { scope: '#/properties/age', schema: { maximum: 25 } },
                ],
              },
            },
            { scope: '#/properties/prix' },
          ],
        },
      ],
    },
  ],
}

export const bikeAidDispositifs = [
  { id: 'aideVelo', title: 'Aide à l\'achat d\'un vélo', description: 'Aide fictive, sans existence réglementaire.' },
]

export const bikeAidRules = {
  'age': { titre: 'Âge' },
  'boursier': { 'titre': 'Boursier', 'par défaut': 'non' },
  'veloElectrique': { 'titre': 'Vélo électrique', 'par défaut': 'non' },
  'aideVelo': { titre: 'Aide à l\'achat d\'un vélo' },
  'aideVelo . eligibilite': {
    'toutes ces conditions': ['age >= 18', 'age <= 25'],
  },
  'aideVelo . montant': {
    'applicable si': 'aideVelo . eligibilite',
    'somme': ['aideVelo . base', 'aideVelo . bonusBoursier'],
  },
  'aideVelo . base': {
    variations: [
      { si: 'veloElectrique', alors: '400 €' },
      { sinon: '150 €' },
    ],
  },
  'aideVelo . bonusBoursier': {
    variations: [
      { si: 'boursier', alors: '100 €' },
      { sinon: '0 €' },
    ],
  },
}
