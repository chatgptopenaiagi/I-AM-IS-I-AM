# TRIAD MCP server and interactive app

Verified locally on 2026-11-11. This is a working local MCP implementation over the public research atlas. It is not a registered ChatGPT plugin, a public HTTPS service, or evidence that QFP is established physics.

## Components and source boundary

`services/mcp` is an isolated Node package. It pins the official `@modelcontextprotocol/sdk` **1.32.2**, `@modelcontextprotocol/ext-apps` **2.0.4**, Zod **4.6.7**, and esbuild **0.28.2** in its own package and lock file. Node 20 or newer is required. The root package is unchanged by MCP dependency installation.

The server loads only the fixed public `WEB/qfp-lab/data/research.json` through the shared [research interface](../WEB/qfp-lab/js/research-interface.js). All **34 stable object IDs** survive, including 13 canonical objects. Complete claim records retain object type, epistemic status, domain, explicit dependencies, validation, source attribution, units and the `SCHEMATIC` qualifier where present. The fingerprint identifies a payload revision; it is not a cryptographic signature.

The [shared experiment engine](../WEB/qfp-lab/js/research-experiments.js) supplies four exact claim/experiment bindings. Unknown pairs, unknown fields, nonnumeric values and values outside declared bounds are rejected; inputs are not silently clamped. No equation string is evaluated. The MCP tools do not read private archives, resolve caller-supplied paths, fetch URLs, execute shell commands, call AI providers, or write exports to disk.

## Tools

All eleven tools have input and output schemas and read-only annotations. Successful results use `{schema_version, source_revision, data}` in `structuredContent`, with a JSON text counterpart for clients without custom UI. Validation failure returns a tool error and no computation result. The MCP SDK validates inputs and outputs; the shared model additionally validates source structure.

| Tool | Input | Result |
|---|---|---|
| `research_list_concepts` | Optional `branch` | Public object summaries with separate classification axes |
| `research_get_claim` | `claim_id` | Full public record, sources and applicable experiments |
| `research_get_equations` | `claim_id` | Equations, definitions, assumptions and recorded units |
| `research_get_sources` | Optional `claim_id` | Public source metadata; no remote fetching |
| `research_get_dependencies` | `claim_id` | Transitive formal dependencies plus separately labelled immediate typed relationships |
| `research_get_validation` | `claim_id` | Recorded evidence/validation and limitations; no fresh test execution |
| `research_run_experiment` | `claim_id`, `experiment_id`, optional numeric `parameters` | Actual fixed JavaScript computation and reproducibility record |
| `research_compare_models` | Two to four distinct `claim_ids` | Side-by-side records; no inferred equivalence or automated scientific judgment |
| `research_export_experiment` | Same as run | Recomputed JSON record returned to the client; no server file write |
| `research_capabilities` | Empty object | Counts, branches, structural validation and complete experiment parameter schemas |
| `research_open_lab` | Optional `claim_id` | Interactive selection data and an MCP App resource |

`ball-projection` is bound to `ATLAS-BALL-PROJECTION`; `integer-access` to `ATLAS-INTEGER-ACCESS`; `log-scale` to `ATLAS-LOG-SCALE`; `qfp-local` to `QFP-D005`. The experiment descriptors are the authoritative parameter schema. Computed output does not change the source claim's status or imply empirical confirmation. Formal `depends_on` edges remain separate from analogy/continuity relationships.

## Local use

From the repository root, install/build only the isolated package:

```powershell
Set-Location services/mcp
npm ci --no-audit --no-fund
npm run build
npm test
```

An MCP host can launch `node <absolute-repository-path>/services/mcp/src/stdio.mjs`. This stdio transport needs no token or HTTP listener; the host owns its child process. Standard output contains protocol messages only. Startup errors use bounded generic standard-error messages. Do not register an `npx` command that downloads an unpinned package.

For a browser or HTTP MCP client, start the explicit loopback gateway:

```powershell
# Supply a locally chosen, secret 32–256 character printable token through
# the process environment. Do not commit it, place it in a URL, or log it.
$env:TRIAD_LOCAL_TOKEN = Read-Host 'Local gateway token' -MaskInput
$env:TRIAD_PORT = '4318'
node services/mcp/src/http.mjs
```

This second example is run from the repository root. The token is read into process memory and never returned by the server. Enter the same token in the browser's explicit connection form; the frontend must hold it only in memory. A local host can instead provide the environment without an interactive prompt. There is no `.env` auto-loader. Stop the foreground process with Ctrl+C.

The server binds **127.0.0.1 only**. HTTP requests require `Authorization: Bearer <token>`. Default exact allowed browser origins are `https://chatgptopenaiagi.github.io`, `http://127.0.0.1:4173` and `http://127.0.0.1:4174`. An operator may set a comma-separated `TRIAD_ALLOWED_ORIGINS` list of exact origins. Wildcards and URL paths are rejected. An unapproved `Origin`, including `null`, is rejected. Browser preflight is allowed only for an approved origin. Nonbrowser clients may omit Origin but still need authentication.

Host headers are limited to `127.0.0.1:<actual-port>` and `localhost:<actual-port>`. There is no proxy-header trust or nonloopback binding option. Requests have a 32 KiB body limit, strict endpoint schemas, no query parameters, header/request deadlines and at most four concurrent handlers. Only one provider explanation is allowed at a time. Errors do not disclose stack traces, credentials, provider stderr or private paths. Browser local-network policies can still require permission or block a Pages-to-loopback connection; no connection is attempted automatically.

## Local gateway contract

All routes require the same bearer token. `/mcp` is stateless Streamable HTTP with JSON responses; each POST receives a new SDK server/transport. GET/SSE and DELETE sessions are deliberately unsupported (405). This bounded read-only service does not need persistent server notifications.

