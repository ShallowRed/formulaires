interface LabelledControl {
  label: string
  required?: boolean
  uischema?: { options?: Record<string, unknown> }
}

// DSFR fields are required by default: only optional fields carry a mention. A field required
// under a condition carries `options.required`, since JSON Forms reads only the static `required`.
export function fieldLabel(control: LabelledControl): string {
  const required = control.required || control.uischema?.options?.required === true
  return required ? control.label : `${control.label} (optionnel)`
}
