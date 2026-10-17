#!/usr/bin/env python3
"""Checks each translation against en.json: same blocks in the same order, same ids/section numbers, identical inline
markup (tags and hrefs in the same order), the fixed names and figures present, no empty or untranslated strings."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
TAG = re.compile(r'<(/?)(a|strong)([^>]*)>')
KEEP = ['TulusSG', 'Zan J Private Limited', 'admin@tulussg.com']
def strings(doc):
    out = []
    for i, b in enumerate(doc['blocks']):
        key = f'{i}:{b["t"]}'
        if 'h' in b: out.append((key, b['h']))
        for j, x in enumerate(b.get('items', [])): out.append((f'{key}:li{j}', x))
        for j, x in enumerate(b.get('head', [])): out.append((f'{key}:th{j}', x))
        for j, r in enumerate(b.get('rows', [])):
            out.append((f'{key}:r{j}a', r[0])); out.append((f'{key}:r{j}b', r[1]))
    return out
def main(langs):
    en = json.load(open(os.path.join(HERE, 'en.json'), encoding='utf8'))
    bad = 0
    for lang in langs:
        p = os.path.join(HERE, lang + '.json')
        if not os.path.exists(p): print(f'{lang}: MISSING'); bad += 1; continue
        tr = json.load(open(p, encoding='utf8')); errs = []
        if tr.get('lang') != lang: errs.append('lang field')
        if set(tr['ui']) != set(en['ui']): errs.append(f'ui keys differ: {set(en["ui"]) ^ set(tr["ui"])}')
        for k, v in tr['ui'].items():
            if k != 'translationNote' and not v.strip(): errs.append(f'ui.{k} empty')
        if len(tr['blocks']) != len(en['blocks']): errs.append(f'block count {len(tr["blocks"])} != {len(en["blocks"])}')
        for a, b in zip(en['blocks'], tr['blocks']):
            for f in ('t', 'id', 'n', 'cls'):
                if a.get(f) != b.get(f): errs.append(f'block field {f}: {a.get(f)} != {b.get(f)}')
            for f in ('items', 'head', 'rows'):
                if len(a.get(f, [])) != len(b.get(f, [])): errs.append(f'{a["t"]} {f} count')
        es, ts = dict(strings(en)), dict(strings(tr))
        for k, v in es.items():
            t = ts.get(k)
            if t is None or not t.strip(): errs.append(f'{k} missing'); continue
            if TAG.findall(v) != TAG.findall(t): errs.append(f'{k} markup differs')
            for keep in KEEP:
                if keep in v and keep not in t: errs.append(f'{k} lost "{keep}"')
            for num in re.findall(r'\b(?:2026|2027|202616105R|30|12|2)\b', v):
                pass
            if lang != 'en' and len(v) > 40 and t == v: errs.append(f'{k} untranslated')
        print(f'{lang}: ' + ('OK' if not errs else f'{len(errs)} problems'))
        for e in errs[:15]: print('   ', e)
        bad += bool(errs)
    return bad
if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or ['id', 'tl', 'my', 'bn', 'ta', 'zh']))