| Route | Contract |
|---|---|
| `GET /api/capabilities` | Version/revision and separate `mcp`, `javascript`, `wolfram`, `microsoft` availability records |
| `POST /api/experiment` | `{claim_id, experiment_id, parameters?, engine:'javascript'\|'wolfram'}` |
| `POST /api/explain` | `{claim_id, question, language:'en'\|'ro'}`; question is at most 2,000 characters |
| `GET /api/microsoft/status` | Microsoft adapter/configuration metadata only |
| `POST /api/microsoft/explain` | Alias of `/api/explain` |

JavaScript results are the unchanged shared computation envelope. Wolfram is optional: only the fixed [Wolfram adapter](TRIAD-WOLFRAM.md) may launch a bounded local calculation, after shared input validation. `TRIAD_WOLFRAMSCRIPT` is an operator-only absolute executable path; when absent, the adapter's `WOLFRAMSCRIPT_PATH` environment fallback applies. No request may choose an executable, script, file or command. Missing runtime returns `UNAVAILABLE`, not simulated Wolfram output.

The [Microsoft bridge](TRIAD-MICROSOFT.md) uses only `services/microsoft/.venv/Scripts/python.exe` (POSIX: `.venv/bin/python`) and the fixed `worker.py`. Configuration status runs with an eight-second deadline and contacts no provider. An explicitly submitted explanation can invoke the provider with a 45-second outer deadline and a 256 KiB output cap. No shell is used. The gateway passes `approved:true` only for this authenticated explanation action, filters returned fields, and discards stderr. Provider secrets remain in the local process environment, never browser configuration.

For the frontend, `AVAILABLE` plus `provider_status:CONFIGURED_UNTESTED` means the adapter is ready to attempt a request; `model_verified:false` remains explicit. Only a real provider `AI_RESPONSE` maps to an `AVAILABLE` explanation, retaining `provider_status:AI_RESPONSE` and `verification:UNVERIFIED_AI_OUTPUT`. Missing configuration stays `NOT CONFIGURED`; provider failure has no substitute answer. Generated wording is not a proof, derivation or executed computation. The worker preserves source IDs/revision and labels its result. See the Microsoft service documentation for its separate configuration and optional provider requirements.

## MCP App behavior

`research_open_lab` uses standard `_meta.ui.resourceUri` pointing to `ui://triad/research-lab/v1.html`. `registerAppResource` serves `text/html;profile=mcp-app`. The HTML bundles its assets; resource metadata declares empty network/resource domain lists. No provider secrets, private source data or backend bearer token are sent into the iframe.

The official `App` class performs the standard `ui/initialize` handshake, receives the tool result, calls data tools when the user selects or runs an experiment, and sends selected claim context through `ui/update-model-context`. It does not depend on legacy `window.openai`. All source text is rendered with `textContent`; caller text is not inserted as HTML. Unsupported objects display no experiment. The source assumptions, units, limitations and IDs remain inspectable. The UI has labelled inputs, visible focus and live status output.

An Apps-compatible host is required to display the resource; ordinary MCP clients can use every data tool headlessly. The included browser test host is only a validation fixture, not a production host or deployment endpoint.

## Verification and limits

The package tests use the **actual official SDK Client**, both `StdioClientTransport` and `StreamableHTTPClientTransport`, against actual local servers. They cover initialization, all eleven tools, preserved source fields and IDs, strict rejected inputs, real experiment results, resource MIME/UI metadata, and gateway authentication/origin/Host/body boundaries. All three integration suites passed on 2026-11-11. A separate fallback unit test checks that an unavailable Wolfram adapter preserves experiment identity while claiming no engine execution or output.

`npm run test:browser` also passed using installed Chrome, the official `AppBridge`/`PostMessageTransport`, and the real SDK client. It rendered all 34 options, ran a numerical experiment, disabled unsupported calculations, and transmitted selected context. This optional browser test reuses the repository's existing Playwright development dependency; on other systems install the root development dependencies and an appropriate browser separately. No browser is downloaded by this MCP package. Test servers/clients/browser instances are closed by their test cleanup.

These tests do not certify scientific truth, prove production security, exercise a real ChatGPT registration, verify a remote TLS deployment, or establish Wolfram/provider availability. No ChatGPT account or MCP configuration was modified. MCP annotations inform hosts but do not replace access control.

## Remote ChatGPT deployment

Loopback is not reachable by ChatGPT's hosted connector. A deployment must provide a reachable **HTTPS** MCP endpoint and suitable authentication/authorization, a deployment-specific host/origin policy and production operational limits. This implementation's local bearer gate is not an OAuth authorization server. Do not bypass the loopback guards or blindly tunnel the gateway: provider-explanation endpoints carry different responsibilities from public read-only atlas tools. A remote adapter must preserve those boundaries.

After a separately reviewed deployment, register/install the custom MCP server in an eligible ChatGPT workspace/account and verify resource rendering there. Registration, plan/workspace availability, HTTPS hosting and authentication configuration are separate steps; none has been performed here. Public static GitHub Pages does not run this Node service.

Primary documentation inspected on 2026-11-11: [OpenAI MCP server guide](https://developers.openai.com/plugins/build/mcp-server), [OpenAI standards-first chat UI guide](https://developers.openai.com/plugins/build/chatgpt-ui), [MCP Apps implementation guide](https://modelcontextprotocol.io/extensions/apps/build), and [MCP transport specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports). Package versions were checked against the package registry and the installed isolated lock file. The implementation uses these documented SDK/tool/resource/transport mechanisms; it makes no claim of OpenAI or MCP certification.
