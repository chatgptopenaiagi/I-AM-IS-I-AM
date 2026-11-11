// Explicit public artifact allowlist. No repository-wide copy or private source glob.
import {
  mkdir,
  copyFile,
  readFile,
  writeFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";
const root = "WEB/qfp-lab",
  out = "dist";
const files = [
  "index.html",
  "geometry.html",
  "atlas.css",
  "styles.css",
  "js/atlas.js",
  "js/atlas-i18n.js",
  "js/atlas-math.js",
  "js/atlas-state.js",
  "js/main.js",
  "js/qfp-controls.js",
  "js/qfp-math.js",
  "js/qfp-model.js",
  "js/qfp-scene.js",
  "data/research.json",
  "vendor/three/three.module.js",
  "vendor/three/OrbitControls.js",
  "vendor/three/LICENSE.txt",
];
const allowed = new Set([...files, ".nojekyll", "WEB/qfp-lab/index.html"]);
async function checkExisting(relative = "") {
  let entries;
  try {
    entries = await readdir(path.join(out, relative), { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") return;
    throw e;
  }
  for (const entry of entries) {
    const name = relative ? relative + "/" + entry.name : entry.name;
    if (entry.isSymbolicLink())
      throw new Error("Public build refuses symlinks: " + name);
    if (entry.isDirectory()) {
      if (![...allowed].some((file) => file.startsWith(name + "/")))
        throw new Error("Unexpected public build directory: " + name);
      await checkExisting(name);
    } else if (!entry.isFile() || !allowed.has(name))
      throw new Error(
        "Unexpected public build file (preserved, not published): " + name,
      );
  }
}
await checkExisting();
for (const file of files) {
  await mkdir(path.dirname(path.join(out, file)), { recursive: true });
  await copyFile(path.join(root, file), path.join(out, file));
}
await writeFile(path.join(out, ".nojekyll"), "");
// Keep the historical source-shaped lab route useful under the Pages base.
await mkdir(path.join(out, "WEB/qfp-lab"), { recursive: true });
await writeFile(
  path.join(out, "WEB/qfp-lab/index.html"),
  '<!doctype html><meta charset="utf-8"><title>I-AM-IS-I-AM laboratory</title><p>The laboratory is at the <a href="../../">atlas entry point</a>. <a href="../../geometry.html">Original QFP geometry lab</a>.</p>',
);
const data = JSON.parse(
  await readFile(path.join(out, "data/research.json"), "utf8"),
);
console.log(
  `Public atlas built: ${files.length} allowlisted source assets, ${data.claims.length} claims. Artifact root: dist; project base: /I-AM-IS-I-AM/.`,
);
