# Shared experiments and optional Wolfram execution

Observed **2026-11-11**. The shared JavaScript adapter and experiments are implemented and tested. **Wolfram is unavailable within the bounded discovery described below.** No Wolfram version, kernel execution, cross-engine numerical agreement, `Manipulate` display, SVG or PNG export was measured on this host. The Wolfram files are independently runnable implementations awaiting a real runtime check; synthetic parser tests do not change that status.

## One research model

[`research-interface.js`](../WEB/qfp-lab/js/research-interface.js) adapts the existing [`research.json`](../WEB/qfp-lab/data/research.json); it does not store another curated claim registry. `makeResearchModel(atlasData)` returns a deeply frozen version `1.0` model with `metadata`, `branches`, `objects`, `relationships` and `sources`. All **34 IDs**, full records, source references and five epistemic axes survive unchanged. The axes remain `object_type`, `epistemic_status`, `domain`, `depends_on` and `validation`.

`getResearchObject(model, id)` returns the record or `null`. `validateResearchModel(model)` checks structure, finite JSON, dependency closure/cycles and the deterministic fingerprint, and labels its trust `STRUCTURAL_ONLY`. FNV-1a32 over stable UTF-8 JSON is a change indicator, **not a cryptographic signature**. A caller importing a model must use `validateResearchModel(imported, trustedModel)`, where `trustedModel` was built from the bundled source. That comparison checks the entire source payload and IDs; recomputing a fingerprint after changing a status does not bypass it. The adapter cannot establish scientific truth or authenticate arbitrary supplied source data.

[`research-experiments.js`](../WEB/qfp-lab/js/research-experiments.js) exports:

```js
listExperiments(model)
normalizeExperimentRequest(model, {claim_id, experiment_id, parameters})
runExperiment(model, {claim_id, experiment_id, parameters})
```

Descriptors associate four visualizable mathematical objects with executable formulas, parameter JSON Schemas, explicit dependencies and limitations. This association is separate from canonical records; philosophical objects do not acquire invented numerical experiments. Unsupported claim/experiment pairings are rejected. Omitted parameter keys get documented defaults; extra keys, strings, code-like input, nonfinite values and out-of-range values are rejected rather than clamped or coerced.

| Experiment | Exact claim | Parameters | Scope |
| --- | --- | --- | --- |
| `ball-projection` | `ATLAS-BALL-PROJECTION` | `s` from -1.2 to 1.2; default 0.45 | Full unit-disk projection versus height-dependent disk/point/empty slice |
| `integer-access` | `ATLAS-INTEGER-ACCESS` | Integer `n`, `center` in ±1,000,000; integer `width` 2–10; defaults 0, 0, 5 | State/transition independent from a finite viewing window |
| `log-scale` | `ATLAS-LOG-SCALE` | `q` in ±12, `l0` from 10^-9 to 10^9 metres; defaults -3 and 1 | Positive length, logarithmic coordinate and selected reciprocal reflection |
| `qfp-local` | `QFP-D005` | All 11 existing [`qfp-model.js`](../WEB/qfp-lab/js/qfp-model.js) defaults/bounds | Conditional local-center identities and finite truncated-polynomial warning |

Each run returns `schema_version`, `source_revision`, actual `engine`, normalized `input`, `process`, `output`, `validation` and `limitations`. Process metadata includes exact source assumptions/definitions, dependency IDs, units, numerical method, precision and solver/boundary limitations. Algebraic checks cover projection/slice radius and area, integer successor/window bounds, logarithmic recovery/reciprocity and the scalar residual after solving only `Phi2`. A false reference-curvature comparison is an observed mismatch with that chosen reference, not an application failure or falsification of QFP.

Most local algebraic comparisons use `abs(a-b) <= 10^-10 max(1,abs(a),abs(b))`, a mixed absolute/relative tolerance. The positive reciprocal product uses relative tolerance without the absolute floor. These are software comparison criteria, not measured physical error or convergence estimates. QFP parameters use the arbitrary reference mass described in the [mathematical review](../12_VALIDATION/Atlas_Mathematical_Review.md). The scalar closure does not solve the metric equations or prove global existence/stability. Zero/negative `Lambda` are labeled Minkowski/anti-de Sitter-type, respectively.

## Local Wolfram boundary

[`adapter.mjs`](../services/wolfram/adapter.mjs) exports `inspectWolframAvailability({executable})` and asynchronous `runWolframExperiment(model, request, {executable, timeoutMs})`. An explicit trusted operator path to `wolframscript` is required; standalone use also accepts the process-local `WOLFRAMSCRIPT_PATH` variable. A gateway can map its own operator-only `TRIAD_WOLFRAMSCRIPT` variable into `executable`. **Neither path nor arbitrary source code belongs in HTTP/MCP request arguments.** The executable's presence means `DETECTED_NOT_VERIFIED`, not a working/activated kernel. Missing configuration/access returns `UNAVAILABLE`, with `engine:null` and no numerical output.

