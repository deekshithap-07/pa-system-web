import base64
import os
import pathlib
import re

html_path = os.path.join(os.environ["TEMP"], "pa-doc.html")
out_dir = pathlib.Path(r"d:\deekshh\system web\.tmp-doc-images")
out_dir.mkdir(exist_ok=True)

html = open(html_path, encoding="utf-8").read()
pattern = re.compile(r'src="(data:image/[^"]+)"')
saved = 0

for match in pattern.finditer(html):
    data = match.group(1)
    parts = re.match(r"^data:image/([^;]+);base64,(.+)$", data)
    if not parts:
        continue
    ext = parts.group(1).replace("jpeg", "jpg")
    out_path = out_dir / f"img-{saved}.{ext}"
    out_path.write_bytes(base64.b64decode(parts.group(2)))
    saved += 1

print(f"saved {saved} images to {out_dir}")
