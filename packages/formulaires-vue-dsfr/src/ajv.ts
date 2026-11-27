import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { markRaw } from 'vue'

// JSON Forms builds a draft-07 Ajv by default and rejects a 2020-12 schema; these are the options it expects.
// JSON Forms compiles the schema again at each data change: a schema with an `$id` must not be registered.
// Ajv finds its compiled schemas by identity, which a reactive proxy breaks: Vue must never wrap the instance.
export function createAjv2020(): Ajv2020 {
  const ajv = new Ajv2020({ allErrors: true, verbose: true, strict: false, useDefaults: true, addUsedSchema: false })
  addFormats(ajv)
  return markRaw(ajv)
}
