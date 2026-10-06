import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

// A focused set (aliases such as js/jsx, ts/tsx, sh/zsh and html come with these), loaded only on blog pages.
const langs = { bash, css, diff, java, javascript, json, kotlin, python, sql, swift, typescript, xml, yaml }
for (const [name, def] of Object.entries(langs)) hljs.registerLanguage(name, def)

export const highlightCode = (code: string, language?: string) => {
  const lang = (language ?? '').trim().toLowerCase()
  return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value : null
}
