# formulaires-schema v3

A v3 survey comes as two documents:

- a JSON Schema 2020-12 of the answers, which types each answer, gives its title, description, choices and default, and can annotate it with `x-legal-basis` and `x-source`;
- a questionnaire, which orders the answers into steps and pages, adds the texts of the journey and the visibility conditions, and points to each answer by a JSON pointer.

The questionnaire validates against `src/validation/schemas/v3.0.0.schema.json` (`validateSurveySchemaV3`), whose identifier is `urn:survey-schema:v3.0.0`. `migrateV2ToV3` gives the answers schema the identifier `urn:survey-schema:<id>:data`.

## Questionnaire

The root carries `schemaVersion` (`"3.0.0"`), `id`, `version`, `title`, an optional `description`, `data` (the path or `$id` of the answers schema) and `steps`.

A step carries `id`, `title` and `pages`. A page of questions carries `id`, an optional `title` and `description`, and `questions`. A page of intermediary results carries `type: "intermediary-results"`, `id`, an optional `title` and `description`, and `outputs`, the outputs of the rule it shows, each with `id`, `title` and `description`.

A question carries `scope`, a pointer of the form `#/properties/<id>` into the answers schema. Its title, description, type, choices and default are those of the property it points to. It can carry:

- `visibleWhen`, a condition;
- `required`, true by default;
- `placeholder`, `tooltip` (a string or `{ buttonLabel, content }`), `notion` and `additionalNotions` (`{ id, buttonLabel }`), `autocomplete` (`{ source }`, the name of a suggestion source the renderer provides);
- `choices`, an object keyed by choice value, with `tooltip` and `exclusive` for each choice.

```json
{
  "scope": "#/properties/produit-mis-marche",
  "visibleWhen": {
    "allOf": [
      { "scope": "#/properties/i-have-a-prototype", "schema": { "const": true } },
      { "scope": "#/properties/prototype-destination", "schema": { "const": "modele" } }
    ]
  }
}
```

## Conditions

A condition is a leaf `{ scope, schema }` or a combination `{ allOf: [...] }`, `{ anyOf: [...] }`, `{ not: ... }`. A leaf holds when the answer at `scope` exists and is valid against `schema`. A leaf is therefore the JSON Schema `{ "required": ["<id>"], "properties": { "<id>": schema } }` of the whole answers object, and `allOf`, `anyOf` and `not` keep their JSON Schema meaning: any JSON Schema 2020-12 validator evaluates a condition, in any language (`compileConditionV3`, `evaluateConditionV3`).

The v2 operators translate as follows: `x.includes('a')` on a checkbox is `{ "type": "array", "contains": { "const": "a" } }`, on a radio `{ "const": "a" }`; `x=v` is `{ "const": v }`; `&&` is `allOf`, `||` is `anyOf`.

## Rules

- A question without `visibleWhen` is visible.
- A page of questions is visible when one of its questions is; a page of intermediary results always is.
- A visible question whose `required` is true needs an answer (`missingRequiredAnswers`).
- The answers to hidden questions do not reach the calculation.

## Rendering with JSON Forms

`compileV3ToJsonForms(questionnaire, dataSchema)` returns the `schema` and `uischema` that JSON Forms 3.8 renders:

- steps and pages become nested `Categorization` and `Category`, questions become `Control` with their `scope`, and the presentation fields go into the control `options`;
- each conditional question gets a `SHOW` rule built from its condition, with `failWhenUndefined: true`, and each page a `SHOW` rule that is the `OR` of the conditions of its questions;
- a page of intermediary results becomes an element `{ "type": "IntermediaryResults", "options": { "outputs": [...] } }`;
- the schema adds an `if`/`then` per conditional required question, and the control carries `options.required: true`, which a renderer reads since JSON Forms marks as required the static `required` alone.

JSON Forms has no `NOT` condition: a `not` compiles to a condition on the whole answers object (`scope: "#"`). The copies of conditions on pages and in the schema exist in the compiled output alone.

`@shallowred/formulaires-vue-dsfr` renders this output with DSFR components. An application shows the results of its engine by registering its own renderer for `IntermediaryResults` with a higher rank.

## Migration from v2

`migrateV2ToV3(v2)` returns `{ questionnaire, dataSchema, warnings }`. The warnings list what the migration drops: `engine`, `forceRefresh`, the empty operands of a condition (treated as true, as the v2 evaluator does), and the ISO date comparisons, which have no JSON Schema translation.
