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

// The `rich` option frames each option of a choice like the DSFR rich radio
export function isRich(control: { uischema?: { options?: Record<string, unknown> } }): boolean {
  return control.uischema?.options?.rich === true
}

// A rich option without tooltip keeps the width of the options beside a tooltip button
export function alignsWithTooltips(rich: boolean, options: { tooltip?: unknown }[], option: { tooltip?: unknown }): boolean {
  return rich && !option.tooltip && options.some(other => other.tooltip)
}

// DSFR fields are required by default: only optional fields carry a mention
export function fieldLabel(control: LabelledControl): string {
  return isRequired(control) ? control.label : `${control.label} (optionnel)`
}

// survey-schema writes a tooltip as a string or as `{ buttonLabel, content }`
export function tooltipText(tooltip: unknown): string | undefined {
  return typeof tooltip === 'string' ? tooltip : (tooltip as { content?: string } | undefined)?.content
}

// The presentation of each choice, keyed by its value in the `choices` option of the uischema
export interface ChoiceOptions {
  tooltip?: string | { buttonLabel?: string, content?: string }
  exclusive?: boolean
}

export function choicesOf(options: Record<string, unknown> | undefined): Record<string, ChoiceOptions> {
  return (options?.choices ?? {}) as Record<string, ChoiceOptions>
}

// The button is named by `buttonLabel`, or else after the label of the option
export function choiceTooltip(options: Record<string, unknown> | undefined, value: unknown, label: string): { content: string, buttonLabel: string } | undefined {
  const tooltip = choicesOf(options)[String(value)]?.tooltip
  const content = tooltipText(tooltip)
  if (!content) {
    return undefined
  }
  const buttonLabel = typeof tooltip === 'object' && tooltip.buttonLabel ? tooltip.buttonLabel : `Information sur « ${label} »`
  return { content, buttonLabel }
}
