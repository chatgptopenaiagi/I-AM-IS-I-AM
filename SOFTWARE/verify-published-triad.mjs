// Read-only live verification against an explicit committed source revision.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const base = process.argv[2],
  revision = process.argv[3];
if (
  !base?.startsWith("https://") ||
  !base.endsWith("/") ||
  !/^[a-f0-9]{40}$/i.test(revision || "")
)
  throw new Error(
    "Supply HTTPS site root ending / and a full Git commit hash.",
  );
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "chrome" } : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(20000);
  const errors = [],
    failed = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() });
  });
  page.on("request", (r) => requests.push(r.url()));
  const response = await page.goto(base + "triad.html", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  assert.equal(response.status(), 200);
  await page.locator("#selected-id").filter({ hasText: "QFP-D005" }).waitFor();
  assert.equal(await page.title(), "I-AM-IS-I-AM · Triad Research Engine");
  const hashes = [];
  for (const file of [
    "triad.html",
    "triad.css",
    "atlas.css",
    "js/triad.js",
    "js/triad-state.js",
    "js/triad-i18n.js",
    "js/triad-responses.js",
    "js/research-interface.js",
    "js/research-experiments.js",
    "data/research.json",
  ]) {
    const r = await page.request.get(base + file);
    assert.equal(r.status(), 200, file);
    const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
    const actual = hash(await r.body()),
      expected = hash(
        execFileSync("git", ["show", revision + ":WEB/qfp-lab/" + file], {
          maxBuffer: 10 * 1024 * 1024,
        }),
      );
    assert.equal(actual, expected, file);
    hashes.push({ file, sha256: actual });
  }
  await page.locator("#triad-de-sitter").click();
  assert.match(
    await page.locator("#experiment-readouts").textContent(),
    /PASS/,
  );
  for (const topic of [
    "projection",
    "observer",
    "scale",
    "time",
    "identity",
    "qfp",
  ]) {
    await page.locator(`[data-topic="${topic}"]`).click();
    const id = await page.locator("#selected-id").textContent();
    for (const panel of await page.locator(".context-id").all())
      assert.equal(await panel.textContent(), id);
  }
  await page.locator('[data-topic="projection"]').click();
  await page.locator("#triad-param-s").fill("1");
  await page.locator("#triad-param-s").blur();
  assert.equal(
    JSON.parse(await page.locator("#experiment-record").textContent()).output
      .slice.kind,
    "point",
  );
  await page.locator("#triad-object").selectOption("QFP-S001");
  assert.equal(
    await page.locator("#selected-classification").textContent(),
    "SCHEMA",
  );
  assert.equal(await page.locator("#triad-export").isDisabled(), true);
  await page.locator('[data-topic="qfp"]').click();
  await page.screenshot({
    path: "test-results/live-triad-desktop.png",
    fullPage: true,
  });
  await page.locator("#triad-language").selectOption("ro");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const topic of ["projection", "qfp", "identity"]) {
    await page.locator(`[data-topic="${topic}"]`).click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  assert.equal(await page.locator("#math-title").textContent(), "Matematică");
  await page.screenshot({
    path: "test-results/live-triad-phone-ro.png",
    fullPage: true,
  });
  assert.equal(await page.locator("#ask-agent").isDisabled(), true);
  assert.equal(await page.locator("#run-wolfram").isDisabled(), true);
  assert.ok(
    requests.every((url) => url.startsWith(base)),
    "No optional service or external resource request",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  const report = {
    observed_at: new Date().toISOString(),
    source_revision: revision,
    url: base + "triad.html",
    http_status: response.status(),
    checks: [
      "10 published asset hashes match explicit Git source",
      "six topics synchronize all panels",
      "de Sitter reference",
      "slice boundary",
      "SCHEMA remains non-executable",
      "Romanian phone layouts",
      "no automatic optional service requests",
    ],
    asset_hashes: hashes,
    page_errors: errors,
    failed_responses: failed,
    limits:
      "Static deployed interface only; no provider inference, Wolfram kernel or ChatGPT registration verified.",
  };
  await writeFile(
    "test-results/live-triad-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
