# formulaires

Un format de formulaire, des composants [DSFR](https://www.systeme-de-design.gouv.fr/) pour [JSON Forms](https://jsonforms.io/) et un adaptateur pour le moteur de calcul [publicodes](https://publi.codes). Le format et l'adaptateur viennent d'[aides-simplifiées](https://github.com/betagouv/aides-simplifiees-app).

Démo en ligne : <https://shallowred.github.io/formulaires/>

## Site de démonstration

- Intégrer un formulaire : formulaire DSFR tiré d'un JSON Schema 2020-12, avec base légale et source certifiable de chaque réponse.
- Écrire un formulaire : éditeur du schéma des réponses et des étapes, avec aperçu.
- Assembler un simulateur : formulaire relié à un modèle publicodes, d'une aide fictive à l'achat d'un vélo au simulateur des aides à l'innovation.

## Contenu

| Package | Rôle | Provenance |
|---|---|---|
| [`@shallowred/formulaires-schema`](packages/formulaires-schema) | Cœur agnostique : types, normalisation, conditions de visibilité, validation | branche `feature/survey-schema-package` d'aides-simplifiées, alignée sur le comportement de production |
| [`@shallowred/survey-vue-dsfr`](packages/survey-vue-dsfr) | Composable headless `useSurvey` + composants DSFR | runtime de production d'aides-simplifiées, découplé de l'application |
| [`@shallowred/formulaires-publicodes`](packages/formulaires-publicodes) | Projection réponses → situation publicodes, calcul d'éligibilité et de montants | service de production d'aides-simplifiées |
| [`@shallowred/form-entreprise-innovation`](packages/form-entreprise-innovation) | Le formulaire déclaratif (78 questions, 65 conditions), copie conforme de la production | `public/forms/entreprise-innovation.json` |
| [`@shallowred/formulaires-vue-dsfr`](packages/formulaires-vue-dsfr) | Composants DSFR pour JSON Forms : champs, listes répétables, étapes, base légale et donnée certifiable | écrit pour le format v3 de formulaires-schema, sur le cœur de JSON Forms |
| [`apps/demo`](apps/demo) | Site de démonstration | ce dépôt |
| [`examples/integration-vue`](examples/integration-vue) | Exemple d'intégration du simulateur dans une application Vue existante | ce dépôt |

Le [guide d'intégration](docs/integration.md) décrit comment installer le simulateur d'aides à l'innovation sur un site existant : iframe, hébergement du build statique ou intégration native en Vue.

Le comportement du formulaire est vérifié par des tests automatisés, rejoués sur le formulaire réel et sur le modèle publicodes publié.

## Démarrer

```bash
git clone https://github.com/ShallowRed/formulaires
cd formulaires
pnpm install
pnpm --filter demo dev
```

Autres commandes : `pnpm build` (packages), `pnpm test` (tous les tests), `pnpm --filter demo build` (site statique dans `apps/demo/dist`, déployable sur n'importe quel hébergement de fichiers).

## Statut et limites

Démonstration technique. Les questions `combobox`/autocomplétion et les boutons « notion » de l'application d'origine ne sont pas portés (non utilisés par ce formulaire). Deux points d'attention sur le package npm du modèle sont documentés dans [packages/formulaires-publicodes](packages/formulaires-publicodes) (dépendance de build cassée, syntaxe d'import JSON retirée de Node ≥ 22).
