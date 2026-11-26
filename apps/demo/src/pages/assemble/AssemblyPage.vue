<script lang="ts" setup>
import CodeBlock from '../../components/CodeBlock.vue'

const simulatorCode = `import formSchema from '@shallowred/form-entreprise-innovation'
import { createAjv2020, dsfrI18n, dsfrRenderers } from '@shallowred/jsonforms-vue-dsfr'
import rules from '@shallowred/publicodes-entreprise-innovation/…/model.json'
import { calculateEligibilityV3 } from '@shallowred/survey-publicodes'
import { compileV3ToJsonForms, migrateV2ToV3, visibleAnswers } from '@shallowred/survey-schema'

const { questionnaire, dataSchema } = migrateV2ToV3(formSchema)
const { schema, uischema } = compileV3ToJsonForms(questionnaire, dataSchema)

const answers = ref({})
const results = computed(() => calculateEligibilityV3(
  rules,
  dataSchema,
  visibleAnswers(questionnaire, answers.value),
  formSchema.dispositifs,
))`
</script>

<template>
  <h2 class="fr-h3">
    Code du simulateur
  </h2>
  <p class="fr-mb-3w">
    Script de la page « Simulateur des aides à l'innovation », sans le gabarit qui passe <code>schema</code>, <code>uischema</code> et <code>answers</code> au composant <code>JsonForms</code>.
  </p>
  <CodeBlock :code="simulatorCode" language="typescript" />
</template>
