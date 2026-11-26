# Exemple : intégrer le simulateur dans une application Vue existante

Cette application d'une page joue le rôle du site existant : elle a son propre habillage (en-tête sombre, titre) et affiche le simulateur d'aides à l'innovation avec les paquets du kit. Elle illustre la section « Composants dans une application Vue » du [guide d'intégration](../../docs/integration.md).

## Fichiers

- [`src/main.ts`](src/main.ts) charge les feuilles de style du DSFR.
- [`src/App.vue`](src/App.vue) convertit le formulaire, l'affiche avec JSON Forms et calcule l'éligibilité à chaque réponse.
- [`src/ResultatsIntermediaires.vue`](src/ResultatsIntermediaires.vue) affiche le calcul dans la page de résultats intermédiaires du formulaire.
- [`src/ResultatsSimulation.vue`](src/ResultatsSimulation.vue) affiche les résultats, une partie qui appartient au site hôte.

## Lancer

```bash
# depuis la racine du dépôt
pnpm install
pnpm --filter integration-vue dev
```

Dans ce dépôt, le workspace pnpm résout les paquets `@shallowred/`. Le guide d'intégration indique comment les installer depuis un projet extérieur.
