import type { UISchemaElement } from '@jsonforms/core'
import { useJsonForms } from '@jsonforms/vue'
import { controlsOf, useVisibility } from './uischema'

// The layout of the root uischema opens the form with the notice of the required fields, when it shows a field
export function useRequiredNotice(root: UISchemaElement, path: () => string): (element: UISchemaElement) => boolean {
  const isRoot = useJsonForms().core?.uischema === root
  const visible = useVisibility(path)
  return element => isRoot && controlsOf(element).some(visible)
}
