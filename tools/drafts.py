"""_drafts/stories/*.md → _drafts/stories.json (অ্যাডমিনের "ড্রাফট ইমপোর্ট" বোতামের জন্য)

    python tools/drafts.py

প্রতিটা .md ফাইলের শুরুতে --- এর মাঝে slug, title, excerpt, last_line, book_slug, law, tags (কমা দিয়ে)।
তারপর গল্পের body — সাইটের নিয়মে (• সময়, ~ অতীত, @নাম: সংলাপ, > উক্তি, ## শিরোনাম, - তালিকা, ==হাইলাইট==, **বোল্ড**)।
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_drafts" / "stories"
out = []
for f in sorted(SRC.glob("*.md")):
    text = f.read_text(encoding="utf-8").replace("\r", "")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise SystemExit(f"{f.name}: --- হেডার পাওয়া গেল না")
    meta = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(":")
        meta[k.strip()] = v.strip()
    story = {
        "slug": meta["slug"],
        "title": meta["title"],
        "excerpt": meta.get("excerpt", ""),
        "last_line": meta.get("last_line", ""),
        "book_slug": meta.get("book_slug") or None,
        "law": meta.get("law", ""),
        "tags": [t.strip() for t in meta.get("tags", "").split(",") if t.strip()],
        "cover_url": meta.get("cover_url", ""),
        "body": m.group(2).strip(),
    }
    words = len(re.findall(r"\S+", story["body"]))
    print(f"{f.name}: {story['slug']} — {words} শব্দ")
    out.append(story)

dest = ROOT / "_drafts" / "stories.json"
dest.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"→ {dest} ({len(out)}টা গল্প)")
