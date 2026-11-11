import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
// Read-only checks of a published public atlas against an explicit Git revision.
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const base =
  process.argv[2] || "https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/";
const revision = process.argv[3] || "13b187732c68a5bea0e52ebfaac2ba86cfb29777";
if (!/^[a-f0-9]{40}$/i.test(revision))
  throw new Error("Supply a complete Git commit hash.");
if (!base.startsWith("https://") || !base.endsWith("/"))
  throw new Error("Supply an HTTPS site root ending with /.");
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  ...(process.platform === "win32" ? { channel: "chrome" } : {}),
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(20000);
  const errors = [],
    failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() });
  });
  const response = await page.goto(base, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  assert.equal(response.status(), 200);
  await page
    .locator("#claim-count")
    .filter({ hasText: "34 public records" })
    .waitFor({ state: "attached" });
  assert.equal(await page.title(), "I-AM-IS-I-AM · Research Atlas");
  const hashes = [];
  for (const file of [
    "index.html",
    "js/atlas.js",
    "data/research.json",
    "vendor/three/three.module.js",
  ]) {
    const r = await page.request.get(base + file);
    assert.equal(r.status(), 200, file);
    const liveHash = createHash("sha256")
      .update(await r.body())
      .digest("hex");
    const localHash = createHash("sha256")
      .update(
        execFileSync("git", ["show", revision + ":WEB/qfp-lab/" + file], {
          maxBuffer: 10 * 1024 * 1024,
        }),
      )
      .digest("hex");
    assert.equal(liveHash, localHash, file);
    hashes.push({ file, sha256: liveHash });
  }
  await page.locator("#de-sitter").click();
  assert.match(await page.locator("#preset-check").textContent(), /PASS/);
  await page.locator('[data-module="projection"]').click();
  await page.locator("#slice-boundary").click();
  assert.match(
    await page.locator("#projection-description").textContent(),
    /Slice: point; radius 0/,
  );
  await page.locator('[data-module="access"]').click();
  await page.locator("#advance").click();
  await page.locator("#window-center").fill("30");
  await page.locator("#window-center").blur();
  assert.equal(await page.locator("#access-n").textContent(), "1");
  await page.locator('[data-module="scale"]').click();
  await page.locator("#reflect").click();
  assert.ok((await page.locator("#scale-values").textContent()).includes("m²"));
  await page.locator('[data-route="examine"]').click();
  await page.locator("#claim-search").fill("QFP-S001");
  await page.locator(".claim-card").click();
  assert.match(await page.locator("#claim-detail").textContent(), /SCHEMA/);
  await page.keyboard.press("Escape");
  await page.locator("#language").selectOption("ro");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["explore", "understand", "examine"]) {
    await page.locator(`[data-route="${route}"]`).click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await page.screenshot({
    path: "test-results/live-phone-ro.png",
    fullPage: true,
  });
  await page.locator("#language").selectOption("en");
  await page.locator('[data-route="explore"]').click();
  await page.locator('[data-module="qfp"]').click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/live-desktop.png",
    fullPage: true,
  });
  const compatibility = await page.request.get(base + "WEB/qfp-lab/");
  assert.equal(compatibility.status(), 200);
  const geometry = await page.request.get(base + "geometry.html");
  assert.equal(geometry.status(), 200);
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  const report = {
    observed_at: new Date().toISOString(),
    source_revision: revision,
    url: base,
    http_status: response.status(),
    title: await page.title(),
    claims: 34,
    checks: [
      "de Sitter",
      "projection boundary",
      "access state/window independence",
      "scale reflection",
      "SCHEMA claim inspection",
      "Romanian phone navigation without overflow",
      "legacy routes",
    ],
    asset_hashes: hashes,
    page_errors: errors,
    failed_responses: failed,
  };
  await writeFile(
    "test-results/live-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
