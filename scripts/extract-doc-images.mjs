import fs from "fs";
import path from "path";
import os from "os";

const htmlPath = path.join(os.tmpdir(), "pa-doc.html");
const outDir = path.join(process.cwd(), ".tmp-doc-images");
fs.mkdirSync(outDir, { recursive: true });

const html = fs.readFileSync(htmlPath, "utf8");
const re = /src="(data:image\/[^"]+)"/g;
let m;
let i = 0;
while ((m = re.exec(html)) && i < 12) {
  const d = m[1];
  const mm = d.match(/^data:image\/([^;]+);base64,(.+)$/);
  if (!mm) continue;
  const ext = mm[1].replace("jpeg", "jpg");
  fs.writeFileSync(path.join(outDir, `img-${i}.${ext}`), Buffer.from(mm[2], "base64"));
  i++;
}
console.log("saved", i, "images to", outDir);
