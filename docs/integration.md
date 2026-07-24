# Installer le simulateur d'aides à l'innovation sur un site existant

Trois voies d'intégration, de la plus simple à la plus intégrée. Les trois s'appuient sur
les mêmes briques ; choisir selon la pile technique du site hôte et le degré de contrôle
souhaité.

## Voie A — iframe (n'importe quelle pile, quelques lignes)

C'est le mode d'intégration actuel sur entreprise.service-public.fr. Le simulateur est
hébergé quelque part (par exemple la démo GitHub Pages de ce dépôt, ou votre propre
hébergement, voir voie B) et le site hôte l'embarque :

```html
<iframe
  src="https://shallowred.github.io/survey-kit/#/simulateur?embed"
  title="Simulateur d'aides à l'innovation"
  style="width: 100%; min-height: 900px; border: 0;"
></iframe>
```

Le paramètre `?embed` retire l'habillage du site de démonstration (en-tête, navigation,
pied de page) : il ne reste que le simulateur.

- **Pour** : aucune dépendance technique, aucun déploiement, mise à jour côté hébergeur.
- **Contre** : dépendance d'hébergement envers celui qui sert l'iframe ; hauteur fixe
  (l'auto-redimensionnement, présent dans aides-simplifiées via son script d'intégration
  versionné, n'est pas encore porté ici).

## Voie B — hébergement du build statique (n'importe quel serveur de fichiers)

Le simulateur est un build statique sans serveur applicatif : tout le calcul s'exécute
dans le navigateur de l'usager.

```bash
git clone https://github.com/ShallowRed/survey-kit
cd survey-kit
pnpm install
pnpm --filter demo build
# copier apps/demo/dist/ sur votre hébergement (racine ou sous-chemin, au choix)
```

Le build utilise une base relative et un routage par ancre : il fonctionne à la racine
d'un domaine, sous un sous-chemin, ou dans une iframe, sans configuration serveur.

- **Pour** : autonomie complète (vous servez, vous mettez à jour) ; combinable avec la
  voie A (votre site embarque VOTRE hébergement).
- **Contre** : l'habillage reste celui de la démo ; pour le personnaliser, voie C.

## Voie C — intégration native dans une application Vue

Pour un site hôte en Vue 3 (avec Vite), le simulateur s'installe comme des composants.
L'exemple complet et fonctionnel est dans
[`examples/integration-vue/`](../examples/integration-vue) — une application d'une page
qui joue le rôle du « site existant ». Le cœur tient en quatre étapes :

**1. Installer les briques**

```bash
pnpm add @shallowred/survey-schema @shallowred/survey-vue-dsfr \
  @shallowred/survey-publicodes @shallowred/form-entreprise-innovation \
  @shallowred/publicodes-entreprise-innovation publicodes @gouvminint/vue-dsfr @gouvfr/dsfr
```

> Statut : les packages `@shallowred/survey-*` ne sont pas encore publiés sur npm — en
> attendant, ce dépôt s'utilise en workspace (comme le fait l'exemple) ou en dépôt git
> vendoré. `@shallowred/publicodes-entreprise-innovation` est publié mais demande deux
> contournements documentés dans
> [`packages/survey-publicodes`](../packages/survey-publicodes#readme).

**2. Charger les feuilles de style DSFR** (une fois, au point d'entrée)

```ts
import '@gouvfr/dsfr/dist/core/core.main.min.css'
import '@gouvfr/dsfr/dist/component/component.main.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'
```

**3. Monter le simulateur**

```vue
<script setup>
import formSchema from '@shallowred/form-entreprise-innovation'
import rules from '@shallowred/publicodes-entreprise-innovation/publicodes-build/publicodes-entreprise-innovation.model.json'
import { calculateEligibility } from '@shallowred/survey-publicodes'
import { SurveyForm, useSurvey } from '@shallowred/survey-vue-dsfr'
import { computed } from 'vue'

const survey = useSurvey(formSchema)
const results = computed(() =>
  calculateEligibility(rules, survey.schema, survey.getAnswersForCalculation()),
)
</script>

<template>
  <SurveyForm :survey="survey" @complete="...">
    <template #results-page>
      <!-- votre affichage des résultats, alimenté par `results` -->
    </template>
  </SurveyForm>
</template>
```

**4. Afficher les résultats** — `results` classe les dispositifs en
`eligibleDispositifs` / `potentialDispositifs` / `ineligibleDispositifs` (avec raisons et
variables manquantes) et porte les montants dans `aidesResults`. L'affichage vous
appartient : l'exemple montre une version d'une trentaine de lignes.

- **Pour** : contrôle total de l'habillage, du parcours autour du simulateur, de la page
  de résultats ; pas d'iframe.
- **Contre** : suppose Vue 3 + Vite côté hôte (`@shallowred/survey-vue-dsfr` est
  distribué en sources `.vue`).

## Qui maintient quoi (dans les trois voies)

- **Le modèle publicodes**
  ([betagouv/publicodes-entreprise-innovation](https://github.com/betagouv/publicodes-entreprise-innovation))
  encode le droit : barèmes, plafonds, conditions. C'est la seule brique qui bouge quand
  la réglementation change ; elle se maintient dans son dépôt, avec ses cas de tests,
  par les personnes qui connaissent les dispositifs.
- **Le formulaire JSON** encode le parcours de saisie (ordre, formulations, conditions
  d'affichage) ; il se modifie sans compétence de développement particulière.
- **Le kit de rendu** est générique et ne contient rien de spécifique aux aides à
  l'innovation ; son comportement (conditions de visibilité comprises) est verrouillé
  par des tests rejoués sur le formulaire réel de 78 questions.

Tout est open source (MIT) : installable, forkable, ou copiable dans un dépôt interne.
Aucune de ces voies ne crée de dépendance à un service tiers au moment du calcul — il
s'exécute entièrement dans le navigateur de l'usager.
