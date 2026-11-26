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
  /** What the renderers read, one item per keyword */
  reads: string[]
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
      'Le schéma des entrées de la règle de calcul du quotient familial des agents du ministère de l\'Agriculture, tel que datapi l\'expose.',
    ],
    reads: [
      '`x-legal-basis` du groupe « Ménage de l\'agent » => lien « Base légale » vers la note de service',
      '`x-source` du revenu fiscal de référence => badge « Donnée certifiable » et nom du fournisseur',
      '`minItems` de la liste des foyers fiscaux => bouton de suppression désactivé tant qu\'il reste un seul foyer',
    ],
    schema: quotientFamilial,
    data: { menage: { membres_du_foyer: [{}] } },
  },
  {
    slug: 'droit-de-vote',
    title: 'Droit de vote',
    description: [
      'Le schéma des entrées de la règle du droit de vote, tel que datapi l\'expose. Chaque condition renvoie à l\'article du code électoral ou de la Constitution qui la fonde.',
    ],
    reads: [
      '`x-legal-basis` de chaque champ => lien « Base légale » sous son libellé',
      '`x-source` de l\'âge => badge « Donnée certifiable » et FranceConnect comme fournisseur',
      '`required` du schéma => « (optionnel) » à la fin du libellé des autres champs',
    ],
    schema: droitDeVote,
  },
  {
    slug: 'listes',
    title: 'Listes répétables',
    description: [
      'Un tableau d\'objets s\'affiche en groupes que la personne ajoute ou retire. Le focus clavier reste dans la liste après un ajout ou un retrait.',
    ],
    reads: [
      '`items` => un groupe de champs par élément, titré par le `title` de `items`',
      '`minItems` et `maxItems` => boutons d\'ajout et de suppression désactivés aux bornes',
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
    reads: [
      '`oneOf` de `const` et `title` => libellé de chaque option',
      '`format` des options du uischema, `radio` ou `select` => forme du choix, quel que soit le nombre d\'options',
      '`type: array` et `uniqueItems` => cases à cocher',
      '`choices.<valeur>.tooltip` des options du uischema => bouton d\'infobulle après le libellé de l\'option',
      '`choices.<valeur>.exclusive` => case qui décoche les autres',
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
      'Un champ s\'affiche selon les réponses précédentes, et n\'est obligatoire que lorsqu\'il est affiché.',
    ],
    reads: [
      '`rule` d\'un contrôle du uischema, d\'effet `SHOW` => champ affiché quand la réponse désignée par `scope` est valide contre `schema`',
      '`if` et `then` du schéma => réponse obligatoire sous condition, que JSON Forms valide',
      '`required` des options du contrôle => libellé sans « (optionnel) », puisque JSON Forms ne lit que le `required` statique du schéma',
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
      'Les réponses de cet exemple sont fausses dès l\'ouverture, pour afficher les messages. Chaque message est en français, et celui d\'un nombre, d\'une date ou d\'une adresse électronique donne un exemple de la valeur attendue.',
    ],
    reads: [
      '`dsfrI18n` passé à JSON Forms => messages en français',
      '`format` (`email`, `date`), `minimum`, `maximum` => message qui cite la contrainte',
      '`required` => attribut `required` sur le champ et mention des champs obligatoires en tête du formulaire',
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
