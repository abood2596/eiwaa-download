"""Assemble site/org/index.html from the camp page's shared parts and inject narration captions."""
import json, re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
site = R / 'site'
lines = {}
for l in (R / 'tour/lines.tsv').read_text(encoding='utf-8').splitlines():
    if l.strip():
        p, k, t = l.split('\t'); lines.setdefault(p, {})[k] = t
def inject(html, path):
    return re.sub(r'(<script type="application/json" id="lines">).*?(</script>)',
                  lambda m: m.group(1) + json.dumps(lines[path], ensure_ascii=False) + m.group(2), html, flags=re.S)
camp = (site / 'index.html').read_text(encoding='utf-8').replace('__LINES__', '{}')
camp = inject(camp, 'camp')
(site / 'index.html').write_text(camp, encoding='utf-8')
head = camp[:camp.find('<a class="skip"')]
svg_end = camp.find('</svg>', camp.find('<svg width="0"')) + 6
svg = camp[camp.find('<svg width="0"'):svg_end]
tail = camp[camp.find('<div class="chooser"'):]
base = 'https://eiwaa.bdalhmydalfra879.workers.dev'
rep = {
  '<title>إيواء · سجلّ المخيم كلّه في جوالك</title>': '<title>إيواء للمؤسسات · كشوفات نظيفة من كل المخيمات</title>',
  'content="إيواء نظام لإدارة المخيمات ومراكز الإيواء: سجل الأسر، والتحقق الميداني، والتوزيع، وكشوفات المؤسسات. يعمل بدون إنترنت، ومجاني للمخيمات."':
  'content="إيواء للمؤسسات: كل أسرة مسجّلة مرة واحدة، وكل رقم له مصدر، وكل كشف برقم مرجعي. ابدؤوا بتجربة 60 يومًا على مخيم واحد."',
  f'<link rel="canonical" href="{base}/">': f'<link rel="canonical" href="{base}/org/">',
  '<meta property="og:title" content="إيواء · سجلّ المخيم كلّه في جوالك">': '<meta property="og:title" content="إيواء · كشوفات نظيفة من كل المخيمات">',
  '<meta property="og:description" content="سجل الأسر، والتحقق الميداني، والتوزيع، وكشوفات المؤسسات. يعمل بدون إنترنت، ومجاني للمخيمات.">':
  '<meta property="og:description" content="كل أسرة مرة واحدة، وكل رقم له مصدر، وكل كشف برقم مرجعي. تجربة 60 يومًا على مخيم واحد.">',
  f'{base}/img/og.jpg?v=3': f'{base}/img/og-org.jpg?v=3',
  '<meta property="og:image:alt" content="إيواء: سجلّ المخيم كلّه في جوالك">': '<meta property="og:image:alt" content="إيواء: كشوفات نظيفة من كل المخيمات">',
  f'<meta property="og:url" content="{base}/">': f'<meta property="og:url" content="{base}/org/">',
  'data-path="camp"': 'data-path="org"',
}
for a, b in rep.items():
    assert a in head, a
    head = head.replace(a, b)
body = (pathlib.Path(__file__).resolve().parent / 'org_body.html').read_text(encoding='utf-8')
tail = tail.replace('<p class="lead">دقيقتان بالصوت. اختر ما يناسبك:</p>', '<p class="lead">دقيقتان بالصوت. اختاروا ما يناسبكم:</p>')
org = inject(head + svg + '\n' + body + tail, 'org')
(site / 'org').mkdir(exist_ok=True)
(site / 'org/index.html').write_text(org, encoding='utf-8')
print('ok', len(camp), len(org))
