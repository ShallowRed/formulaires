/**
 * Random answer sets for a v2 form, drawn with a fixed seed
 */

import type { SurveyAnswers } from '../../src/types/answer'
import type { SurveyQuestionData } from '../../src/types/question'
import type { SurveyNormalizedSchema } from '../../src/types/schema'
import { ConditionEvaluator } from '../../src/core/condition-evaluator'
import { isQuestionsPageData } from '../../src/types/schema'

export interface AnswerSet {
  mode: 'free' | 'path'
  answers: SurveyAnswers
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const evaluator = new ConditionEvaluator()

/**
 * Visibility of a v2 question according to ConditionEvaluator, an array of
 * conditions being a conjunction
 */
export function v2Visible(question: SurveyQuestionData, answers: SurveyAnswers): boolean {
  const vw = question.visibleWhen
  if (!vw) {
    return true
  }
  return Array.isArray(vw) ? vw.every(c => evaluator.evaluate(c, answers)) : evaluator.evaluate(vw, answers)
}

export function v2Questions(form: SurveyNormalizedSchema): SurveyQuestionData[] {
  return form.steps.flatMap(s => s.pages.flatMap(p => (isQuestionsPageData(p) ? p.questions : [])))
}

/**
 * In "free" sets, every question gets an answer with probability 0.85 whatever its
 * visibility, as when a person goes back and changes an earlier answer. In "path"
 * sets, questions are answered in order, each with probability 0.95 when visible
 * at that point.
 */
export function drawAnswerSets(form: SurveyNormalizedSchema, seed: number, perMode: number): AnswerSet[] {
  const rand = mulberry32(seed)
  const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)]
  const questions = v2Questions(form)

  function randomAnswer(q: SurveyQuestionData): SurveyAnswers[string] {
    switch (q.type) {
      case 'number':
        return rand() < 0.2 ? 0 : Math.floor(rand() * 1_000_000) / (rand() < 0.5 ? 1 : 100)
      case 'boolean':
        return rand() < 0.5
      case 'date':
        return new Date(Date.UTC(1990, 0, 1) + Math.floor(rand() * 13_400) * 86_400_000).toISOString().slice(0, 10)
      case 'radio':
        return pick(q.choices).id
      case 'checkbox': {
        const exclusive = q.choices.filter(c => c.exclusive)
        const others = q.choices.filter(c => !c.exclusive)
        const r = rand()
        if (r < 0.05) {
          return []
        }
        if (exclusive.length && r < 0.15) {
          return [pick(exclusive).id]
        }
        const chosen = others.filter(() => rand() < 0.5).map(c => c.id)
        return chosen.length ? chosen : [pick(others).id]
      }
      default:
        throw new Error(`type ${q.type}`)
    }
  }

  const sets: AnswerSet[] = []
  for (let i = 0; i < perMode; i++) {
    const answers: SurveyAnswers = {}
    for (const q of questions) {
      if (rand() < 0.85) {
        answers[q.id] = randomAnswer(q)
      }
    }
    sets.push({ mode: 'free', answers })
  }
  for (let i = 0; i < perMode; i++) {
    const answers: SurveyAnswers = {}
    for (const q of questions) {
      if (v2Visible(q, answers) && rand() < 0.95) {
        answers[q.id] = randomAnswer(q)
      }
    }
    sets.push({ mode: 'path', answers })
  }
  return sets
}
