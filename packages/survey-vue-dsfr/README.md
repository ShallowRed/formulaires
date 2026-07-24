# @shallowred/survey-vue-dsfr

Rendu Vue 3 + [DSFR](https://www.systeme-de-design.gouv.fr/) des formulaires
[survey-schema](../survey-schema).

> Extraction du runtime de production d'[aides-simplifiées](https://github.com/betagouv/aides-simplifiees-app)
> (`inertia/composables/surveys/*` et `inertia/components/survey/*`), découplée de
> l'application : plus de Pinia, plus d'Inertia/AdonisJS, plus d'analytics.

## Deux couches

- **`useSurvey(schema)`** : composable headless (sans rendu). Normalise le schéma, tient
  les réponses, calcule la visibilité conditionnelle (via le `ConditionEvaluator` du cœur),
  la navigation entre pages visibles, la validation et la progression.
- **`<SurveyForm :survey="survey" @complete="..." />`** : rendu DSFR complet — stepper,
  pages, questions (radio, cases à cocher, booléen, nombre, date), navigation. La page de
  résultats intermédiaires est un slot `#results-page` : l'affichage des résultats moteur
  reste la responsabilité de l'application hôte, le rendu ne connaît aucun moteur.

## Usage

```vue
<script setup>
import schema from '@shallowred/form-entreprise-innovation'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'

const survey = useSurvey(schema)
</script>

<template>
  <SurveyForm :survey="survey" @complete="onComplete">
    <template #results-page>
      <!-- résultats d'éligibilité, calculés par l'app hôte -->
    </template>
  </SurveyForm>
</template>
```

## Distribution

Package **source** (`.vue` + `.ts` non compilés), à consommer par un bundler qui gère les
SFC (Vite + `@vitejs/plugin-vue`). Pairs attendus : `vue >= 3.4`, `@gouvminint/vue-dsfr >= 8`
(et les feuilles de style DSFR chargées par l'application).

## Périmètre non porté

- `combobox` / autocomplétion (couplée aux services de l'app d'origine)
- boutons « notion » (liens vers des pages internes de l'app d'origine)
- suivi analytics et écran d'accueil du simulateur
