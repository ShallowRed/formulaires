import type { JsonSchema, UISchemaElement } from '@jsonforms/core'
import { JsonForms } from '@jsonforms/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createAjv2020, dsfrRenderers } from '../src/index'

async function render(schema: JsonSchema, data: Record<string, unknown> = {}, uischema?: UISchemaElement) {
  const wrapper = mount(JsonForms, { props: { schema, uischema, data, renderers: dsfrRenderers, ajv: createAjv2020() } })
  await flushPromises()
  return wrapper
}

function button(wrapper: Awaited<ReturnType<typeof render>>, label: string) {
  const found = wrapper.findAll('button').find(element => element.text().startsWith(label))
  if (!found) {
    throw new Error(`No button starts with « ${label} »`)
  }
  return found
}

describe('a repeatable list', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      foyers: {
        type: 'array',
        title: 'Foyers fiscaux',
        minItems: 1,
        maxItems: 2,
        items: { type: 'object', title: 'Foyer', properties: { personnes: { type: 'integer', title: 'Nombre de personnes' } } },
      },
    },
  }

  it('keeps between minItems and maxItems items', async () => {
    const wrapper = await render(schema, { foyers: [{}] })
    expect(button(wrapper, 'Supprimer « Foyer 1 »').attributes('disabled')).toBeDefined()

    await button(wrapper, 'Ajouter').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Foyer 2')
    expect(button(wrapper, 'Ajouter').attributes('disabled')).toBeDefined()
    expect(button(wrapper, 'Supprimer « Foyer 1 »').attributes('disabled')).toBeUndefined()
  })

  it('shows the annotations of the list', async () => {
    const foyers = (schema as { properties: Record<string, object> }).properties.foyers
    const annotated = { ...schema, properties: { foyers: { ...foyers, 'x-legal-basis': { title: 'Note de service, page 8' } } } } as JsonSchema
    expect((await render(annotated, { foyers: [{}] })).find('legend').text()).toContain('Base légale : Note de service, page 8')
  })
})

describe('a choice', () => {
  function choice(options: number, format?: string) {
    const schema: JsonSchema = {
      type: 'object',
      properties: { secteur: { type: 'string', title: 'Secteur', enum: Array.from({ length: options }, (_, index) => `s${index}`) } },
    }
    const uischema = { type: 'Control', scope: '#/properties/secteur', options: { format } } as UISchemaElement
    return render(schema, {}, uischema)
  }

  it('shows radio buttons up to five options and a select beyond', async () => {
    expect((await choice(5)).findAll('input[type="radio"]')).toHaveLength(5)
    expect((await choice(6)).find('select').exists()).toBe(true)
  })

  it('follows the format option of the uischema', async () => {
    expect((await choice(2, 'select')).find('select').exists()).toBe(true)
    expect((await choice(8, 'radio')).findAll('input[type="radio"]')).toHaveLength(8)
  })
})

describe('the label of a field', () => {
  const schema: JsonSchema = { type: 'object', properties: { nom: { type: 'string', title: 'Nom' } } }

  it('mentions an optional field, unless the uischema requires it under a condition', async () => {
    expect((await render(schema)).find('label').text()).toContain('Nom (optionnel)')

    const required = { type: 'Control', scope: '#/properties/nom', options: { required: true } } as UISchemaElement
    expect((await render(schema, {}, required)).find('label').text()).not.toContain('(optionnel)')
  })

  it('ties the error message to the field', async () => {
    const required = { ...schema, required: ['nom'] } as JsonSchema
    const wrapper = await render(required)
    const error = wrapper.find('.fr-error-text')
    expect(error.exists()).toBe(true)
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(error.attributes('id'))
  })

  it('shows the certifiable source and the legal basis of the entry', async () => {
    const annotated = {
      type: 'object',
      properties: {
        naissance: {
          'type': 'string',
          'title': 'Date de naissance',
          'x-source': { provider: 'FranceConnect', data: 'birthdate' },
          'x-legal-basis': { title: 'Code électoral, article L.2', url: 'https://example.org/code-electoral/L2' },
        },
      },
    } as JsonSchema
    const wrapper = await render(annotated)
    expect(wrapper.text()).toContain('Donnée certifiable')
    expect(wrapper.text()).toContain('FranceConnect peut fournir cette donnée (birthdate)')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.org/code-electoral/L2')
  })
})

describe('a set of checkboxes', () => {
  const schema: JsonSchema = {
    type: 'object',
    required: ['services'],
    properties: { services: { type: 'array', title: 'Services', uniqueItems: true, items: { type: 'string', enum: ['a', 'b', 'aucun'] } } },
  }
  const uischema = { type: 'Control', scope: '#/properties/services', options: { choices: { aucun: { exclusive: true } } } } as UISchemaElement

  async function check(wrapper: Awaited<ReturnType<typeof render>>, value: string, checked = true) {
    await wrapper.find(`input[type="checkbox"][value="${value}"]`).setValue(checked)
    await flushPromises()
    const changes = wrapper.emitted('change') as [{ data: Record<string, unknown> }][]
    return changes.at(-1)![0].data.services
  }

  it('leaves the question unanswered when every box is unchecked', async () => {
    const wrapper = await render(schema, {}, uischema)
    expect(await check(wrapper, 'a')).toEqual(['a'])
    expect(await check(wrapper, 'a', false)).toBeUndefined()
  })

  it('clears the other choices when an exclusive choice is checked, and the reverse', async () => {
    const wrapper = await render(schema, {}, uischema)
    await check(wrapper, 'a')
    expect(await check(wrapper, 'aucun')).toEqual(['aucun'])
    expect(await check(wrapper, 'b')).toEqual(['b'])
  })
})

describe('a questionnaire in steps', () => {
  const schema: JsonSchema = {
    type: 'object',
    required: ['nom', 'age'],
    properties: { nom: { type: 'string', title: 'Nom' }, age: { type: 'integer', title: 'Âge' } },
  }
  const uischema = {
    type: 'Categorization',
    elements: [
      { type: 'Category', label: 'Identité', elements: [{ type: 'Control', scope: '#/properties/nom' }] },
      { type: 'Category', label: 'Situation', elements: [{ type: 'Control', scope: '#/properties/age' }] },
    ],
  } as UISchemaElement

  it('keeps the page while an answer is missing, then completes the questionnaire', async () => {
    const wrapper = await render(schema, {}, uischema)
    const completed: unknown[] = []
    wrapper.element.addEventListener('categorization-complete', event => completed.push((event as CustomEvent).detail))

    await button(wrapper, 'Suivant').trigger('click')
    expect(wrapper.text()).toContain('Il manque des réponses sur cette page')
    expect(wrapper.find('h3').text()).toBe('Identité')

    await wrapper.find('input').setValue('Camille')
    await flushPromises()
    await button(wrapper, 'Suivant').trigger('click')
    await flushPromises()
    expect(wrapper.find('h3').text()).toBe('Situation')

    await wrapper.find('input').setValue('30')
    await flushPromises()
    await button(wrapper, 'Terminer').trigger('click')
    expect(completed).toEqual([{ nom: 'Camille', age: 30 }])
  })
})
