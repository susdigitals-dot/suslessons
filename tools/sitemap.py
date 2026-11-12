"""sitemap.xml বানায় — Supabase থেকে প্রকাশিত গল্প আর বই নিয়ে।

    python tools/sitemap.py

নতুন গল্প/বই প্রকাশের পর একবার চালিয়ে push করো, যাতে Google তাড়াতাড়ি খুঁজে পায়।
"""
import json
import re
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
cfg = (ROOT / "assets/js/config.js").read_text(encoding="utf-8")
URL = re.search(r'supabaseUrl:\s*"([^"]+)"', cfg).group(1)
KEY = re.search(r'supabaseAnonKey:\s*"([^"]+)"', cfg).group(1)
SITE = "https://suslessons.in"

STATIC = [
    ("", "daily", "1.0"),
    ("stories.html", "daily", "0.9"),
    ("books.html", "weekly", "0.8"),
    ("free", "weekly", "0.7"),
    ("about.html", "monthly", "0.5"),
    ("contact.html", "yearly", "0.3"),
    ("privacy.html", "yearly", "0.2"),
    ("terms.html", "yearly", "0.2"),
    ("refund.html", "yearly", "0.2"),
    ("disclosure.html", "yearly", "0.2"),
]


def rows(table, query):
    req = urllib.request.Request(
        f"{URL}/rest/v1/{table}?{query}",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def day(v):
    return (v or "")[:10] or date.today().isoformat()


urls = [(f"{SITE}/{p}", date.today().isoformat(), f, pr) for p, f, pr in STATIC]
# নির্ধারিত (ভবিষ্যতের তারিখের) গল্প বাদ — ভারতের সময়ে আজ পর্যন্ত যা প্রকাশিত
TODAY = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).date().isoformat()
for s in rows("stories", f"select=slug,published_at,updated_at&published=eq.true&type=eq.blog&published_at=lte.{TODAY}"):
    urls.append((f"{SITE}/story.html?s={s['slug']}", day(s.get("updated_at") or s.get("published_at")), "monthly", "0.8"))
for b in rows("books", "select=slug,updated_at&published=eq.true"):
    urls.append((f"{SITE}/book.html?b={b['slug']}", day(b.get("updated_at")), "monthly", "0.7"))

body = "\n".join(
    f"  <url><loc>{escape(u)}</loc><lastmod>{m}</lastmod><changefreq>{f}</changefreq><priority>{pr}</priority></url>"
    for u, m, f, pr in urls
)
(ROOT / "sitemap.xml").write_text(
    f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n',
    encoding="utf-8",
)
print(f"sitemap.xml: {len(urls)} URL")
