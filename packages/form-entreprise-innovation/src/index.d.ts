import type { PublicodesDispositif, PublicodesSurveySchema, SurveySchemaV3 } from '@shallowred/survey-schema'

declare const schema: PublicodesSurveySchema

export default schema

export declare const dispositifs: PublicodesDispositif[]
export declare const questionnaire: SurveySchemaV3
export declare const dataSchema: Record<string, unknown>
