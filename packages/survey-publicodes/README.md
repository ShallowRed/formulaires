# @shallowred/survey-publicodes

Runner d'éligibilité publicodes pour les formulaires [survey-schema](../survey-schema).

> Portage fidèle du service de production d'[aides-simplifiées](https://github.com/betagouv/aides-simplifiees-app)
> (`inertia/services/eligibility_service.ts`), découplé du store applicatif : le schéma
> normalisé est passé en argument.

## Ce que fait le runner

1. **`mapAnswersToSituation(engine, schema, answers)`** : projette les réponses du formulaire
   vers une situation publicodes : identifiants kebab-case convertis en camelCase, réponses
   sans règle correspondante écartées, cases à cocher dépliées en sous-règles booléennes
   (`natureActivite . industrielle: 'oui'`), booléens en `oui`/`non`, dates au format
   `JJ/MM/AAAA`, chaînes entre guillemets.
2. **`calculateEligibility(rules, schema, answers)`** : évalue `<dispositif> . eligibilite`
   et `<dispositif> . montant` pour chaque dispositif déclaré par le schéma, et classe les
   résultats en éligible / non éligible / indéterminé (avec les variables manquantes).

Le moteur est créé avec `automaticNamespaceDisabling: false`, requis par le modèle
entreprise-innovation (les espaces de noms frères restent actifs indépendamment).

## Exemple

```ts
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'

const results = calculateEligibility(rules, schema, answers)
// results.eligibleDispositifs, results.potentialDispositifs, results.ineligibleDispositifs
```

> Note : l'entrée principale du package npm du modèle utilise `assert { type: 'json' }`,
> syntaxe retirée de Node >= 22. Importer le JSON compilé directement (comme ci-dessus)
> contourne le problème. Sa dépendance `@publicodes/tools` (outillage de build déclaré en
> dépendance runtime) est neutralisée par un override pnpm à la racine du monorepo.

Tout s'exécute dans le navigateur : aucune API n'est appelée.
