# @shallowred/jsonforms-vue-dsfr

Composants Vue 3 du [DSFR](https://www.systeme-de-design.gouv.fr/) pour [JSON Forms](https://jsonforms.io/) : champs, listes répétables, étapes d'un questionnaire, base légale et donnée certifiable de chaque entrée.

## Installation

L'archive de chaque version est attachée à une release de survey-kit, sous l'étiquette `jsonforms-vue-dsfr-v<version>` :

```bash
pnpm add https://github.com/ShallowRed/survey-kit/releases/download/jsonforms-vue-dsfr-v0.1.0/shallowred-jsonforms-vue-dsfr-0.1.0.tgz
```

L'application installe aussi `vue`, `@jsonforms/core` et `@jsonforms/vue` en version 3.8, `@gouvminint/vue-dsfr` 8 à partir de la 8.11, et charge les feuilles de style du DSFR.

## Usage

```vue
<script setup lang="ts">
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import '@shallowred/jsonforms-vue-dsfr/styles'

const ajv = createAjv2020()
</script>

<template>
  <JsonForms
    :schema="schema"
    :data="data"
    :renderers="dsfrRenderers"
    :ajv="ajv"
    @change="onChange"
  />
</template>
```

JSON Forms crée par défaut une instance Ajv draft-07, qui refuse un schéma 2020-12 : `createAjv2020` crée l'instance qui le valide.

Pour ajouter ses propres composants, l'application gèle sa liste comme `dsfrRenderers`, ainsi que le [README de `@jsonforms/vue`](https://github.com/eclipsesource/jsonforms/blob/master/packages/vue/README.md) le recommande : `Object.freeze([...dsfrRenderers, { renderer, tester }])`.

## Ce que lisent les composants

Dans le JSON Schema :

- `x-legal-basis`, `{ title, url }` => lien « Base légale » sous le libellé ;
- `x-source`, `{ provider, data }` => badge « Donnée certifiable » et nom du fournisseur ;
- `minItems` et `maxItems` d'une liste => boutons d'ajout et de suppression désactivés aux bornes.

Dans les options du uischema :

- `format`, `radio` ou `select` => forme d'un choix, qui vaut par défaut des boutons radio jusqu'à cinq options et une liste déroulante au-delà ;
- `tooltip`, texte ou `{ content }` => aide sous le libellé ;
- `placeholder` => texte indicatif d'un champ de saisie ;
- `required` => champ requis sous condition. JSON Forms déduit le caractère requis du `required` statique du schéma.

Les composants n'affichent pas les options `notion`, `additionalNotions` et `autocomplete`, ni le `tooltip` d'un choix, que le compilateur de survey-schema v3 écrit aussi.

Le composant d'un uischema `Categorization` affiche ses catégories en étapes. Au clic sur « Terminer », sur la dernière page, il émet l'événement DOM `categorization-complete`, avec `bubbles: true` et les réponses dans `detail` : l'application l'écoute sur un élément parent du formulaire. Le composant d'un élément `IntermediaryResults` liste les résultats qu'un moteur calculera : pour afficher les valeurs, l'application déclare son propre composant avec un rang supérieur.
