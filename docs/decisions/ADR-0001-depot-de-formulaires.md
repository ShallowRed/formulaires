---
status: proposed
date: 2026-11-27
decision-makers: Lucas Poulain
---
# Publier les briques de formulaire sous le scope `@betagouv`, dans un dépôt générique

## Contexte et problème

Où place-t-on les briques de formulaire, et sous quel nom, pour qu'elles activent les services du catalogue de règles sans s'y limiter ?

Le catalogue algos.data.gouv.fr active « montrer les entrées » et « essayer la règle dans un formulaire » avec `jsonforms-vue-dsfr`, qui tire un formulaire de l'`input_schema` d'une règle ; le format du questionnaire en étapes et le calcul d'éligibilité avec publicodes servent aux simulateurs, sur le modèle d'aides-simplifiées. Lucas veut que ces briques servent aussi hors du catalogue, pour que les services publics partagent un format et des composants communs. D'après Lucas, publier sur npm sous le scope `@datagouv` demande des démarches dont l'issue est incertaine.

## Options considérées

- Placer les briques dans le dépôt du catalogue, sous les noms `@datagouv/algos-form-*`, publiées en archives avec chaque release du catalogue. Lucas écarte cette option à l'essai, parce qu'il veut « penser quand même généralisation ».
- Placer les briques dans un dépôt générique, et le format v2 d'aides-simplifiées dans un dépôt d'héritage séparé. Lucas n'a pas retenu cette option ; la section « Révision » dit quand créer ce dépôt d'héritage.

## Décision

On place les briques de formulaire dans un dépôt générique, le dépôt de formulaires, distinct du dépôt du catalogue, et on les publie sous le scope npm `@betagouv`. Le catalogue installe chaque brique à une version fixée.

Les briques de formulaire sont les paquets aujourd'hui nommés `survey-schema`, `jsonforms-vue-dsfr`, `survey-publicodes` et `survey-vue-dsfr`. L'élément `rule-form` et le composant `UiRuleForm`, qui prennent une règle et un service de calcul du catalogue, restent dans le dépôt du catalogue.

Le dépôt de formulaires garde, marqués comme dépréciés, le format v2 d'aides-simplifiées et le code qui le lit : `survey-vue-dsfr`, les exports de `survey-schema` hors de `v3/`, et `calculateEligibility` et `mapAnswersToSituation` de `survey-publicodes`.

### Conséquences

- Une équipe hors du catalogue trouve le format et les composants sous un nom propre aux formulaires, et les installe depuis npm.
- Chaque brique a sa propre version, indépendante des releases du catalogue.
- Le catalogue suit les releases du dépôt de formulaires : une correction de formulaire demandée par le catalogue passe par une release du dépôt de formulaires, puis par la montée de version dans le catalogue.
- Tant que le format v2 reste dans le dépôt de formulaires, l'API garde des noms qui distinguent les versions du format.

### Confirmation

Le relecteur d'une PR du catalogue vérifie, à la main, que le catalogue importe ces briques par leur paquet publié, sans en recopier le code. À chaque date de revue, Lucas réévalue la décision selon les critères de la section « Révision ».

## Révision

Cette décision est à l'essai.

On revient au dépôt du catalogue si, à une date de revue fixée après la première publication des paquets, aucun projet hors du catalogue ne les utilise, ou si la plupart des changements des briques viennent du catalogue et demandent deux PR coordonnées.

On retire le format v2 quand plus aucun projet ne l'utilise ; les noms de l'API perdent alors la version du format. On le sépare dans un dépôt d'héritage si un projet qui l'utilise encore freine l'évolution du format v3.

Si l'équipe n'obtient pas le droit de publier sous `@betagouv`, on publie les paquets en archives attachées aux releases du dépôt de formulaires, comme le catalogue le fait pour les siens.

## Questions ouvertes

- Le nom du dépôt de formulaires et des paquets.
- L'organisation GitHub du dépôt de formulaires.
- Le droit de publier sous le scope npm `@betagouv`.
- La place du formulaire des aides à l'innovation (`form-entreprise-innovation`) : exemple de la démo ou héritage d'aides-simplifiées.
- La date de la première revue.
