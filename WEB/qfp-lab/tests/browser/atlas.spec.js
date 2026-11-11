import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { cleanState, encodeState } from "../../js/atlas-state.js";

test("missing indexes return 404 without terminating the local preview", async ({ request }) => {
  expect((await request.get("./js/")).status()).toBe(404);
  expect((await request.get("./missing.json")).status()).toBe(404);
  expect((await request.get("./")).status()).toBe(200);
});

async function ready(page, path = "./") {
  await page.goto(path);
  await expect(page.locator("#claim-count")).toContainText("public records");
  await expect(page.locator("#app-status")).not.toContainText("could not load");
}
async function range(page, id, value) {
  await page.locator(id).evaluate((e, value) => {
    e.value = value;
    e.dispatchEvent(new Event("input", { bubbles: true }));
  }, String(value));
}

test("Pages base path loads only local essential assets and QFP equations", async ({
  page,
}) => {
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await ready(page);
  await expect(page).toHaveTitle("I-AM-IS-I-AM · Research Atlas");
  await expect(page.locator("#qfp-readouts")).toContainText("2.4");
  await expect(page.locator("#qfp-readouts")).toContainText("0.9216");
  await expect(page.locator("#qfp-readouts")).toContainText("1.56922");
  expect(errors).toEqual([]);
  expect(
    requests.every((u) => u.startsWith("http://127.0.0.1:4174/I-AM-IS-I-AM/")),
  ).toBeTruthy();
});
test("QFP preset, independent curvature references, closure and crossing cases", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#de-sitter").click();
  await expect(page.locator("#preset-check")).toContainText("PASS");
  await expect(page.locator("#qfp-readouts")).toContainText("0.96");
  await page.locator("#close-scalar").click();
  expect(
    Math.abs(
      Number(
        await page
          .locator("#qfp-readouts .readout")
          .last()
          .locator("output")
          .textContent(),
      ),
    ),
  ).toBeLessThan(1e-12);
  for (const [m3, warn] of [
    [-0.15, false],
    [0.15, true],
    [0.125, true],
    [0.12, false],
  ]) {
    const state = cleanState({ qfp: { m3, rMax: 2 } });
    await page.goto("./" + encodeState(state));
    await expect(page.locator("#qfp-warning")).toBeVisible({ visible: warn });
  }
  await range(page, "#param-Lambda", -0.6);
  await page.locator("#de-sitter").click();
  await expect(page.locator("#preset-check")).toContainText("AdS-type");
  await page.locator("#qfp-mode").selectOption("curvature");
  await expect(page.locator("#qfp-description")).toContainText("r = 0 only");
  await page.locator("#reset-all").click();
  await expect(page.locator("#param-m3")).toHaveValue("0.12");
});
test("projection slice has a point at the boundary and an empty exterior", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-module="projection"]').click();
  await page.locator("#slice-boundary").click();
  await expect(page.locator("#projection-description")).toContainText(
    "Slice: point; radius 0, area 0",
  );
  await page.locator("#slice-outside").click();
  await expect(page.locator("#projection-description")).toContainText(
    "Slice: empty",
  );
  await page.locator("#slice-center").click();
  await expect(page.locator("#projection-description")).toContainText(
    "radius 1",
  );
});
test("moving or widening access window never advances state", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-module="access"]').click();
  await page.locator("#advance").click();
  await page.locator("#window-center").fill("30");
  await page.locator("#window-center").blur();
  await range(page, "#window-width", 10);
  await expect(page.locator("#access-n")).toHaveText("1");
  await expect(page.locator("#access-description")).toContainText(
    "unique next state 2",
  );
  await page.locator("#follow-state").click();
  await expect(page.locator("#window-center")).toHaveValue("1");
  await expect(page.locator("#access-n")).toHaveText("1");
});
test("scale reference and reflection preserve the chosen identity", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-module="scale"]').click();
  await range(page, "#scale-q", 4);
  await page.locator("#reference-length").fill("2");
  await page.locator("#reference-length").blur();
  await expect(page.locator("#scale-values")).toContainText("4.00000e+0 m²");
  await page.locator("#reflect").click();
  await expect(page.locator("#scale-q")).toHaveValue("-4");
  await expect(page.locator("#scale-values")).toContainText("4.00000e+0 m²");
  await page.locator("#reference-length").fill("-1");
  await page.locator("#reference-length").blur();
  await expect(page.locator("#reference-length")).toHaveValue("1e-9");
});
test("export, validated import and fragment restoration preserve experiment", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-module="projection"]').click();
  await range(page, "#slice", 0.7);
  const dl = page.waitForEvent("download");
  await page.locator("#export-state").click();
  const download = await dl,
    body = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(body.version).toBe(1);
  expect(body.projection.s).toBe(0.7);
  await page.locator("#reset-all").click();
  await page
    .locator("#import-state")
    .setInputFiles({
      name: "experiment.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(body)),
    });
  await expect(page.locator("#slice")).toHaveValue("0.7");
  const url = page.url();
  await page.reload();
  await expect(page.locator("#slice")).toHaveValue("0.7");
  expect(page.url()).toBe(url);
});
test("malformed, oversized, foreign-version and injected text state cannot corrupt UI", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  for (const input of [
    "{",
    '{"version":2}',
    JSON.stringify({ version: 1, note: "x".repeat(13000) }),
  ]) {
    await page
      .locator("#import-state")
      .setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from(input),
      });
    await expect(page.locator("#app-status")).toContainText("Import rejected");
  }
  await page
    .locator("#import-state")
    .setInputFiles({
      name: "safe.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          module: "projection",
          projection: { s: 1000 },
          qfp: { m3: "NaN" },
          note: "<img src=x onerror=alert(1)>",
        }),
      ),
    });
  await expect(page.locator("#slice")).toHaveValue("1.2");
  await expect(page.locator("img")).toHaveCount(0);
  await page.goto("./#atlas=%ZZ");
  await expect(page.locator("#app-status")).toContainText(
    "Malformed experiment link",
  );
  await page.reload();
  await expect(page.locator("#app-status")).toContainText(
    "Invalid experiment link",
  );
  expect(errors).toEqual([]);
});
test("claims open, search and export only public provenance; dependency impact stays typed", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-route="examine"]').click();
  await page.locator("#claim-search").fill("QFP-S001");
  await expect(page.locator(".claim-card")).toHaveCount(1);
  await page.locator(".claim-card").click();
  await expect(page.locator("#claim-dialog")).toBeVisible();
  await expect(page.locator("#claim-detail")).toContainText("SCHEMA");
  const pending = page.waitForEvent("download");
  await page.locator("#export-claim").click();
  const d = await pending,
    record = JSON.parse(await readFile(await d.path(), "utf8"));
  expect(record.claim.id).toBe("QFP-S001");
  expect(record.claim.epistemic_status).toBeNull();
  expect(record).not.toHaveProperty("messages");
  await page.keyboard.press("Escape");
  await expect(page.locator("#claim-dialog")).not.toBeVisible();
  await page.locator("#impact-select").selectOption("QFP-A003");
  await expect(page.locator("#impact-results")).toContainText("QFP-D005");
  await expect(page.locator("#impact-results")).not.toContainText("QFP-S001");
  await page.locator("#claim-search").fill("nothing-matches-xyz");
  await expect(page.locator("#claim-list")).toContainText(
    "No matching records",
  );
});
test("both timeline windows and Romanian primary navigation work", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-route="understand"]').click();
  await expect(page.locator("#timeline-list li")).not.toHaveCount(0);
  await page.locator("#timeline-window").selectOption("2");
  await expect(page.locator("#timeline-list")).not.toContainText("2023-");
  await page.locator("#language").selectOption("ro");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.locator('[data-route="explore"]')).toHaveText("Explorează");
  await page.locator('[data-route="explore"]').click();
  await expect(page.locator("#export-state")).toHaveText("Exportă JSON");
  await expect(page.locator("#de-sitter")).toContainText("Presetare");
  await page.locator('[data-module="projection"]').click();
  await expect(page.locator("#slice-boundary")).toHaveText("Frontieră s = 1");
});
test("phone layouts and keyboard interaction, with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.locator('[data-module="projection"]').focus();
  await page.keyboard.press("Enter");
  await page.locator("#slice").focus();
  const before = await page.locator("#slice").inputValue();
  await page.keyboard.press("ArrowRight");
  expect(await page.locator("#slice").inputValue()).not.toBe(before);
  for (const lang of ["en", "ro"]) {
    await page.locator("#language").selectOption(lang);
    for (const route of ["explore", "understand", "examine"]) {
      await page.locator(`[data-route="${route}"]`).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
    }
  }
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion:reduce)").matches,
    ),
  ).toBeTruthy();
});
test("WebGL failure preserves essential SVG and numerical interaction", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return String(kind).includes("webgl")
        ? null
        : original.call(this, kind, ...args);
    };
  });
  await ready(page);
  await page.locator("#optional-3d summary").click();
  await page.locator("#load-3d").click();
  await expect(page.locator("#webgl-status")).toContainText("3D unavailable");
  await page.locator("#de-sitter").click();
  await expect(page.locator("#preset-check")).toContainText("PASS");
});
test("skip navigation preserves state and tiny nonzero residuals stay visible", async ({
  page,
}) => {
  await ready(
    page,
    "./" +
      encodeState(cleanState({ qfp: { Phi2: 1e-15, Fp0: 0, Hp0: 0, Vp0: 0 } })),
  );
  await expect(
    page.locator("#qfp-readouts .readout").last().locator("output"),
  ).toHaveText("6e-15");
  const fragment = new URL(page.url()).hash;
  await page.locator(".skip").focus();
  await page.keyboard.press("Enter");
  expect(new URL(page.url()).hash).toBe(fragment);
  await expect(
    page.locator("#qfp-readouts .readout").last().locator("output"),
  ).toHaveText("6e-15");
});
test("share output excludes unrelated URL queries", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          window.copiedExperiment = text;
        },
      },
    }),
  );
  await ready(page, "./?private-context=synthetic-test");
  await page.locator("#share").click();
  const copied = await page.evaluate(() => window.copiedExperiment);
  expect(copied).toContain("#atlas=");
  expect(copied).not.toContain("private-context");
  await expect(page.locator("#app-status")).toContainText(
    "Other people need a hosted copy",
  );
});
test("preserved geometry route has local renderer and real provenance destinations", async ({
  page,
}) => {
  await page.goto("./geometry.html");
  await expect(page.locator("#out-r")).toHaveText("2.400000");
  await page.locator("#de-sitter").click();
  await expect(page.locator("#ds-check")).toContainText("PASS");
  const hrefs = await page
    .locator("footer a")
    .evaluateAll((nodes) => nodes.map((n) => n.href));
  expect(
    hrefs.every((h) =>
      h.startsWith(
        "https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/blob/6fa0f1f/",
      ),
    ),
  ).toBeTruthy();
  await page.goto("./WEB/qfp-lab/");
  await expect(page.locator("a").first()).toHaveAttribute("href", "../../");
});
test("capture actual desktop and phone atlas for visual review", async ({
  page,
}) => {
  await mkdir("assets", { recursive: true });
  await mkdir("test-results/visual", { recursive: true });
  await ready(page);
  await page.screenshot({ path: "assets/atlas-desktop.png", fullPage: true });
  for (const module of ["projection", "access", "scale"]) {
    await page.locator(`[data-module="${module}"]`).click();
    await page.screenshot({
      path: `test-results/visual/${module}-desktop.png`,
      fullPage: true,
    });
  }
  for (const route of ["understand", "examine"]) {
    await page.locator(`[data-route="${route}"]`).click();
    await page.screenshot({
      path: `test-results/visual/${route}-desktop.png`,
      fullPage: true,
    });
  }
  await page.locator('[data-route="explore"]').click();
  await page.locator('[data-module="qfp"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "assets/atlas-phone.png", fullPage: true });
  await page.locator("#language").selectOption("ro");
  await page.locator('[data-module="projection"]').click();
  await page.screenshot({
    path: "test-results/visual/phone-ro-projection.png",
    fullPage: true,
  });
});
