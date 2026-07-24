# survey-kit

Les briques ouvertes du simulateur d'aides à l'innovation
(entreprise.service-public.fr), extraites d'[aides-simplifiées](https://github.com/betagouv/aides-simplifiees-app)
et réassemblées en un site de démonstration autonome.

**Démo en ligne : <https://shallowred.github.io/survey-kit/>**

## Pourquoi

Le simulateur d'aides à l'innovation repose sur une architecture en trois couches,
chacune open source et maintenable indépendamment :

1. **le modèle de calcul** — les règles des 6 dispositifs (CIR, CII, CICo, JEI, JEU, JEC)
   en [publicodes](https://publi.codes), lisibles et auditables :
   [betagouv/publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation) ;
2. **le formulaire déclaratif** — un JSON (questions, types, conditions de visibilité)
   modifiable sans toucher au code ;
3. **le moteur de rendu** — navigation, visibilité conditionnelle, validation, rendu
   [DSFR](https://www.systeme-de-design.gouv.fr/), projection des réponses vers le moteur.

Ce dépôt isole les couches 2 et 3 en packages, et les assemble dans un site statique :
la preuve qu'une reprise du simulateur n'exige ni l'application aides-simplifiées, ni
aucun serveur de calcul — tout s'exécute dans le navigateur.

## Contenu

| Package | Rôle | Provenance |
|---|---|---|
| [`@shallowred/survey-schema`](packages/survey-schema) | Cœur agnostique : types, normalisation, conditions de visibilité, validation | branche `feature/survey-schema-package` d'aides-simplifiées, alignée sur le comportement de production |
| [`@shallowred/survey-vue-dsfr`](packages/survey-vue-dsfr) | Composable headless `useSurvey` + composants DSFR | runtime de production d'aides-simplifiées, découplé de l'application |
| [`@shallowred/survey-publicodes`](packages/survey-publicodes) | Projection réponses → situation publicodes, calcul d'éligibilité et de montants | service de production d'aides-simplifiées |
| [`@shallowred/form-entreprise-innovation`](packages/form-entreprise-innovation) | Le formulaire déclaratif (78 questions, 65 conditions), copie conforme de la production | `public/forms/entreprise-innovation.json` |
| [`apps/demo`](apps/demo) | Site de démonstration (vitrine), déployé sur GitHub Pages | — |
| [`examples/integration-vue`](examples/integration-vue) | Exemple d'intégration du simulateur dans une application Vue existante | — |

Deux lectures selon le besoin : la **vitrine** (le site de démo, pour voir le simulateur
fonctionner) et le **[guide d'intégration](docs/integration.md)** (pour installer le
simulateur sur un site existant — iframe, hébergement du build statique, ou intégration
native Vue).

Le comportement du formulaire est vérifié par des tests automatisés, rejoués sur le
formulaire réel et sur le modèle publicodes publié.

## Démarrer

```bash
git clone https://github.com/ShallowRed/survey-kit
cd survey-kit
pnpm install
pnpm --filter demo dev
```

Autres commandes : `pnpm build` (packages), `pnpm test` (tous les tests),
`pnpm --filter demo build` (site statique dans `apps/demo/dist`, déployable sur
n'importe quel hébergement de fichiers).

## Statut et limites

Démonstration technique. Les questions `combobox`/autocomplétion et les boutons
« notion » de l'application d'origine ne sont pas portés (non utilisés par ce
formulaire). Deux points d'attention sur le package npm du modèle sont documentés dans
[packages/survey-publicodes](packages/survey-publicodes) (dépendance de build cassée,
syntaxe d'import JSON retirée de Node ≥ 22).
