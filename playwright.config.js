import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./WEB/qfp-lab/tests/browser",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4174/I-AM-IS-I-AM/",
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.ATLAS_BROWSER_CHANNEL
      ? { channel: process.env.ATLAS_BROWSER_CHANNEL }
      : process.platform === "win32"
        ? { channel: "chrome" }
        : {},
  },
  webServer: {
    command: "node SOFTWARE/serve-atlas.mjs",
    url: "http://127.0.0.1:4174/I-AM-IS-I-AM/",
    reuseExistingServer: false,
    env: { PORT: "4174", ATLAS_ROOT: "dist" },
    timeout: 15000,
  },
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/browser-results.json" }],
  ],
});
