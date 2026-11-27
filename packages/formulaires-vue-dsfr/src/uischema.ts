import type { ControlElement, Layout, UISchemaElement } from '@jsonforms/core'
import { isVisible } from '@jsonforms/core'
import { useJsonForms } from '@jsonforms/vue'

export function controlsOf(element: UISchemaElement): ControlElement[] {
  if (element.type === 'Control') {
    return [element as ControlElement]
  }
  return ((element as Layout).elements ?? []).flatMap(controlsOf)
}

// Whether a uischema element shows, under its rule, with the data of the form
export function useVisibility(path: () => string): (element: UISchemaElement) => boolean {
  const jsonforms = useJsonForms()
  return element => isVisible(element, jsonforms.core!.data, path(), jsonforms.core!.ajv!, jsonforms.config)
}
