# Installer le simulateur d'aides à l'innovation sur un site existant

On intègre le simulateur de trois façons, de la plus simple à la plus intégrée. Les trois reposent sur les mêmes paquets ; on choisit selon la pile technique du site hôte et le contrôle voulu sur l'habillage.

## Iframe

aides-simplifiées propose d'intégrer ses simulateurs par une iframe. On intègre de la même façon la page du simulateur de ce dépôt, servie par la démo sur GitHub Pages ou par son propre hébergement (voir la section suivante) :

```html
<iframe
  src="https://shallowred.github.io/survey-kit/#/assembler/aides-innovation?embed"
  title="Simulateur d'aides à l'innovation"
  style="width: 100%; min-height: 900px; border: 0;"
></iframe>
```

Le paramètre `?embed` retire l'en-tête, les menus, la bande de titre et le pied de page du site de démonstration.

- Avantage : le site hôte n'installe rien et ne déploie rien.
- Limites : le site hôte dépend de l'hébergement qui sert l'iframe, et la hauteur de l'iframe est fixe. aides-simplifiées ajuste cette hauteur par un script d'intégration versionné, propre à son application.

## Build statique

Le site de démonstration est un build statique : le calcul s'exécute dans le navigateur de l'usager, sans serveur applicatif.

```bash
git clone https://github.com/ShallowRed/survey-kit
cd survey-kit
pnpm install
pnpm --filter demo build
# copier apps/demo/dist/ sur l'hébergement, à la racine ou sous un sous-chemin
```

Le build emploie une base relative et un routage par ancre : il fonctionne à la racine d'un domaine, sous un sous-chemin ou dans une iframe, sans configuration du serveur.

- Avantage : l'équipe qui sert le build le met à jour quand elle veut, et peut l'intégrer par iframe sur son propre site.
- Limite : l'habillage reste celui du site de démonstration. Pour le changer, on intègre les composants dans l'application.

## Composants dans une application Vue

Un site hôte en Vue 3 avec Vite intègre le simulateur sous forme de composants. [`examples/integration-vue/`](../examples/integration-vue) contient une application d'une page qui joue le rôle du site existant.

### Installer les paquets

Le modèle publicodes vient de npm :

```bash
pnpm add @shallowred/publicodes-entreprise-innovation publicodes
```

`@shallowred/publicodes-entreprise-innovation` demande deux contournements, décrits dans [`packages/formulaires-publicodes`](../packages/formulaires-publicodes#readme).

On installe `@shallowred/formulaires-vue-dsfr` depuis l'archive de sa release ; son [README](../packages/formulaires-vue-dsfr#readme) donne la commande et les versions de ses dépendances pairs (Vue, JSON Forms, vue-dsfr, DSFR). On emploie les autres paquets `@shallowred/` (`formulaires-schema`, `formulaires-publicodes`, `form-entreprise-innovation`) depuis ce dépôt, en workspace pnpm comme l'exemple, ou depuis une copie du dépôt.

### Charger les feuilles de style du DSFR

Au point d'entrée de l'application :

```ts
import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'
import '@shallowred/formulaires-vue-dsfr/styles'
```

Dans ce dépôt, le workspace résout `@shallowred/formulaires-vue-dsfr` vers ses sources, qui importent déjà leur feuille de style : l'exemple se passe de la dernière ligne.

### Afficher le formulaire et calculer l'éligibilité

```vue
<script setup lang="ts">
import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import { rankWith, uiTypeIs } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import { dataSchema, dispositifs, questionnaire } from '@shallowred/form-entreprise-innovation'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/formulaires-vue-dsfr'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibilityV3 } from '@shallowred/formulaires-publicodes'
import { compileV3ToJsonForms, visibleAnswers } from '@shallowred/formulaires-schema'
import { computed, provide, ref } from 'vue'
import ResultatsIntermediaires from './ResultatsIntermediaires.vue'

const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)

function eligibilityOf(answers: Record<string, unknown>) {
  return calculateEligibilityV3(rules, dataSchema, visibleAnswers(questionnaire, answers), dispositifs)
}
provide('eligibilityOf', eligibilityOf)

const renderers = Object.freeze([
  ...dsfrRenderers,
  { renderer: ResultatsIntermediaires, tester: rankWith(5, uiTypeIs('IntermediaryResults')) },
]) as JsonFormsRendererRegistryEntry[]
const ajv = createAjv2020()

const answers = ref<Record<string, unknown>>({})
const results = computed(() => eligibilityOf(answers.value))
</script>

<template>
  <JsonForms
    :data="answers"
    :schema="schema"
    :uischema="uischema"
    :renderers="renderers"
    :ajv="ajv"
    :i18n="dsfrI18n"
    validation-mode="ValidateAndHide"
    @change="event => answers = event.data"
  />
</template>
```

Le paquet du formulaire donne le questionnaire, le schéma de ses réponses et les dispositifs à évaluer. `compileV3ToJsonForms` traduit le questionnaire et le schéma pour JSON Forms. `visibleAnswers` retire les réponses des champs masqués, et `calculateEligibilityV3` transmet les autres au modèle publicodes.

### Afficher les résultats

`results` classe les dispositifs en `eligibleDispositifs`, `potentialDispositifs` et `ineligibleDispositifs`, avec les raisons et les variables manquantes, et donne les montants dans `aidesResults`. Le site hôte écrit son propre affichage ; l'exemple en montre un, `ResultatsSimulation.vue`.

Le formulaire contient une page de résultats intermédiaires. JSON Forms l'affiche par le composant déclaré pour `IntermediaryResults` avec un rang supérieur, ici `ResultatsIntermediaires.vue`, qui lit `eligibilityOf` par `inject`. Au clic sur « Terminer », le formulaire émet l'événement DOM `categorization-complete`, que le site hôte écoute sur un élément parent pour afficher les résultats finaux.

- Avantage : le site hôte maîtrise l'habillage, les pages autour du simulateur et l'affichage des résultats, sans iframe.
- Limite : le site hôte emploie Vue 3, JSON Forms et vue-dsfr, aux versions que demande `@shallowred/formulaires-vue-dsfr`.

## Qui maintient quoi

- Le [modèle publicodes](https://github.com/betagouv/publicodes-entreprise-innovation) écrit le droit : barèmes, plafonds, conditions. Quand la réglementation change, seul ce modèle change ; les personnes qui connaissent les dispositifs le maintiennent dans son dépôt, avec ses cas de tests.
- Le formulaire JSON décrit la saisie : ordre des champs, formulations, conditions d'affichage. On le modifie sans compétence de développement particulière.
- Les composants de rendu ne contiennent rien de propre aux aides à l'innovation. Des tests comparent, sur les 78 champs du formulaire réel, les champs, les pages et les réponses requises qu'affiche JSON Forms à ceux du formulaire d'aides-simplifiées (`packages/formulaires-schema/tests/v3-equivalence.spec.ts`).

Tout le code est sous licence MIT. Le calcul s'exécute dans le navigateur de l'usager, quelle que soit la façon d'intégrer le simulateur.
