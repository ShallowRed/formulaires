import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import {
  and,
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isObjectControl,
  isOneOfEnumControl,
  isStringControl,
  or,
  rankWith,
  schemaMatches,
  schemaTypeIs,
  uiTypeIs,
} from '@jsonforms/core'
import ArrayControl from './ArrayControl.vue'
import BooleanControl from './BooleanControl.vue'
import CategorizationStepper from './CategorizationStepper.vue'
import EnumControl from './EnumControl.vue'
import GroupLayout from './GroupLayout.vue'
import IntermediaryResultsRenderer from './IntermediaryResultsRenderer.vue'
import LabelRenderer from './LabelRenderer.vue'
import MultiEnumControl from './MultiEnumControl.vue'
import NumberControl from './NumberControl.vue'
import ObjectControl from './ObjectControl.vue'
import OneOfEnumControl from './OneOfEnumControl.vue'
import StringControl from './StringControl.vue'
import VerticalLayout from './VerticalLayout.vue'
import './styles.css'

export { createAjv2020 } from './ajv'

// An array of enumerated values with unique items is a set of checkboxes, not a repeatable list
const isMultiEnumControl = and(
  uiTypeIs('Control'),
  schemaMatches(schema => schema.type === 'array' && schema.uniqueItems === true
    && typeof schema.items === 'object' && ('enum' in schema.items || 'oneOf' in schema.items)),
)

// JSON Forms keeps its renderers in a reactive state: frozen, they stay out of Vue reactivity
export const dsfrRenderers = Object.freeze([
  { renderer: VerticalLayout, tester: rankWith(1, uiTypeIs('VerticalLayout')) },
  { renderer: GroupLayout, tester: rankWith(1, uiTypeIs('Group')) },
  { renderer: CategorizationStepper, tester: rankWith(1, uiTypeIs('Categorization')) },
  { renderer: LabelRenderer, tester: rankWith(1, uiTypeIs('Label')) },
  { renderer: IntermediaryResultsRenderer, tester: rankWith(1, uiTypeIs('IntermediaryResults')) },
  { renderer: StringControl, tester: rankWith(1, isStringControl) },
  { renderer: NumberControl, tester: rankWith(1, or(isNumberControl, isIntegerControl)) },
  { renderer: BooleanControl, tester: rankWith(1, isBooleanControl) },
  { renderer: EnumControl, tester: rankWith(2, isEnumControl) },
  { renderer: OneOfEnumControl, tester: rankWith(2, isOneOfEnumControl) },
  { renderer: ObjectControl, tester: rankWith(2, isObjectControl) },
  { renderer: ArrayControl, tester: rankWith(2, schemaTypeIs('array')) },
  { renderer: MultiEnumControl, tester: rankWith(3, isMultiEnumControl) },
]) as JsonFormsRendererRegistryEntry[]
