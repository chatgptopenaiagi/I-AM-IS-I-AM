# Triad verification and publication record

CI setup note: the first [PR run](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43036487158) was cancelled after over seven minutes of setup. Its log shows repeated Ubuntu archive timeouts while installing optional browser fonts, before any tests. The workflow now pins `ubuntu-24.04`, uses its preinstalled Chrome through `ATLAS_BROWSER_CHANNEL=chrome`, and bounds setup steps to five minutes and validation to fifteen. The [official runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md) documents the installed browser. The replacement [PR validation](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43037962100) passed in 1m28s, including the unchanged acceptance tests.

**Date:** 2026-11-11. **Scope:** Triad Research Engine implementation and publication, based on repository commit `8c9308c`, delivered through [PR #3](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/pull/3). Its merge commit is `5c89e71151d31c65bd2e5cdc78554327dff5dc1e`. Local validation, hosted Linux CI, Pages deployment, and read-only live verification completed separately as recorded below.

The previous atlas's [verification record](VERIFICATION.md) remains historical evidence for that implementation. Its passing counts are not automatically evidence for newly added Triad behavior. Tests being present in the worktree also do not establish that they ran.

## Executed results

| Check | Observed result and scope |
| --- | --- |
| Root JavaScript suite: `npm test` | **35/35 reported named tests/containers passed.** Two legacy containers contain 12 original and six supplemental mathematical groups; those nested groups must not be added as additional top-level tests. This run includes the focused Triad tests below. |
| Shared research model and experiment suite | **11/11 passed** under Node.js 26.12.0. Preserves 34 complete records/five axes, deterministic revision, trusted-source comparison, four exact experiment bindings, numeric rejection, limiting cases and provenance. |
| Wolfram adapter/protocol suite | **5/5 passed** under Node.js 26.12.0. Tests synthetic parser fixtures, unavailable/configuration paths, output identity/shape and numerical comparison behavior. **No Wolfram runtime was executed.** |
| Combined focused model/Wolfram run | **16/16 passed**, zero skipped. These are the same tests as the two rows above and are also covered by the final root suite, not additional tests to sum. |
| Scientific/data Python suite | **39/39 passed:** 14 dependency-audit tests, 17 atlas-data validation tests and eight supplemental symbolic tests. |
| Private archive importer suite | **19/19 passed**, synthetic inputs only; no real conversation export was imported. |
| Public data and canonical dependency audit | Validator: **34 claims, 13 canonical records, 20 sources, zero issues**. Dependency audit: **13 canonical objects, acyclic**. Neither check certifies empirical truth or source authenticity. |
| Public build: `npm run build` | **25 allowlisted source assets**, plus `.nojekyll` and the historical-route compatibility page. The service runtimes and private data are excluded from the static artifact. |
| Optional Wolfram verifier | Returned **UNAVAILABLE**, with nonzero status because no explicit local executable was configured. This is a limitation result, not a passing runtime test. |
| MCP integration package | **4/4 tests passed: 3 integration suites plus 1 fallback unit test**, including the final root rerun. Integration uses actual official SDK stdio and Streamable HTTP clients, all eleven tools, actual JavaScript experiments, UI-resource metadata and loopback boundary checks. The missing-Wolfram-adapter test verifies an honest unavailable envelope. |
| MCP App browser test | **1/1 passed** with actual Chrome, official AppBridge/PostMessageTransport and real SDK HTTP client; 34 selections, actual ball calculation, unsupported-object handling and context sharing. Reran successfully after the final owned changes. This is distinct from the root browser suite. |
| Microsoft worker offline suite | **17/17 passed** after the editorial/original-wording correction and its English/Romanian regression; `pip check` found no broken requirements. Actual SDK construction and a labelled synthetic model/tool loop ran with provider sockets forbidden. No live inference was performed. |
| Final built browser suite: `npm run test:browser` | **26/26 passed:** 16 atlas tests, nine Triad tests and one actual frontend/gateway test. Final report: zero skipped, unexpected, flaky or top-level errors. The full suite ran after the mobile-overflow correction against `ATLAS_ROOT=dist`. |
| Hosted Linux CI and Pages | PR validation passed; the [main-branch workflow](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43038284145) then passed validation and deployment for merge commit `5c89e71`. |
| Live static Triad and original atlas | **PASSED** at 2026-11-11 14:27:23–24 UTC. Both returned HTTP 200; tested interactions and published asset hashes matched the exact merge commit. See the [machine-readable observations](triad-publication.json). |
| Live provider, real Wolfram, remote MCP/ChatGPT registration | **NOT PERFORMED / NOT VERIFIED**. No generated answer, Wolfram image or live provider availability is claimed. |

The focused command was:

```text
node --test WEB/qfp-lab/tests/triad-research-model.test.mjs WEB/qfp-lab/tests/triad-wolfram.test.mjs
```

The initial synthetic parser test failed because its fixture and expected input shared an object reference. The fixture was corrected to clone independently; the complete 16-test focused run then passed. This was a test-fixture issue, not a real Wolfram failure hidden by substitution.

The final scientific/archive commands used the existing Python 3.14.7 interpreter at `C:\AI\pytorch-cu132\Scripts\python.exe`, with SymPy 1.14.0 for symbolic checks:

```powershell
& 'C:\AI\pytorch-cu132\Scripts\python.exe' -m unittest discover -s SOFTWARE/tests -v
& 'C:\AI\pytorch-cu132\Scripts\python.exe' -m unittest discover -s archive_tools/tests -v
& 'C:\AI\pytorch-cu132\Scripts\python.exe' SOFTWARE/validate_atlas_data.py
& 'C:\AI\pytorch-cu132\Scripts\python.exe' SOFTWARE/qfp_dependency_audit.py
npm test
npm run build
npm run test:browser
npm --prefix services/mcp test
npm --prefix services/mcp run test:browser
& services/microsoft/.venv/Scripts/python.exe -B -m unittest discover -s services/microsoft -p test_worker.py -q
& services/microsoft/.venv/Scripts/python.exe -m pip check
```

MCP and Microsoft exact package versions and test mechanisms are recorded in [TRIAD-MCP.md](TRIAD-MCP.md) and [TRIAD-MICROSOFT.md](TRIAD-MICROSOFT.md). Integration-suite counts describe distinct suites, not the number of assertions inside them. No combined “total tests” is reported across heterogeneous frameworks. The same workflow steps also passed on the pinned Ubuntu runner with installed Google Chrome 156.0.8078.79; the hosted browser log records all 26 passing tests.

The intermediate root browser run passed 25/26 with one mobile-overflow failure. The layout was corrected, the complete built suite then passed 26/26, and fresh desktop/mobile screenshots were visually inspected. The final local JSON report in `test-results/browser-results.json` records start time `2026-11-11T14:08:27.894Z`, 26 expected passes, zero skipped/unexpected/flaky tests and zero top-level errors. The report is a generated local test artifact, not a public research source.

## Runtime and availability evidence

| Component | Evidence-backed state |
| --- | --- |
| Browser/shared JavaScript | Node.js 26.12.0 exercised the shared deterministic calculation modules. Root browser testing used Playwright 1.65.0 and installed Chrome on Windows at `http://127.0.0.1:4174/I-AM-IS-I-AM/`, including `triad.html`, on the built artifact. |
| Public data | 34 research records, 13 canonical objects, 20 source descriptors; adapted from the existing public file. Five axes and full claim records retained. The observed shared fingerprint is `atlas-fnv1a32:c162a484`. |
| MCP | Isolated pinned official SDK 1.32.2, MCP Apps 2.0.4, Zod 4.6.7 and esbuild 0.28.2. Real local protocol and App-host checks ran; no production ChatGPT host registration was tested. |
| Microsoft SDK | The actual `services/microsoft/.venv/Scripts/python.exe --version` reports **Python 3.14.7**, with `sys.base_prefix=C:\Python314`. This is distinct from the existing `C:\AI\pytorch-cu132` scientific interpreter. Agent Framework core 1.25.0, Foundry 1.16.1, Ollama 1.0.0b261106 and azure-identity 1.27.0 are installed in the isolated environment. Package construction/offline execution is distinct from provider inference. |
| Microsoft provider | **NOT CONFIGURED** in the checked environment. No live Foundry/Ollama request, Azure token acquisition, model download or existing inference-server start occurred. |
| Wolfram | **UNAVAILABLE within bounded discovery**. No command, uninstall entry, named installation directory or matching prior-inventory entry found. No version, activation, kernel result or renderer capability verified. |

The [Wolfram discovery JSON](../services/wolfram/discovery-2026-11-11.json) records the specific searches and their limits. The [Microsoft discovery JSON](../services/microsoft/discovery.json) records package/runtime observations and credential-presence booleans only. Neither is a workstation-wide proof of absence. No licensing audit was run.

## Mathematical and provenance boundaries checked

The executed JavaScript checks retain the existing protected QFP equations and independent `F`/`H` assumptions. Positive, zero and negative `Lambda` reference cases have their appropriate labels. Scalar closure is not represented as a solution of the metric equations. Projection and slice, integer transition and viewing window, and logarithmic scale and physical micro/macro claims remain distinct.

The shared record has actual normalized inputs, source revision, numerical method/precision, assumptions, definitions, units, output and limitations. Its numerical comparisons have explicit scope/tolerances, as documented in [TRIAD-WOLFRAM.md](TRIAD-WOLFRAM.md). The Wolfram source is an independent implementation awaiting real execution, not evidence of agreement. Synthetic comparison/parser data is labelled as such.

The current browser import recomputes and compares exact JSON values across the result fields. This detects changed evidence but may reject harmless final-bit floating-point differences between runtimes. Rejection is not a physical or mathematical falsification. Cryptographic provenance is not inferred from the noncryptographic adapter fingerprint; trusted import requires comparison against the bundled model.

## Review corrections and remaining external verification

Read-only source review led to the following corrections before the final passing built-browser run:

- Configured-but-untested Microsoft state is retained in the visible provider badge; a detected-but-unverified Wolfram path permits an explicit first request without claiming prior success.
- Editorial/paraphrased records are distinguished from recovered original wording, and canonical mathematical objects without a numerical binding use neutral “no attached executable experiment” wording.
- The truncated-`N(r)` zero-crossing warning is surfaced near the QFP readouts, retaining the local-validity and no-proven-horizon limitations.
- Actual frontend/gateway interaction, mobile/desktop behavior, keyboard operation, source/context behavior and unavailable-provider paths are covered by the completed browser suite. Optional live providers and Wolfram were not substituted with claimed successes.

A production MCP host registration, real Wolfram execution and live provider inference remain unverified. The implemented but unexecuted Wolfram scripts and explicitly synthetic Microsoft/parser test data do not fill those gaps.

Local processes used by tests have test-owned cleanup. The browser and gateway boundary checks do not establish production security, all browser local-network policies, provider permissions, result quality or remote service deployment readiness.

## Published interface verification

The live [Triad Lab](https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/triad.html) was checked in Chrome against ten committed public asset hashes. The check exercised all six synchronized topic routes, the de Sitter comparison, point slice boundary, non-executable `SCHEMA`, Romanian phone layout and absence of automatic optional-service requests. The original atlas was independently rechecked with four asset hashes, all four mathematical demonstrations, claim inspection, Romanian navigation and compatibility routes. Both runs recorded zero page errors and failed HTTP responses. The repeated research JSON hash is counted in each report, not as two distinct source files.

Actual reproduction commands:

```text
node SOFTWARE/verify-published-triad.mjs https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/ 5c89e71151d31c65bd2e5cdc78554327dff5dc1e
node SOFTWARE/verify-published-atlas.mjs https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/ 5c89e71151d31c65bd2e5cdc78554327dff5dc1e
```

The committed JSON contains only public URLs, asset digests, timestamps and test outcomes. Live screenshots were visually inspected and remain generated local verification artifacts. No private corpus or credential is part of this record. A functioning static deployment does not establish a remote AI service or scientific truth.
