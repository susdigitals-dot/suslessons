"""CSS/JS লিংকে নতুন ?v= বসায়, যাতে push-এর পরে ব্রাউজার পুরোনো ফাইল না দেখায়।

GitHub Pages ফাইলগুলো ব্রাউজারে ১০ মিনিট রেখে দেয়, আর JS module-এর ভেতরের import
আরও বেশিক্ষণ পুরোনো থাকতে পারে। প্রতিটা push-এর আগে চালাও:

    python tools/bump.py

HTML-এর <link>/<script> আর সব JS-এর `from "./x.js"` / `import "./x.js"` একই ভার্সন পায়
(সব জায়গায় একই ভার্সন না থাকলে একটা module দু'বার লোড হয়)।
"""
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = {"_old", "_guide", ".git", ".claude", "node_modules"}
VER = sys.argv[1] if len(sys.argv) > 1 else time.strftime("%Y%m%d%H%M")

HTML = re.compile(r'((?:href|src)="[^"]*assets/(?:css|js)/[\w./-]+?\.(?:css|js))(?:\?v=\w+)?"')
JS = re.compile(r'((?:from|import)\s+"\.{1,2}/[\w./-]+?\.js)(?:\?v=\w+)?"')


def files(ext):
    for p in ROOT.rglob(f"*.{ext}"):
        if not SKIP & set(p.relative_to(ROOT).parts):
            yield p


changed = 0
for pattern, ext in ((HTML, "html"), (JS, "js")):
    for p in files(ext):
        text = p.read_text(encoding="utf-8")
        new = pattern.sub(lambda m: f'{m.group(1)}?v={VER}"', text)
        if new != text:
            p.write_text(new, encoding="utf-8", newline="\n")
            changed += 1

print(f"v={VER}: {changed} files updated")
