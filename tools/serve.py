"""লোকাল প্রিভিউ সার্ভার — GitHub Pages-এর মতো /free খুললে free.html দেখায়।

    python tools/serve.py          # http://localhost:5500
    python tools/serve.py 8000
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5500


class Pages(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = Path(super().translate_path(path))
        # এক্সটেনশন ছাড়া পাথ → একই নামের .html থাকলে সেটা
        if not local.exists() and not local.suffix and local.with_suffix(".html").is_file():
            return str(local.with_suffix(".html"))
        return str(local)


if __name__ == "__main__":
    print(f"http://localhost:{PORT}")
    ThreadingHTTPServer(("", PORT), partial(Pages, directory=str(ROOT))).serve_forever()
