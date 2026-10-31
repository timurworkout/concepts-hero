#!/bin/sh
# Проверка стиля без LLM: детектор impeccable + значения в обход токенов.
# Запуск: npm run check:style. Пусто на выходе — чисто.
cd "$(dirname "$0")/.."
css=src/styles.css

impeccable="$HOME/.claude/plugins/cache/impeccable/impeccable/4.7.1/skills/impeccable/scripts/impeccable"
[ -x "$impeccable" ] && "$impeccable" detect --no-advisory "$css" src/App.jsx 2>&1 | grep -v "^0 anti-patterns\|regex matching only\|did not run\|For the full check\|^$"

# Всё, что ниже :root, должно идти через токены
body=$(awk '/^:root \{/{r=1} r&&/^\}/{r=0;next} !r' "$css")
echo "$body" | grep -nE "border-radius: [0-9.]+(px|em)|letter-spacing: -?[0-9.]+em|line-height: 1\.[0-9]|font-weight: (100|200|300|500|800|900)|dashed|font-stretch|clip-path: polygon" \
  | grep -v "logo" | sed 's/^/обход токенов: /'
grep -nE "text-transform: uppercase" "$css" | grep -E "h[12]|title" | sed 's/^/капс в заголовке: /'
grep -nE "className=\"(kicker|eyebrow)|-&gt;|>->|' -> '" src/*.jsx | sed 's/^/слоп в разметке: /'
exit 0
