import { nb } from './data.js'

// Неразрывные пробелы на всей странице: nb() для каждого текстового узла, в том числе отрисованного позже.
// Так правило не зависит от того, обернули текст в nb() или нет
const skip = 'script, style, textarea, code, pre'
const fix = (node) => {
  if (node.parentElement?.closest(skip)) return
  const text = nb(node.data)
  if (text !== node.data) node.data = text
}
const walk = (root) => {
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = it.nextNode(); n; n = it.nextNode()) fix(n)
}

export function watchTypography(root = document.body) {
  walk(root)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') fix(r.target)
      else r.addedNodes.forEach((n) => (n.nodeType === Node.TEXT_NODE ? fix(n) : n.nodeType === Node.ELEMENT_NODE && walk(n)))
    }
  }).observe(root, { childList: true, subtree: true, characterData: true })
}
