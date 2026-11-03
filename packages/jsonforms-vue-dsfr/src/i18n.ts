import type { JsonFormsI18nState } from '@jsonforms/core'
import type { ErrorObject } from 'ajv'
import { createTranslator } from '@jsonforms/core'

function plural(count: number, singular: string, several: string): string {
  return `${count} ${count > 1 ? several : singular}`
}

// A number, a date or an email address comes with an example of the expected value, as the DSFR asks
function errorMessage(error: ErrorObject): string {
  const limit = error.params.limit as number
  switch (error.keyword) {
    case 'required':
      return 'Répondez à cette question.'
    // Ajv reports a failed `then` twice: the error of the `then` subschema says what to change
    case 'if':
      return ''
    case 'type':
      if (error.params.type === 'integer') {
        return 'Saisissez un nombre entier, par exemple 3.'
      }
      return error.params.type === 'number' ? 'Saisissez un nombre, par exemple 1250.' : 'Cette réponse n\'est pas valide.'
    case 'minimum':
      return `Saisissez un nombre supérieur ou égal à ${limit}.`
    case 'exclusiveMinimum':
      return `Saisissez un nombre supérieur à ${limit}.`
    case 'maximum':
      return `Saisissez un nombre inférieur ou égal à ${limit}.`
    case 'exclusiveMaximum':
      return `Saisissez un nombre inférieur à ${limit}.`
    case 'minLength':
      return `Saisissez au moins ${plural(limit, 'caractère', 'caractères')}.`
    case 'maxLength':
      return `Saisissez au plus ${plural(limit, 'caractère', 'caractères')}.`
    case 'minItems':
      return `Ajoutez au moins ${plural(limit, 'élément', 'éléments')}.`
    // survey-schema writes maxItems for an exclusive choice only, and a list disables its add button at its maxItems
    case 'maxItems':
      return `Choisissez au plus ${plural(limit, 'réponse', 'réponses')}.`
    case 'format':
      if (error.params.format === 'date') {
        return 'Saisissez une date valide, par exemple 14/07/2024.'
      }
      if (error.params.format === 'email') {
        return 'Saisissez une adresse électronique, par exemple nom@domaine.fr.'
      }
      return 'Le format de cette réponse n\'est pas valide.'
    case 'enum':
    case 'const':
    case 'oneOf':
      return 'Choisissez une des réponses proposées.'
    default:
      return 'Cette réponse n\'est pas valide.'
  }
}

// JSON Forms asks `error.<keyword>` for each error, after a key of the field that an application may answer
export const dsfrI18n = {
  locale: 'fr',
  translate: createTranslator((id, _defaultMessage, values?: { error?: ErrorObject }) =>
    id.startsWith('error.') && values?.error ? errorMessage(values.error) : undefined,
  ),
} satisfies JsonFormsI18nState
