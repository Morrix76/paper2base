/**
 * Minimal JSON syntax highlight for display inside a <pre>.
 * Escapes HTML first, then wraps tokens in colored spans (Tailwind classes).
 */
export function jsonToHighlightedHtml(json: string): string {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-amber-200'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'text-indigo-200' : 'text-emerald-200'
      } else if (/true|false/.test(match)) {
        cls = 'text-indigo-200'
      } else if (/null/.test(match)) {
        cls = 'text-rose-200'
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
}
