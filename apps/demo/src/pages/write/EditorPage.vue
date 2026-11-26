<script lang="ts" setup>
import type { JsonFormsOutputV3, SurveySchemaV3 } from '@shallowred/survey-schema'
import { createAjv2020 } from '@shallowred/jsonforms-vue-dsfr'
import { compileV3ToJsonForms, validateSurveySchemaV3 } from '@shallowred/survey-schema'
import { computed, ref, watchEffect } from 'vue'
import SchemaPreview from '../../components/SchemaPreview.vue'
import { bikeAidAnswers, bikeAidQuestionnaire } from '../../examples/questionnaire'

const answersSource = ref(JSON.stringify(bikeAidAnswers, null, 2))
const questionnaireSource = ref(JSON.stringify(bikeAidQuestionnaire, null, 2))

type Parsed<T> = { value: T, errors: [] } | { value: undefined, errors: string[] }

function parse<T>(source: string): Parsed<T> {
  try {
    return { value: JSON.parse(source) as T, errors: [] }
  }
  catch (error) {
    return { value: undefined, errors: [`JSON invalide : ${(error as Error).message}`] }
  }
}

// An answers schema that Ajv cannot compile would throw in the preview
const ajv = createAjv2020()
const answers = computed<Parsed<Record<string, unknown>>>(() => {
  const parsed = parse<Record<string, unknown>>(answersSource.value)
  if (parsed.value === undefined) {
    return parsed
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
    : { value: undefined, errors: (result.errors ?? []).map(error => `${error.path || '/'} : ${error.message}`) }
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
  <h1 class="fr-h3">
    Écrire un questionnaire
  </h1>
  <p>
    Un questionnaire au format survey-schema v3 se compose de deux documents JSON. Le JSON Schema des réponses donne à chaque réponse son type, son libellé et ses choix, et peut indiquer sa base légale (<code>x-legal-basis</code>) et sa source (<code>x-source</code>). Le questionnaire range les réponses en étapes et en pages, désigne chacune par un pointeur <code>#/properties/&lt;id&gt;</code> et contient les conditions d'affichage, écrites elles aussi en JSON Schema.
  </p>
  <p class="fr-mb-4w">
    <code>compileV3ToJsonForms</code> traduit les deux documents pour JSON Forms. Modifiez-les : le formulaire suit. La
    <a
      href="https://github.com/ShallowRed/survey-kit/blob/main/packages/survey-schema/docs/SPEC-v3.md"
      target="_blank"
      rel="noopener"
    >spécification du format</a> décrit chaque champ.
  </p>

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
        >Questionnaire</label>
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
