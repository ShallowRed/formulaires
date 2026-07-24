# Exemple : intégrer le simulateur dans une application Vue existante

Cette application d'une page joue le rôle du « site existant » : un habillage à elle
(en-tête sombre, titre), et le simulateur d'aides à l'innovation monté au milieu, via
les packages du kit. C'est la **voie C** du [guide d'intégration](../../docs/integration.md).

## Ce que montre l'exemple

- [`src/main.ts`](src/main.ts) — étape 2 : charger les feuilles de style DSFR une fois
- [`src/App.vue`](src/App.vue) — étape 3 : `useSurvey(formSchema)` + `<SurveyForm>` +
  calcul d'éligibilité recalculé à chaque réponse
- [`src/ResultatsSimulation.vue`](src/ResultatsSimulation.vue) — étape 4 : un affichage
  de résultats maison (une trentaine de lignes), car cette partie appartient au site hôte

Aucun store, aucun routeur, aucun serveur : la mécanique du formulaire vit dans les
packages, le calcul dans le navigateur.

## Lancer

```bash
# depuis la racine du dépôt
pnpm install
pnpm --filter integration-vue dev
```

> Dans ce dépôt, les packages `@shallowred/survey-*` sont résolus par le workspace pnpm.
> Depuis un projet extérieur, remplacez les `workspace:*` par les versions npm quand
> elles seront publiées (voir le guide d'intégration pour le statut).
