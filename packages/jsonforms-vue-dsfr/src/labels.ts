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
