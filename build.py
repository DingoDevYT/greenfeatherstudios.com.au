#!/usr/bin/env python3
"""Minify styles.css / script.js and repoint the pages at them.

    py -3.12 build.py

Edit styles.css and script.js. Run this. Commit everything.
"""

import hashlib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
PAGES = ["index.html", "windweaver.html", "team.html", "contact.html"]


def minify_css(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s*([{};,])\s*", r"\1", text)
    text = re.sub(r":\s+", ":", text)
    return text.replace(";}", "}").strip()


def minify_js(path):
    cmd = ["npx", "--yes", "terser@5", str(path), "-c", "-m"]
    try:
        done = subprocess.run(cmd, capture_output=True, text=True, timeout=180, shell=(sys.platform == "win32"))
        if done.returncode == 0 and done.stdout.strip():
            return done.stdout.strip()
        print("  terser unavailable, falling back to whitespace-only")
    except Exception:
        print("  terser unavailable, falling back to whitespace-only")

    lines = []
    for line in path.read_text(encoding="utf-8").split("\n"):
        stripped = line.strip()
        if stripped and not stripped.startswith("//"):
            lines.append(stripped)
    return "\n".join(lines)


def main():
    css = minify_css((ROOT / "styles.css").read_text(encoding="utf-8"))
    (ROOT / "styles.min.css").write_text(css, encoding="utf-8")

    js = minify_js(ROOT / "script.js")
    (ROOT / "script.min.js").write_text(js, encoding="utf-8")

    css_v = hashlib.sha1(css.encode()).hexdigest()[:8]
    js_v = hashlib.sha1(js.encode()).hexdigest()[:8]

    for name in PAGES:
        page = ROOT / name
        text = page.read_text(encoding="utf-8")
        text = re.sub(r'href="styles(?:\.min)?\.css(?:\?v=[^"]*)?"', f'href="styles.min.css?v={css_v}"', text)
        text = re.sub(r'src="script(?:\.min)?\.js(?:\?v=[^"]*)?"', f'src="script.min.js?v={js_v}"', text)
        page.write_text(text, encoding="utf-8")

    src_css = (ROOT / "styles.css").stat().st_size
    src_js = (ROOT / "script.js").stat().st_size
    print(f"styles.min.css  {src_css:>6} -> {len(css.encode()):>6} bytes  v={css_v}")
    print(f"script.min.js   {src_js:>6} -> {len(js.encode()):>6} bytes  v={js_v}")
    print(f"repointed {len(PAGES)} pages")


if __name__ == "__main__":
    main()
