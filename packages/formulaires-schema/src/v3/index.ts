/**
 * formulaires-schema v3 exports
 */

export { compileV3ToJsonForms } from './jsonforms.js'
export type {
  JsonFormsCategorizationV3,
  JsonFormsCategoryV3,
  JsonFormsComposedConditionV3,
  JsonFormsConditionV3,
  JsonFormsControlV3,
  JsonFormsIntermediaryResultsV3,
  JsonFormsLabelV3,
  JsonFormsOutputV3,
  JsonFormsRuleV3,
  JsonFormsSchemaConditionV3,
} from './jsonforms.js'

export { migrateV2ToV3 } from './migrate.js'
export type {
  MigrateV2ToV3Options,
  MigrateV2ToV3Result,
  MigrationWarning,
  MigrationWarningCode,
} from './migrate.js'

export type {
  JsonSchemaV3,
  SurveyAllOfConditionV3,
  SurveyAnswersV3,
  SurveyAnyOfConditionV3,
  SurveyChoiceOptionsV3,
  SurveyConditionV3,
  SurveyLeafConditionV3,
  SurveyNotConditionV3,
  SurveyNotionV3,
  SurveyPageV3,
  SurveyQuestionsPageV3,
  SurveyQuestionV3,
  SurveyResultsOutputV3,
  SurveyResultsPageV3,
  SurveySchemaV3,
  SurveyScopeV3,
  SurveyStepV3,
  SurveyTooltipV3,
} from './types.js'
export { isLeafConditionV3, isResultsPageV3 } from './types.js'

export {
  compileConditionV3,
  evaluateConditionV3,
  isPageVisible,
  isQuestionVisible,
  missingRequiredAnswers,
  visibleAnswers,
  visibleQuestions,
} from './visibility.js'