When configured, the adapter uses a fixed local `.wls` path with `-local`, numeric JSON on standard input, no shell and no arbitrary evaluation command. Wolfram documents local file execution, `$ScriptInputString` and process timeouts in [WolframScript](https://reference.wolfram.com/language/ref/program/wolframscript.html.en). JSON strings are imported as data using [RawJSON](https://reference.wolfram.com/language/ref/format/RawJSON.html), never converted to Wolfram expressions.

JavaScript validates the input, and [`TriadModels.wl`](../services/wolfram/TriadModels.wl) independently repeats exact claim/experiment, key, finite numeric-domain and integer checks. The fixed runner has an eight-second computation limit; the adapter's wall-clock deadline defaults to ten seconds and is configurable only within 1–30 seconds. Combined stdout/stderr is bounded to 64 KiB. The adapter asks the OS to terminate only its newly created process group/tree on a deadline or output overflow; this cleanup path is implemented but untested with a real Wolfram process. No existing named kernel or service is stopped. Diagnostics are not forwarded to clients. Invalid JSON, mismatched source/input identity, malformed output shape or absent runtime evidence produces `FAILED`, not a substituted JavaScript result.

After a real successful run, the adapter records `$Version`/`$SystemID`, marks `engine:"wolfram"`, and compares the independent output against the shared JavaScript implementation. The cross-engine rule is relative-only: `abs(a-b) <= 10^-10 max(abs(a),abs(b))`; exact zero, strings and booleans compare exactly. This avoids hiding tiny positive length differences behind a large absolute floor, but cancellation near zero can produce a genuine reported disagreement. Such disagreement is retained. Agreement would be implementation agreement for these formulas, not empirical confirmation.

## Optional commands and graphics

With an existing, usable local Wolfram installation, explicitly select its actual absolute executable path in the current process and run:

```powershell
# Replace with the operator-verified existing installation; do not copy a guessed path.
$env:WOLFRAMSCRIPT_PATH = '<absolute path to existing wolframscript.exe>'
node services/wolfram/verify.mjs
```

`verify.mjs` attempts all four actual experiments only when configured. It reports `UNAVAILABLE` with nonzero exit status when unavailable; that is not a passing runtime test. No installation, account login, activation, cloud request or remote-kernel discovery is performed by this implementation.

The independent script can also consume a JSON object with `schema_version`, `source_revision`, `claim_id`, `experiment_id` and fully normalized `parameters` on standard input:

```powershell
# $numericRequest is the known numeric JSON request, not executable code.
$numericRequest | & $env:WOLFRAMSCRIPT_PATH -local -file services/wolfram/run-experiment.wls -timeout 10
```

In a Wolfram notebook front end, load `services/wolfram/TriadModels.wl` and evaluate `TriadManipulate[]` for the four explicitly labeled teaching/local views. [Manipulate](https://reference.wolfram.com/language/ref/Manipulate.html) creates interactive controls; this repository does not claim that these desktop controls render in the browser or run without a suitable frontend.

For static figures, explicitly supply an existing output parent:

```powershell
& $env:WOLFRAMSCRIPT_PATH -local -file services/wolfram/export-figures.wls '<existing output parent>'
```

The script creates a new UUID-named child directory and requests four SVG/PNG pairs. It reports successes/failures instead of silently claiming all exports worked. Wolfram documents [static SVG export](https://reference.wolfram.com/language/ref/format/SVG.html) and [PNG rendering/export](https://reference.wolfram.com/language/ref/format/PNG.html). Actual renderer/frontend availability and every generated graphic still need verification on a real installation. No generated Wolfram graphic is included in the current publication.

## Discovery and executed checks

The [machine-readable discovery record](../services/wolfram/discovery-2026-11-11.json) documents fresh PATH lookup, native/WOW6432Node/HKCU uninstall entries, known Program Files roots, bounded top-level ProgramData/AppData directory names, and the pre-existing workstation software/toolchain inventories. None matched Wolfram/Mathematica. This does **not** rule out unlisted portable copies, other users, custom paths or remote installations. No license files were inspected.

Executed under Node.js 26.12.0 on 2026-11-11:

```text
node --test WEB/qfp-lab/tests/triad-research-model.test.mjs WEB/qfp-lab/tests/triad-wolfram.test.mjs
```

Result: **16/16 tests passed**: 11 shared-model/experiment tests and five adapter/protocol/source-shape tests. The latter use explicitly synthetic parser fixtures or the unavailable path; they do not execute Wolfram. A fixture initially aliased its expected input, so its mutation test failed; the fixture was corrected to clone independently and the complete focused suite then passed. `node services/wolfram/verify.mjs` separately returned `UNAVAILABLE`; no runtime comparison or image export ran. Wider integration verification belongs in the parent Triad verification record.

All protected canonical equations and claim classifications remain unchanged. Primary Wolfram documentation above was inspected on 2026-11-11; documented product capabilities do not establish successful execution on this workstation.
