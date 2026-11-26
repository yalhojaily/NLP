#!/usr/bin/env python3
"""Build the Arabic-track pages (arabic/*.html) from _src/arabic/*.frag.
Fragment format: header lines '@key value', '@minute' followed by '- item' lines, then '@body' and raw HTML."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
AD = lambda n: ''.join('٠١٢٣٤٥٦٧٨٩'[int(c)] if c.isdigit() else c for c in str(n))
LESSONS = [
 (1,'01-script','الحرف والترميز','Script, Unicode and Normalization'),
 (2,'02-tokenization','الكلمة والرمز','Clitics, Segmentation and Subword Tokens'),
 (3,'03-morphology','الجذر والوزن','Root-and-Pattern Morphology'),
 (4,'04-diacritics','التشكيل والغموض','Diacritics and Ambiguity'),
 (5,'05-language-models','النماذج اللغوية والعربية','Language Models for Arabic'),
 (6,'06-syntax','النحو العربي حاسوبياً','Arabic Syntax and Parsing'),
 (7,'07-dialects','الفصحى واللهجات','MSA, Dialects and Arabizi'),
 (8,'08-speech','الكلام العربي','Arabic Speech Recognition and Synthesis'),
 (9,'09-meaning','المعنى والإحالة والمشاعر','Meaning, Reference and Sentiment'),
 (10,'10-resources','الأدوات والموارد','Tools, Corpora and Benchmarks'),
]
N = len(LESSONS)
# chapter files and titles from the home page
idx = (ROOT/'index.html').read_text()
CH = {}
for href, no, ti in re.findall(r'<a class="ch" href="chapters/([^"]+)"><span class="no">([^<]+)</span><span class="ti">([^<]+)</span>', idx):
    n = int(''.join(str('٠١٢٣٤٥٦٧٨٩'.index(c)) for c in no))
    CH[n] = (href, ti)
HEAD = '''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} · المسار العربي | شرح كتاب معالجة الكلام واللغة</title>
<meta name="description" content="{desc}">
<script src="../assets/js/theme.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans:ital,wght@0,400;0,600;1,400&family=Noto+Sans+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="../assets/css/site.css">
</head>
<body>
'''
def parse(p):
    meta, minute, body, mode = {}, [], [], 'h'
    for line in p.read_text().split('\n'):
        if mode == 'b': body.append(line); continue
        if line.startswith('@body'): mode = 'b'; continue
        if line.startswith('@minute'): mode = 'm'; continue
        if mode == 'm' and line.startswith('- '): minute.append(line[2:]); continue
        if line.startswith('@'):
            k, _, v = line[1:].partition(' '); meta[k] = v.strip()
    return meta, minute, '\n'.join(body)
def build():
    for i, slug, title, en in LESSONS:
        src = ROOT/'_src'/'arabic'/(slug+'.frag')
        if not src.exists(): print('skip', slug); continue
        meta, minute, body = parse(src)
        prev = f'<a class="pill" href="{LESSONS[i-2][1]}.html" style="text-decoration:none">→ الدرس {AD(i-1)}</a>' if i > 1 else '<a class="pill" href="index.html" style="text-decoration:none">→ المسار العربي</a>'
        nxt = f'<a class="pill" href="{LESSONS[i][1]}.html" style="text-decoration:none">الدرس {AD(i+1)} ←</a>' if i < N else '<a class="pill" href="index.html" style="text-decoration:none">المسار العربي ←</a>'
        chs = [int(x) for x in meta.get('slp','').split(',') if x.strip()]
        slp = ''.join(f'<a class="arlink" href="../chapters/{CH[c][0]}">الفصل {AD(c)}: {CH[c][1]}</a>' for c in chs if c in CH)
        h = HEAD.format(title=title, desc=meta.get('desc',''))
        h += f'''<div class="bar">
  <div class="bar-in">
    <a class="book" href="../" style="text-decoration:none;color:inherit">شرح كتاب <span class="en">Speech and Language Processing</span></a>
    <div class="chnav">{prev}<b>الدرس {AD(i)} من {AD(N)}</b>{nxt}</div>
  </div>
  <div class="progress" id="prog"></div>
</div>

<div class="page">
<article class="col">

<header class="hero">
  <div class="num">المسار العربي · الدرس {AD(i)}</div>
  <h1>{title}</h1>
  <div class="sub en" style="font-size:16px">Arabic Track · Lesson {i} · {en}</div>
  <p class="epi">{meta.get('epi','')}</p>
  {('<p class="note" style="margin-top:8px">يكمّل من الكتاب: '+slp+'</p>') if slp else ''}
  <div class="howto">
    <span><i class="sw" style="background:var(--green-soft);border-color:var(--green)"></i>«باختصار»: خلاصة القسم</span>
    <span><i class="sw" style="background:var(--math-soft);border-color:var(--math)"></i>«مفهوم رياضي»: شرح من الصفر</span>
    <span><i class="sw" style="background:var(--paper);border-color:var(--rule)"></i>أداة تفاعلية</span>
  </div>
</header>

<details class="mtoc"><summary>أقسام الدرس</summary><div id="mtoc"></div></details>

<div class="minute">
  <h2>الدرس في دقيقة</h2>
  <ol>
''' + '\n'.join(f'    <li>{m}</li>' for m in minute) + f'''
  </ol>
</div>
{body}
<div class="foot">{'<a href="'+LESSONS[i-2][1]+'.html">→ الدرس السابق: '+LESSONS[i-2][2]+'</a>' if i>1 else '<a href="index.html">→ المسار العربي</a>'}{'<a href="'+LESSONS[i][1]+'.html">الدرس التالي: '+LESSONS[i][2]+' ←</a>' if i<N else '<a href="index.html">المسار العربي ←</a>'}</div>
</article>

<nav class="toc" aria-label="أقسام الدرس"><h4>أقسام الدرس</h4><div id="toc"></div></nav>
</div>
<script src="../assets/js/ar-common.js"></script>
<script src="../assets/js/ar{i:02d}.js"></script>
</body>
</html>
'''
        (ROOT/'arabic'/(slug+'.html')).write_text(h)
        print('built', slug)
if __name__ == '__main__': build()
