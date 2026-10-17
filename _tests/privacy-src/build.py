#!/usr/bin/env python3
"""Builds /privacy/ (English) and /privacy/<lang>/ from <lang>.json in this folder.

English (en.json) is the approved source (owner approval 17 Oct 2026). Each translation file has the same blocks in
the same order with the same ids and the same inline markup (checked by check.py). Footer lines come from the shared
site dictionary so they match every other page. Run: python3 _tests/privacy-src/build.py
"""
import html, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = 'https://www.tulussg.com'
LANGS = [  # code, html lang, hreflang, native name, path, Noto font for the script (None = Latin)
    ('en', 'en', 'en', 'English', '/privacy/', None),
    ('id', 'id', 'id', 'Bahasa Indonesia', '/privacy/id/', None),
    ('tl', 'fil', 'fil', 'Filipino', '/privacy/tl/', None),
    ('my', 'my', 'my', 'မြန်မာဘာသာ', '/privacy/my/', 'Noto+Sans+Myanmar'),
    ('bn', 'bn', 'bn', 'বাংলা', '/privacy/bn/', 'Noto+Sans+Bengali'),
    ('ta', 'ta', 'ta', 'தமிழ்', '/privacy/ta/', 'Noto+Sans+Tamil'),
    ('zh', 'zh-Hans', 'zh-Hans', '简体中文', '/privacy/zh/', 'Noto+Sans+SC'),
]

def shared_strings():
    js = ("global.window={};global.document={};const fs=require('fs');"
          "let reg;global.TulusI18n={register:(d)=>{reg=d}};"
          "eval(fs.readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify(reg));")
    out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'campaigns/shared/i18n-shared.js')],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)

def rich(s):  # [a1]..[/a1] -> credit link, as on the other pages
    return s.replace('[a1]', '<a href="https://digi-architect.studio" target="_blank" rel="noopener">').replace('[/a1]', '</a>')

CSS = open(os.path.join(HERE, 'page.css'), encoding='utf8').read()

def render(doc, shared):
    code = doc['lang']; meta = next(l for l in LANGS if l[0] == code)
    ui = doc['ui']; sh = shared.get(code) or shared['en']
    url = SITE + meta[4]
    fonts = 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600'
    if meta[5]: fonts += '&family=' + meta[5] + ':wght@400;600;700'
    alt = '\n'.join(f'<link rel="alternate" hreflang="{l[2]}" href="{SITE}{l[4]}">' for l in LANGS)
    alt += f'\n<link rel="alternate" hreflang="x-default" href="{SITE}/privacy/">'
    langnav = ' · '.join((f'<strong lang="{l[1]}" aria-current="page">{l[3]}</strong>' if l[0] == code
                          else f'<a href="{l[4]}" lang="{l[1]}" hreflang="{l[2]}">{l[3]}</a>') for l in LANGS)
    toc = [b for b in doc['blocks'] if b['t'] == 'h2']
    body = []
    for b in doc['blocks']:
        t = b['t']
        if t == 'p':
            cls = f' class="{b["cls"]}"' if b.get('cls') else ''
            body.append(f'    <p{cls}>{b["h"]}</p>')
        elif t == 'h2':
            body.append(f'\n    <h2 id="{b["id"]}">{b["n"]}. {b["h"]}</h2>')
        elif t == 'h3':
            i = f' id="{b["id"]}"' if b.get('id') else ''
            body.append(f'    <h3{i}>{b["h"]}</h3>')
        elif t == 'ul':
            body.append('    <ul>\n' + '\n'.join(f'      <li>{x}</li>' for x in b['items']) + '\n    </ul>')
        elif t == 'table':
            head = ''.join(f'<th scope="col">{x}</th>' for x in b['head'])
            rows = '\n'.join('        <tr>' + f'<th scope="row">{r[0]}</th><td>{r[1]}</td>' + '</tr>' for r in b['rows'])
            body.append(f'    <div class="table-wrap"><table>\n      <thead><tr>{head}</tr></thead>\n      <tbody>\n{rows}\n      </tbody>\n    </table></div>')
        elif t == 'toc':
            items = '\n'.join(f'        <li><a href="#{h["id"]}">{h["h"]}</a></li>' for h in toc)
            body.append(f'\n    <nav class="toc" aria-label="{html.escape(ui["contents"])}">\n      <p>{ui["contents"]}</p>\n      <ul>\n{items}\n      </ul>\n    </nav>')
        elif t == 'contact':
            body.append(f'    <div class="contact">\n      <p><strong>{ui["dpo"]}</strong><br>\n      Zan J Private Limited<br>\n'
                        f'      {ui["email"]}: <a href="mailto:admin@tulussg.com">admin@tulussg.com</a><br>\n'
                        f'      {ui["website"]}: <a href="https://www.tulussg.com/">www.tulussg.com</a></p>\n    </div>')
    note = f'\n    <p class="updated">{ui["translationNote"]}</p>' if ui.get('translationNote') else ''
    return f'''<!DOCTYPE html>
<html lang="{meta[1]}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'self'; object-src 'none'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>{html.escape(ui["title"])}</title>
<meta name="description" content="{html.escape(ui["description"])}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{url}">
<!-- Generated by _tests/privacy-src/build.py from {code}.json. Edit the JSON, not this file. English is the approved
     source (owner approval 17 Oct 2026); translations are AI-translated and independently AI-reviewed, not
     human-verified (see /campaigns/translations.js, page "privacy"). -->
{alt}
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(ui["title"])}">
<meta property="og:description" content="{html.escape(ui["ogDescription"])}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="TulusSG">
<meta property="og:image" content="https://www.tulussg.com/assets/share/tulussg-share-2026-10.png">
<link rel="icon" href="/assets/share/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/share/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?{fonts}&display=swap" rel="stylesheet">
<style>
{CSS}</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <a href="/" aria-label="{html.escape(ui["homeLabel"])}"><img src="/campaigns/shared/tulussg-logo-192.png" alt="TulusSG" width="184" height="192"></a>
    <a class="back" href="/campaigns/">{ui["back"]}</a>
  </header>

  <main>
    <p class="tag">TulusSG</p>
    <h1>{ui["h1"]}</h1>
    <p class="updated">{ui["updated"]}</p>
    <nav class="langs" aria-label="{html.escape(ui["languages"])}">{langnav}</nav>{note}

{chr(10).join(body)}
  </main>
</div>

<footer>
  <div class="wrap">
    <a href="/" aria-label="{html.escape(ui["homeLabel"])}"><img src="/campaigns/shared/tulussg-logo-192.png" alt="TulusSG" width="184" height="192"></a>
    <span>{ui["questions"]} <a href="mailto:admin@tulussg.com">admin@tulussg.com</a></span>
    <p class="footer-copy">{sh["footer.copyright"]}<br>{sh["footer.rights"]}<br>{rich(sh["footer.credit"])}</p>
  </div>
</footer>
</body>
</html>
'''

def main():
    shared = shared_strings()
    built = []
    for l in LANGS:
        src = os.path.join(HERE, l[0] + '.json')
        if not os.path.exists(src): continue
        doc = json.load(open(src, encoding='utf8'))
        out = os.path.join(ROOT, l[4].strip('/'), 'index.html')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'w', encoding='utf8').write(render(doc, shared))
        built.append(l[0])
    print('built', ' '.join(built))

if __name__ == '__main__':
    main()
