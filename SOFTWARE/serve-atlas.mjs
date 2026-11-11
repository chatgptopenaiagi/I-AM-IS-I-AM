// Loopback-only static server. The mounted project base matches GitHub Pages.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(process.env.ATLAS_ROOT || "WEB/qfp-lab");
const base = "/I-AM-IS-I-AM/";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/") {
      res.writeHead(302, { Location: base });
      res.end();
      return;
    }
    if (!pathname.startsWith(base)) throw new Error("Not in mounted base");
    let file = path.resolve(root, "." + pathname.slice(base.length - 1));
    if (file !== root && !file.startsWith(root + path.sep))
      throw new Error("Outside root");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const content = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch {
    if (!res.headersSent) res.writeHead(404, { "Content-Type": "text/plain" });
    if (!res.writableEnded) res.end("Not found");
  }
});
server.listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
  console.log(`Atlas: http://127.0.0.1:${server.address().port}${base}`),
);
