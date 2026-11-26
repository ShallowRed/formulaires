<script lang="ts" setup>
import type { JsonFormsOutputV3, SchemaValidationResult, SurveySchemaV3 } from '@shallowred/survey-schema'
import { createAjv2020 } from '@shallowred/jsonforms-vue-dsfr'
import { compileV3ToJsonForms, validateSurveySchemaV3 } from '@shallowred/survey-schema'
import localizeFr from 'ajv-i18n/localize/fr'
import { computed, ref, watchEffect } from 'vue'
import SchemaPreview from '../../components/SchemaPreview.vue'
import { bikeAidAnswers, bikeAidQuestionnaire } from '../../examples/bike-aid'

const answersSource = ref(JSON.stringify(bikeAidAnswers, null, 2))
const questionnaireSource = ref(JSON.stringify(bikeAidQuestionnaire, null, 2))

type Parsed<T> = { value: T, errors: [] } | { value: undefined, errors: string[] }

// Each browser writes its own JSON.parse message, in English; V8 and Firefox give the line and the column
function parse<T>(source: string): Parsed<T> {
  try {
    return { value: JSON.parse(source) as T, errors: [] }
  }
  catch (error) {
    const position = /line (\d+) column (\d+)/.exec((error as Error).message)
    return { value: undefined, errors: [position ? `JSON invalide à la ligne ${position[1]}, colonne ${position[2]}.` : 'JSON invalide.'] }
  }
}

type ValidationError = NonNullable<SchemaValidationResult['rawErrors']>[number]

// The branches of a oneOf report the same error several times
function messagesOf(errors: ValidationError[]): string[] {
  localizeFr(errors)
  return [...new Set(errors.map((error) => {
    const property = error.keyword === 'additionalProperties' ? ` (${error.params.additionalProperty})` : ''
    return `${error.instancePath || '/'} : ${error.message}${property}`
  }))]
}

// An answers schema that Ajv cannot compile would throw in the preview
const ajv = createAjv2020()
const answers = computed<Parsed<Record<string, unknown>>>(() => {
  const parsed = parse<Record<string, unknown>>(answersSource.value)
  if (parsed.value === undefined) {
    return parsed
  }
  if (!ajv.validateSchema(parsed.value)) {
    return { value: undefined, errors: messagesOf(ajv.errors ?? []) }
  }
  try {
    ajv.compile(parsed.value)
    return parsed
  }
  catch (error) {
    return { value: undefined, errors: [(error as Error).message] }
  }
})
const questionnaire = computed<Parsed<SurveySchemaV3>>(() => {
  const parsed = parse<SurveySchemaV3>(questionnaireSource.value)
  if (parsed.value === undefined) {
    return parsed
  }
  const result = validateSurveySchemaV3(parsed.value)
  return result.valid
    ? parsed
    : { value: undefined, errors: messagesOf(result.rawErrors ?? []) }
})

// The preview keeps the last valid pair while the author types
const compiled = ref<JsonFormsOutputV3>(compileV3ToJsonForms(bikeAidQuestionnaire, bikeAidAnswers))
watchEffect(() => {
  if (answers.value.value && questionnaire.value.value) {
    compiled.value = compileV3ToJsonForms(questionnaire.value.value, answers.value.value)
  }
})
const previewKey = computed(() => JSON.stringify(compiled.value))
</script>

<template>
  <p class="fr-mb-4w">
    Un formulaire se compose de deux documents JSON : le schéma des réponses (type, libellé, choix, base légale <code>x-legal-basis</code>, source <code>x-source</code>) et les étapes, qui répartissent les champs en pages et contiennent les textes et les conditions d'affichage. La
    <a
      href="https://github.com/ShallowRed/survey-kit/blob/main/packages/survey-schema/docs/SPEC-v3.md"
      target="_blank"
      rel="noopener"
    >spécification du format</a> décrit chaque propriété de ces documents.
  </p>

  <h2 class="fr-h4">
    Aide fictive à l'achat d'un vélo
  </h2>
  <SchemaPreview
    :key="previewKey"
    :schema="compiled.schema"
    :uischema="compiled.uischema"
    validation-mode="ValidateAndHide"
  >
    <template #source>
      <div
        class="fr-input-group"
        :class="{ 'fr-input-group--error': answers.errors.length > 0 }"
      >
        <label
          class="fr-label"
          for="answers-source"
        >Schéma des réponses</label>
        <textarea
          id="answers-source"
          v-model="answersSource"
          class="fr-input demo-source"
          rows="14"
          spellcheck="false"
          :aria-describedby="answers.errors.length > 0 ? 'answers-source-errors' : undefined"
        />
        <div
          v-if="answers.errors.length > 0"
          id="answers-source-errors"
          class="fr-messages-group"
        >
          <p
            v-for="error in answers.errors"
            :key="error"
            class="fr-message fr-message--error"
          >
            {{ error }}
          </p>
        </div>
      </div>
      <div
        class="fr-input-group"
        :class="{ 'fr-input-group--error': questionnaire.errors.length > 0 }"
      >
        <label
          class="fr-label"
          for="questionnaire-source"
        >Étapes</label>
        <textarea
          id="questionnaire-source"
          v-model="questionnaireSource"
          class="fr-input demo-source"
          rows="24"
          spellcheck="false"
          :aria-describedby="questionnaire.errors.length > 0 ? 'questionnaire-source-errors' : undefined"
        />
        <div
          v-if="questionnaire.errors.length > 0"
          id="questionnaire-source-errors"
          class="fr-messages-group"
        >
          <p
            v-for="error in questionnaire.errors"
            :key="error"
            class="fr-message fr-message--error"
          >
            {{ error }}
          </p>
        </div>
      </div>
    </template>
  </SchemaPreview>
</template>

<style scoped>
.demo-source {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  line-height: 1.5;
}
</style>
