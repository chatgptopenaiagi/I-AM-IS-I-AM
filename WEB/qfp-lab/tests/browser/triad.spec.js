import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
async function ready(page) {
  await page.goto("./triad.html");
  await expect(page.locator("#selected-id")).toHaveText("QFP-D005");
}
test("Triad entry shares one research object and works without optional services", async ({
  page,
}) => {
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await ready(page);
  await expect(page).toHaveTitle("I-AM-IS-I-AM · Triad Research Engine");
  for (const e of await page.locator(".context-id").all())
    await expect(e).toHaveText("QFP-D005");
  await expect(page.locator("#experiment-record")).toContainText(
    '"engine": "javascript"',
  );
  await expect(page.locator("#microsoft-status")).toContainText(
    "NOT CONFIGURED",
  );
  await expect(page.locator("#ask-agent")).toBeDisabled();
  expect(
    requests.every((u) => u.startsWith("http://127.0.0.1:4174/I-AM-IS-I-AM/")),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("six topics synchronize all panels; philosophical schemas do not receive invented computations", async ({
  page,
}) => {
  await ready(page);
  for (const [topic, id] of [
    ["projection", "ATLAS-BALL-PROJECTION"],
    ["observer", "ATLAS-INTEGER-ACCESS"],
    ["scale", "ATLAS-LOG-SCALE"],
    ["qfp", "QFP-D005"],
    ["time", "ATLAS-CAUSAL-ORDER"],
    ["identity", "ATLAS-BEING"],
  ]) {
    await page.locator(`[data-topic="${topic}"]`).click();
    await expect(page.locator("#selected-id")).toHaveText(id);
    for (const e of await page.locator(".context-id").all())
      await expect(e).toHaveText(id);
  }
  await expect(page.locator("#triad-export")).toBeDisabled();
  await expect(page.locator("#experiment-record")).toContainText(
    "No computation was performed",
  );
  await page.locator('[data-topic="projection"]').click();
  await page.locator("#triad-object").selectOption("QFP-S001");
  await expect(page.locator("#selected-classification")).toHaveText("SCHEMA");
  await expect(page.locator("#experiment-actions")).toBeHidden();
});
test("actual computations follow parameter controls and maintain local-scope labels", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#triad-de-sitter").click();
  await expect(page.locator("#experiment-readouts")).toContainText("PASS");
  await page.locator("#triad-param-m3").fill("0.125");
  await page.locator("#triad-param-m3").blur();
  await expect(page.locator(".crossing-warning")).toContainText(
    "not a proven horizon",
  );
  await page.locator('[data-topic="projection"]').click();
  await page.locator("#triad-param-s").fill("1");
  await page.locator("#triad-param-s").blur();
  await expect(page.locator("#experiment-record")).toContainText(
    '"kind": "point"',
  );
  await page.locator("#triad-param-s").fill("1.2");
  await page.locator("#triad-param-s").blur();
  await expect(page.locator("#experiment-record")).toContainText(
    '"kind": "empty"',
  );
  await page.locator('[data-topic="observer"]').click();
  await page.locator("#triad-param-center").fill("40");
  await page.locator("#triad-param-center").blur();
  await expect(page.locator("#experiment-record")).toContainText('"state": 0');
  await expect(page.locator("#experiment-record")).toContainText('"next": 1');
  await page.locator('[data-topic="scale"]').click();
  await page.locator("#triad-param-l0").fill("2");
  await page.locator("#triad-param-l0").blur();
  await expect(page.locator("#experiment-record")).toContainText(
    '"reference_squared": 4',
  );
});
test("export/import reproduces results and rejects falsified numerical or source records", async ({
  page,
}) => {
  await ready(page);
  const pending = page.waitForEvent("download");
  await page.locator("#triad-export").click();
  const file = await pending,
    record = JSON.parse(await readFile(await file.path(), "utf8"));
  expect(record.input.claim_id).toBe("QFP-D005");
  expect(record).not.toHaveProperty("token");
  await page.locator('[data-topic="identity"]').click();
  await page.locator("#triad-import").setInputFiles({
    name: "result.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(record)),
  });
  await expect(page.locator("#selected-id")).toHaveText("QFP-D005");
  await expect(page.locator("#triad-status")).toContainText(
    "reproduced exactly",
  );
  record.output.R0 = 999;
  await page.locator("#triad-import").setInputFiles({
    name: "tampered.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(record)),
  });
  await expect(page.locator("#triad-status")).toContainText("Import rejected");
  expect(
    JSON.parse(await page.locator("#experiment-record").textContent()).output
      .R0,
  ).toBe(2.4);
});
test("state restores on reload and malformed inputs preserve a usable context", async ({
  page,
}) => {
  await ready(page);
  await page.locator('[data-topic="scale"]').click();
  await page.locator("#triad-param-q").fill("5");
  await page.locator("#triad-param-q").blur();
  await page.reload();
  await expect(page.locator("#triad-param-q")).toHaveValue("5");
  await page.goto("./triad.html#triad=%ZZ");
  await expect(page.locator("#selected-id")).toHaveText("ATLAS-LOG-SCALE");
  await page.reload();
  await expect(page.locator("#selected-id")).toHaveText("QFP-D005");
  await expect(page.locator("#triad-status")).toContainText(
    "Invalid experiment link",
  );
});
test("source and dependency interactions retain registered context and explicit tool previews", async ({
  page,
}) => {
  await ready(page);
  await page
    .locator("#triad-dependencies button")
    .filter({ hasText: "QFP-D003" })
    .click();
  await expect(page.locator("#selected-id")).toHaveText("QFP-D003");
  await expect(page.locator("#triad-export")).toBeDisabled();
  await page
    .locator("summary")
    .filter({ hasText: "Scoped research tools" })
    .click();
  await page.locator("#tool-select").selectOption("research_get_claim");
  await expect(page.locator("#tool-preview")).toContainText("QFP-D003");
  await expect(page.locator("#triad-sources a").first()).toHaveAttribute(
    "href",
    /^https:\/\//,
  );
});
test("Romanian controls, keyboard and narrow layouts work with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.locator("#triad-language").selectOption("ro");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page.locator("#math-title")).toHaveText("Matematică");
  await expect(page.locator("#triad-export")).toHaveText(
    "Exportă experimentul JSON",
  );
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const topic of ["projection", "qfp", "identity"]) {
      await page.locator(`[data-topic="${topic}"]`).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  }
  await page.locator('[data-topic="projection"]').click();
  await page.locator("#triad-slider").focus();
  const before = await page.locator("#triad-slider").inputValue();
  await page.keyboard.press("ArrowRight");
  expect(await page.locator("#triad-slider").inputValue()).not.toBe(before);
});
test("unreachable optional gateway leaves browser computation working and excludes tokens from links", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#gateway-url").fill("http://127.0.0.1:1");
  await page
    .locator("#gateway-token")
    .fill("synthetic-test-token-never-a-real-secret");
  await page.locator("#connect-gateway").click();
  await expect(page.locator("#gateway-result")).toContainText("unavailable");
  await page.locator("#run-browser").click();
  await expect(page.locator("#experiment-record")).toContainText(
    '"engine": "javascript"',
  );
  expect(page.url()).not.toContain("synthetic");
  await expect(page.locator("#ask-agent")).toBeDisabled();
});
test("capture real Triad desktop and Romanian phone views", async ({
  page,
}) => {
  await ready(page);
  await mkdir("assets", { recursive: true });
  await page.screenshot({ path: "assets/triad-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#triad-language").selectOption("ro");
  await page.locator('[data-topic="projection"]').click();
  await page.screenshot({ path: "assets/triad-phone.png", fullPage: true });
});
