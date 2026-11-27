import dataSchema from './entreprise-innovation.data.schema.json' with { type: 'json' }
import schema from './entreprise-innovation.json' with { type: 'json' }
import questionnaire from './entreprise-innovation.questionnaire.json' with { type: 'json' }

export default schema

export const dispositifs = schema.dispositifs

export { dataSchema, questionnaire }
