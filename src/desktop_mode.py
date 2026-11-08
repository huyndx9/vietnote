"""Make the phone layout survive a browser's "desktop site" mode.

Mobile Chrome's "Request desktop site" (on by default on some devices and in
some in-app browsers) ignores <meta name="viewport"> and lays the page out
900+ px wide, so a phone shows the shrunken desktop layout. The page cannot
switch that mode off. Instead, an inline script (DETECT_SCRIPT) spots a
small touch screen showing a wide layout, adds class "rds" to <html> and
zooms the page back to the screen width.

Zoom alone keeps the desktop media queries and makes vw/vh units 2-3x too
big, so at build time every stylesheet is rewritten:

* each @media block that tests the viewport width is kept for normal mode
  (scoped to :where(html:not(.rds))) and duplicated for desktop-site mode
  with the same test on the device width (scoped to :where(html.rds));
* N vw / N vh become calc(N * var(--vw, 1vw)); the script sets --vw/--vh
  only in desktop-site mode, so normal pages compute exactly as before.

:where() adds no specificity, so the cascade is unchanged in normal mode.
"""
import re

DETECT_SCRIPT = (
    "<script>(function(){var d=document.documentElement;function f(){"
    "var s=Math.min(screen.width,screen.height),w=screen.width,o=d.classList.contains('rds');"
    "d.classList.remove('rds');d.style.zoom='';d.style.removeProperty('--vw');d.style.removeProperty('--vh');"
    "var iw=innerWidth;"
    "if(s<=760&&iw>=w*1.4&&matchMedia('(pointer:coarse)').matches){var z=iw/w;"
    "d.classList.add('rds');d.style.zoom=z;d.style.setProperty('--vw',w/100+'px');"
    "d.style.setProperty('--vh',innerHeight/z/100+'px');}"
    "if(o!==d.classList.contains('rds'))dispatchEvent(new Event('vietnote:layout'));}"
    "f();addEventListener('resize',f);addEventListener('orientationchange',f);})();</script>"
)

_WIDTH_FEATURE = re.compile(r'\((\s*)(min|max)-width(\s*:)')
_UNIT = re.compile(r'(?<![\w.#-])(-?(?:\d+\.?\d*|\.\d+))(vw|vh)\b')


def _skip_comment_or_string(css, i):
    """Return the index after a comment or string starting at i, else i."""
    if css.startswith('/*', i):
        end = css.find('*/', i + 2)
        return len(css) if end < 0 else end + 2
    if css[i] in '"\'':
        q, j = css[i], i + 1
        while j < len(css) and css[j] != q:
            j += 2 if css[j] == '\\' else 1
        return j + 1
    return i


def _matching_brace(css, open_index):
    depth, i = 0, open_index
    while i < len(css):
        j = _skip_comment_or_string(css, i)
        if j != i:
            i = j
            continue
        if css[i] == '{':
            depth += 1
        elif css[i] == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('unbalanced braces in stylesheet')


def _scope_selector(sel, scope):
    """Prefix one selector with a zero-specificity scope on <html>."""
    sel = sel.strip()
    m = re.match(r'(html|:root)(?![\w-])', sel)
    if m:  # the rule targets <html> itself: attach the condition to it
        return m.group(1) + f':where({scope})' + sel[m.end():]
    return f':where(html{scope}) {sel}'


def _split_selectors(prelude):
    parts, depth, cur = [], 0, ''
    for ch in prelude:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return [p for p in parts if p.strip()]


def _scope_rules(body, scope):
    """Scope every style rule in a block body (nested at-rules kept intact)."""
    out, i = [], 0
    while i < len(body):
        j = _skip_comment_or_string(body, i)
        if j != i:
            out.append(body[i:j])
            i = j
            continue
        brace = body.find('{', i)
        if brace < 0:
            out.append(body[i:])
            break
        prelude = body[i:brace]
        end = _matching_brace(body, brace)
        inner = body[brace + 1:end]
        lead = prelude[:len(prelude) - len(prelude.lstrip())]
        head = prelude.strip()
        if head.startswith('@'):
            if head.startswith(('@media', '@supports', '@container', '@layer')):
                inner = _scope_rules(inner, scope)
            out.append(f'{lead}{head}{{{inner}}}')
        else:
            selectors = ','.join(_scope_selector(s, scope) for s in _split_selectors(head))
            out.append(f'{lead}{selectors}{{{inner}}}')
        i = end + 1
    return ''.join(out)


def transform(css):
    """Return css with desktop-site-mode duplicates and vw/vh variables."""
    out, i = [], 0
    while i < len(css):
        j = _skip_comment_or_string(css, i)
        if j != i:
            out.append(css[i:j])
            i = j
            continue
        if css.startswith('@media', i):
            brace = css.index('{', i)
            query = css[i + len('@media'):brace]
            end = _matching_brace(css, brace)
            body = css[brace + 1:end]
            if _WIDTH_FEATURE.search(query):
                device_query = _WIDTH_FEATURE.sub(r'(\1\2-device-width\3', query)
                out.append(f'@media{query}{{{_scope_rules(body, ":not(.rds)")}}}')
                out.append(f'\n@media{device_query}{{{_scope_rules(body, ".rds")}}}')
            else:
                out.append(css[i:end + 1])
            i = end + 1
            continue
        out.append(css[i])
        i += 1
    css = ''.join(out)
    return _UNIT.sub(lambda m: f'calc({m.group(1)} * var(--{m.group(2)}, 1{m.group(2)}))', css)
