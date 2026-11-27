# @shallowred/form-entreprise-innovation

Formulaire déclaratif du simulateur d'aides à l'innovation pour les entreprises
(CIR, CII, CICo, JEI, JEU, JEC), au format [formulaires-schema](../formulaires-schema).

## Provenance

Copie conforme de `public/forms/entreprise-innovation.json` du dépôt
[betagouv/aides-simplifiees-app](https://github.com/betagouv/aides-simplifiees-app)
(version `1.0.2` du formulaire, dernier changement `3da2033`, 2025-07-16). Ce formulaire
est celui servi en production sur entreprise.service-public.fr via aides-simplifiées.

## Contenu

- 78 questions (nombre, radio, cases à cocher, booléen, date) réparties en 4 étapes
- 65 conditions de visibilité (`visibleWhen`)
- 6 dispositifs évalués par le moteur publicodes : CIR, CII, CICo, JEI, JEU, JEC
- une page de résultats intermédiaires

Le calcul lui-même vit dans le modèle publicodes
([betagouv/publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation)) :
ce package ne porte que la couche formulaire, volontairement découplée du moteur.

## Usage

Pour JSON Forms, le paquet exporte le questionnaire et le schéma de ses réponses, que `compileV3ToJsonForms` de formulaires-schema traduit, ainsi que la liste des dispositifs à évaluer :

```ts
import { dataSchema, dispositifs, questionnaire } from '@shallowred/form-entreprise-innovation'
```

`entreprise-innovation.questionnaire.json` et `entreprise-innovation.data.schema.json` sont produits par `migrateV2ToV3` à partir du formulaire d'aides-simplifiées. Après une mise à jour de ce formulaire, on les régénère par `pnpm --filter @shallowred/formulaires-schema exec vitest run -u tests/v3-equivalence.spec.ts`.

Le formulaire d'aides-simplifiées est l'export par défaut :

```ts
import schema from '@shallowred/form-entreprise-innovation'
// ou le JSON brut :
// import schema from '@shallowred/form-entreprise-innovation/entreprise-innovation.json'
```
