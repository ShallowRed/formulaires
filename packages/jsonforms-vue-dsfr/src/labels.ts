import type { JsonSchema } from '@jsonforms/core'

// The props of a JSON Forms control that a field of this package reads
export interface FieldControl {
  id: string
  label: string
  required?: boolean
  description?: string
  data: unknown
  errors: string
  enabled: boolean
  schema: JsonSchema
  uischema: { options?: Record<string, unknown> }
}

interface LabelledControl {
  label: string
  required?: boolean
  uischema?: { options?: Record<string, unknown> }
}

// A field required under a condition carries `options.required`, since JSON Forms reads only the static `required`
export function isRequired(control: Omit<LabelledControl, 'label'>): boolean {
  return control.required === true || control.uischema?.options?.required === true
}

// DSFR fields are required by default: only optional fields carry a mention
export function fieldLabel(control: LabelledControl): string {
  return isRequired(control) ? control.label : `${control.label} (optionnel)`
}
