# survey-kit

Un format de questionnaire, des composants [DSFR](https://www.systeme-de-design.gouv.fr/) pour [JSON Forms](https://jsonforms.io/) et un adaptateur vers le moteur de calcul [publicodes](https://publi.codes). On décrit en JSON le formulaire d'une démarche, et les composants l'affichent avec le DSFR, dans le navigateur. Les briques viennent d'[aides-simplifiées](https://github.com/betagouv/aides-simplifiees-app).

Démo en ligne : <https://shallowred.github.io/survey-kit/>

## Le site de démonstration

Le site a une rubrique par usage :

- intégrer un formulaire : `@shallowred/jsonforms-vue-dsfr` affiche le formulaire d'un JSON Schema 2020-12, avec la base légale et la source certifiable de chaque réponse ; chaque exemple montre le schéma à côté du formulaire ;
- écrire un questionnaire : le format survey-schema v3 range les réponses en étapes et en pages et contient les conditions d'affichage ; un éditeur montre le formulaire que produisent les deux documents ;
- assembler un simulateur : un questionnaire relié à un modèle publicodes, d'un exemple en deux fichiers au simulateur d'aides à l'innovation d'entreprise.service-public.fr.

## Contenu

| Package | Rôle | Provenance |
|---|---|---|
| [`@shallowred/survey-schema`](packages/survey-schema) | Cœur agnostique : types, normalisation, conditions de visibilité, validation | branche `feature/survey-schema-package` d'aides-simplifiées, alignée sur le comportement de production |
| [`@shallowred/survey-vue-dsfr`](packages/survey-vue-dsfr) | Composable headless `useSurvey` + composants DSFR | runtime de production d'aides-simplifiées, découplé de l'application |
| [`@shallowred/survey-publicodes`](packages/survey-publicodes) | Projection réponses → situation publicodes, calcul d'éligibilité et de montants | service de production d'aides-simplifiées |
| [`@shallowred/form-entreprise-innovation`](packages/form-entreprise-innovation) | Le formulaire déclaratif (78 questions, 65 conditions), copie conforme de la production | `public/forms/entreprise-innovation.json` |
| [`@shallowred/jsonforms-vue-dsfr`](packages/jsonforms-vue-dsfr) | Composants DSFR pour JSON Forms : champs, listes répétables, étapes, base légale et donnée certifiable | écrit pour le format v3 de survey-schema, sur le cœur de JSON Forms |
| [`apps/demo`](apps/demo) | Site de démonstration | ce dépôt |
| [`examples/integration-vue`](examples/integration-vue) | Exemple d'intégration du simulateur dans une application Vue existante | ce dépôt |

Le [guide d'intégration](docs/integration.md) décrit comment installer le simulateur d'aides à l'innovation sur un site existant : iframe, hébergement du build statique ou intégration native en Vue.

Le comportement du formulaire est vérifié par des tests automatisés, rejoués sur le formulaire réel et sur le modèle publicodes publié.

## Démarrer

```bash
git clone https://github.com/ShallowRed/survey-kit
cd survey-kit
pnpm install
pnpm --filter demo dev
```

Autres commandes : `pnpm build` (packages), `pnpm test` (tous les tests), `pnpm --filter demo build` (site statique dans `apps/demo/dist`, déployable sur n'importe quel hébergement de fichiers).

## Statut et limites

Démonstration technique. Les questions `combobox`/autocomplétion et les boutons « notion » de l'application d'origine ne sont pas portés (non utilisés par ce formulaire). Deux points d'attention sur le package npm du modèle sont documentés dans [packages/survey-publicodes](packages/survey-publicodes) (dépendance de build cassée, syntaxe d'import JSON retirée de Node ≥ 22).
