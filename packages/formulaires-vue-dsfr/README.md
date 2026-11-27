# @shallowred/formulaires-vue-dsfr

Composants Vue 3 du [DSFR](https://www.systeme-de-design.gouv.fr/) pour [JSON Forms](https://jsonforms.io/) : champs, listes répétables, étapes d'un questionnaire, base légale et donnée certifiable de chaque entrée.

## Installation

L'archive de chaque version est attachée à une release de survey-kit, sous l'étiquette `formulaires-vue-dsfr-v<version>` :

```bash
pnpm add https://github.com/ShallowRed/survey-kit/releases/download/formulaires-vue-dsfr-v0.1.0/shallowred-formulaires-vue-dsfr-0.1.0.tgz
```

L'application installe aussi `vue`, `@jsonforms/core` et `@jsonforms/vue` en version 3.8, `@gouvminint/vue-dsfr` 8 à partir de la 8.11, et charge les feuilles de style du DSFR.

## Usage

```vue
<script setup lang="ts">
import { JsonForms } from '@jsonforms/vue'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/formulaires-vue-dsfr'
import '@shallowred/formulaires-vue-dsfr/styles'

const ajv = createAjv2020()
</script>

<template>
  <JsonForms
    :schema="schema"
    :data="data"
    :renderers="dsfrRenderers"
    :ajv="ajv"
    :i18n="dsfrI18n"
    @change="onChange"
  />
</template>
```

JSON Forms crée par défaut une instance Ajv draft-07, qui refuse un schéma 2020-12 : `createAjv2020` crée l'instance qui le valide.

`dsfrI18n` écrit les messages d'erreur en français. Comme le demande le DSFR, le message d'un nombre, d'une date ou d'une adresse électronique donne un exemple de la valeur attendue. JSON Forms demande d'abord à `translate` une clé propre au champ, par exemple `foyers.error.minItems` : pour remplacer un message, l'application répond à cette clé et passe les autres à `dsfrI18n.translate`.

Pour ajouter ses propres composants, l'application gèle sa liste comme `dsfrRenderers`, ainsi que le [README de `@jsonforms/vue`](https://github.com/eclipsesource/jsonforms/blob/master/packages/vue/README.md) le recommande : `Object.freeze([...dsfrRenderers, { renderer, tester }])`.

## Effets du schéma et du uischema

Dans le JSON Schema :

- `x-legal-basis`, de forme `{ title, url }`, ajoute sous le libellé un lien « Base légale ».
- `x-source`, de forme `{ provider, data }`, ajoute le badge « Donnée certifiable » et le nom du fournisseur.
- `minItems` et `maxItems` d'une liste désactivent les boutons d'ajout et de suppression quand la liste atteint ces bornes.

Dans les options du uischema :

- `format`, `radio` ou `select`, fixe la forme d'un choix. Par défaut, un choix s'affiche en boutons radio jusqu'à cinq options et en liste déroulante au-delà.
- `tooltip`, texte ou `{ content }`, ajoute une aide sous le libellé.
- `choices` est un objet indexé par la valeur de chaque option. Son `tooltip` ajoute après le libellé de l'option un bouton d'infobulle du DSFR, nommé par son `buttonLabel`. Son `exclusive` fait de l'option une case qui décoche les autres. Un choix dont une option a une infobulle s'affiche en boutons radio, sauf avec `format: 'select'`, puisqu'une liste déroulante ne peut pas montrer d'infobulle.
- `rich` affiche chaque option d'un choix, d'une question oui ou non ou d'une liste de cases à cocher dans un cadre cliquable, celui du bouton radio riche du DSFR. Le bouton d'infobulle d'une option se place à côté de son cadre.
- `placeholder` donne le texte indicatif d'un champ de saisie.
- `required` rend un champ requis sous condition, car JSON Forms déduit le caractère requis du seul `required` statique du schéma.

Les composants n'affichent pas les options `notion`, `additionalNotions` et `autocomplete`, que le compilateur de formulaires-schema v3 écrit aussi.

Le composant d'un uischema `Categorization` affiche ses catégories en étapes. À chaque changement d'étape, il fait défiler le formulaire jusqu'en haut de l'écran, place le focus sur la page et l'annonce aux lecteurs d'écran. Au clic sur « Terminer », sur la dernière page, il émet l'événement DOM `categorization-complete`, avec `bubbles: true` et les réponses dans `detail` : l'application l'écoute sur un élément parent du formulaire. Le composant d'un élément `IntermediaryResults` liste les résultats qu'un moteur calculera : pour afficher les valeurs, l'application déclare son propre composant avec un rang supérieur.

Sans uischema, un objet affiche les champs de ses `properties`. Les conditions d'un `allOf`, comme les `if`/`then` du format v3, s'appliquent à ces champs, mais le libellé d'un champ obligatoire sous condition garde « (optionnel) » : pour l'éviter, on passe un uischema dont le contrôle de ce champ a l'option `required`, comme celui que produit le compilateur de formulaires-schema v3. Un champ déclaré dans une branche de `anyOf` ou de `oneOf` n'est pas affiché.

Dès l'affichage, un objet obligatoire et absent des données prend la valeur `{}` quand l'objet qui le contient existe, pour que chacun de ses champs signale sa réponse manquante : l'application reçoit cette valeur par l'événement `change`, avant toute saisie. Un objet qui ne contient aucune réponse quitte les données dès qu'il est masqué ou facultatif.

Chaque champ obligatoire a l'attribut `required`, sans astérisque, et le libellé d'un champ facultatif se termine par « (optionnel) ». L'application pose l'attribut `novalidate` sur son formulaire, pour que le navigateur n'affiche pas ses propres messages.

Le formulaire, et chaque page d'un questionnaire en étapes, s'ouvre par la mention « Sauf mention contraire, tous les champs sont obligatoires. ». Pour un groupe de cases à cocher, HTML et ARIA n'ont pas d'attribut qui demande au moins une case cochée : cette mention et « (optionnel) » sont la seule indication.
