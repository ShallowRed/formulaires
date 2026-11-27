import type { UISchemaElement, ValidationMode } from '@jsonforms/core'
import { RuleEffect } from '@jsonforms/core'
// Copies of the input_schema of two manifests in the examples of datapi
import droitDeVote from './civique-droit-vote.schema.json'
import quotientFamilial from './prestagri-quotient-familial.schema.json'

export interface IntegrationExample {
  slug: string
  title: string
  /** Paragraphs; text between backticks is code */
  description: string[]
  /** What the schema changes in the form, one sentence per keyword; text between backticks is code */
  effects: string[]
  schema: Record<string, unknown>
  uischema?: UISchemaElement
  data?: Record<string, unknown>
  validationMode?: ValidationMode
}

export const integrationExamples: IntegrationExample[] = [
  {
    slug: 'quotient-familial',
    title: 'Quotient familial de Prest\'Agri',
    description: [
      'Ce schéma décrit les entrées de la règle du quotient familial des agents du ministère de l\'Agriculture. Il est copié depuis datapi.',
    ],
    effects: [
      'Le groupe « Ménage de l\'agent » affiche un lien « Base légale » vers la note de service que cite son `x-legal-basis`.',
      'Le revenu fiscal de référence affiche le badge « Donnée certifiable » et le nom du fournisseur que donne son `x-source`.',
      'Le bouton de suppression d\'un foyer fiscal est désactivé quand la liste compte un seul foyer, le minimum fixé par son `minItems`.',
    ],
    schema: quotientFamilial,
    data: { menage: { membres_du_foyer: [{}] } },
  },
  {
    slug: 'droit-de-vote',
    title: 'Droit de vote',
    description: [
      'Ce schéma décrit les entrées de la règle du droit de vote. Il est copié depuis datapi, et chaque condition cite son article du code électoral ou de la Constitution.',
    ],
    effects: [
      'Chaque champ affiche sous son libellé un lien « Base légale » vers l\'article que cite son `x-legal-basis`.',
      'L\'âge affiche le badge « Donnée certifiable » et FranceConnect comme fournisseur, d\'après son `x-source`.',
      'Le libellé d\'un champ absent du `required` du schéma se termine par « (optionnel) ».',
    ],
    schema: droitDeVote,
  },
  {
    slug: 'listes',
    title: 'Listes répétables',
    description: [
      'Chaque élément du tableau s\'affiche en groupe de champs, que la personne ajoute ou retire. Le focus clavier reste dans la liste.',
    ],
    effects: [
      'Chaque élément de la liste s\'affiche en groupe de champs, avec le `title` de `items` pour titre.',
      'Les boutons d\'ajout et de suppression sont désactivés quand la liste atteint son `maxItems` ou son `minItems`.',
    ],
    schema: {
      type: 'object',
      required: ['enfants'],
      properties: {
        enfants: {
          type: 'array',
          title: 'Enfants à charge',
          minItems: 1,
          maxItems: 3,
          items: {
            type: 'object',
            title: 'Enfant',
            required: ['prenom', 'date_naissance'],
            properties: {
              prenom: { type: 'string', title: 'Prénom' },
              date_naissance: { type: 'string', format: 'date', title: 'Date de naissance' },
            },
          },
        },
      },
    },
    data: { enfants: [{}] },
  },
  {
    slug: 'choix',
    title: 'Choix',
    description: [
      'Un choix s\'affiche en boutons radio jusqu\'à cinq options, en liste déroulante au-delà, et en cases à cocher quand la personne peut en cocher plusieurs.',
    ],
    effects: [
      'Le libellé de chaque option est le `title` de son entrée dans `oneOf`, et sa valeur est le `const`.',
      'L\'option `format` du uischema, `radio` ou `select`, fixe la forme du choix quel que soit le nombre d\'options.',
      'Un champ de `type: array` avec `uniqueItems` s\'affiche en cases à cocher.',
      'L\'option `choices.<valeur>.tooltip` du uischema ajoute un bouton d\'infobulle après le libellé de l\'option.',
      'Une option marquée `choices.<valeur>.exclusive` décoche les autres cases quand on la coche.',
      'L\'option `rich` du uischema affiche chaque option dans un cadre cliquable, comme le bouton radio riche du DSFR : ici, les cases à cocher des aides.',
    ],
    schema: {
      type: 'object',
      required: ['situation', 'region', 'aides'],
      properties: {
        situation: {
          type: 'string',
          title: 'Votre situation professionnelle',
          oneOf: [
            { const: 'salarie', title: 'Salarié ou salariée' },
            { const: 'independant', title: 'Travailleur ou travailleuse indépendante' },
            { const: 'demandeur_emploi', title: 'Demandeur ou demandeuse d\'emploi' },
            { const: 'etudiant', title: 'Étudiant ou étudiante' },
            { const: 'retraite', title: 'Retraité ou retraitée' },
          ],
        },
        region: {
          type: 'string',
          title: 'Votre région',
          oneOf: [
            { const: 'ara', title: 'Auvergne-Rhône-Alpes' },
            { const: 'bfc', title: 'Bourgogne-Franche-Comté' },
            { const: 'bre', title: 'Bretagne' },
            { const: 'cvl', title: 'Centre-Val de Loire' },
            { const: 'ges', title: 'Grand Est' },
            { const: 'hdf', title: 'Hauts-de-France' },
            { const: 'idf', title: 'Île-de-France' },
          ],
        },
        aides: {
          type: 'array',
          title: 'Aides que vous percevez',
          uniqueItems: true,
          items: {
            oneOf: [
              { const: 'apl', title: 'Aide personnalisée au logement' },
              { const: 'rsa', title: 'Revenu de solidarité active' },
              { const: 'prime_activite', title: 'Prime d\'activité' },
              { const: 'aucune', title: 'Aucune de ces aides' },
            ],
          },
        },
      },
    },
    uischema: {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/situation',
          options: {
            choices: {
              independant: { tooltip: 'Micro-entrepreneur, profession libérale, artisan ou commerçant.' },
            },
          },
        },
        { type: 'Control', scope: '#/properties/region' },
        {
          type: 'Control',
          scope: '#/properties/aides',
          options: {
            rich: true,
            choices: {
              aucune: { exclusive: true },
            },
          },
        },
      ],
    },
  },
  {
    slug: 'conditions',
    title: 'Conditions d\'affichage',
    description: [
      'Un champ s\'affiche selon une réponse précédente, et il est obligatoire seulement quand il est affiché.',
    ],
    effects: [
      'Une `rule` d\'effet `SHOW` sur un contrôle du uischema affiche le champ quand la réponse désignée par son `scope` est valide contre son `schema`.',
      'Les mots-clés `if` et `then` du schéma rendent une réponse obligatoire sous condition, et JSON Forms applique cette condition à la validation.',
      'L\'option `required` du contrôle retire « (optionnel) » du libellé, car JSON Forms lit seulement le `required` statique du schéma.',
    ],
    schema: {
      type: 'object',
      required: ['salarie'],
      properties: {
        salarie: { type: 'boolean', title: 'Êtes-vous salarié ou salariée ?' },
        employeur: { type: 'string', title: 'Nom de votre employeur' },
      },
      allOf: [
        {
          if: { required: ['salarie'], properties: { salarie: { const: true } } },
          then: { required: ['employeur'] },
        },
      ],
    },
    uischema: {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/salarie' },
        {
          type: 'Control',
          scope: '#/properties/employeur',
          options: { required: true },
          rule: {
            effect: RuleEffect.SHOW,
            condition: { scope: '#/properties/salarie', schema: { const: true }, failWhenUndefined: true },
          },
        },
      ],
    },
  },
  {
    slug: 'erreurs',
    title: 'Messages d\'erreur',
    description: [
      'Les réponses de cet exemple sont fausses dès l\'ouverture. Les messages sont en français, et ceux d\'un nombre, d\'une date ou d\'une adresse électronique donnent un exemple de valeur attendue.',
    ],
    effects: [
      'Les messages sont en français grâce à `dsfrI18n`, passé à JSON Forms.',
      'Les messages d\'un `format` (`email`, `date`), d\'un `minimum` ou d\'un `maximum` citent la contrainte.',
      'Un champ listé dans `required` reçoit l\'attribut `required`, et le formulaire indique en tête quels champs sont obligatoires.',
    ],
    schema: {
      type: 'object',
      required: ['courriel', 'revenu', 'date_debut'],
      properties: {
        courriel: { type: 'string', format: 'email', title: 'Adresse électronique' },
        revenu: { type: 'number', minimum: 0, title: 'Revenu mensuel (en euros)' },
        date_debut: { type: 'string', format: 'date', title: 'Date de début du contrat' },
        telephone: { type: 'string', title: 'Numéro de téléphone' },
      },
    },
    data: { courriel: 'marie.dupont', revenu: -120 },
    validationMode: 'ValidateAndShow',
  },
]
