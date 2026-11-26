import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import json from 'shiki/langs/json.mjs'
import shellscript from 'shiki/langs/shellscript.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import vue from 'shiki/langs/vue.mjs'
import githubLightHighContrast from 'shiki/themes/github-light-high-contrast.mjs'

export type CodeLanguage = 'json' | 'shellscript' | 'typescript' | 'vue'

// The JavaScript regex engine highlights synchronously, without the Oniguruma WebAssembly module
const highlighter = createHighlighterCoreSync({
  themes: [githubLightHighContrast],
  langs: [json, shellscript, typescript, vue],
  engine: createJavaScriptRegexEngine(),
})

/**
 * Coloured spans of the code, to place inside a `pre`
 */
export function highlight(code: string, lang: CodeLanguage): string {
  return highlighter.codeToHtml(code, { lang, theme: 'github-light-high-contrast', structure: 'inline' })
}
