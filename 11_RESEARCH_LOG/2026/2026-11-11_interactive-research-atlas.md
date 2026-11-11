# Interactive research atlas and private archive workflow

- **Date:** 2026-11-11.
- **Question:** How can the research program be explored interactively while preserving its mathematical conditions, source history, uncertainty and private archive boundary?
- **Previous formulation:** The repository already contained the QFP Epistemic Protocol v2, a selective canonical registry, dependency auditing, scalar/local-center derivations and a static geometry laboratory. Historical sources and philosophical branches were not organized into the current interactive atlas.
- **Proposed formulation:** Add an atlas with Explore, Understand and Examine entry points; separate canonical records from historical/editorial curation; retain the geometry laboratory; provide explicit source/coverage and mathematical-review records; and support future private ChatGPT imports outside the public repository.
- **Reason for change:** Make assumptions, relationships, derivations and unanswered questions inspectable without merging scientific, historical and illustrative evidence into a single asserted theory.

## Scope and provenance

The mission begins from freshly cloned commit `6fa0f1f` on branch `codex/interactive-research-atlas`. Protocol v2 and its canonical classifications predate this work. The protected action, independent `F(Phi)`/`H(Phi)` assumption, metric, center ansatz, registered identities and status-promotion history are retained.

The [research overview](../../01_THEORY/Research_Atlas.md) connects Being/I-AM, continuum/projection, access, QFP gravitation and micro/macro exploration with explicit boundaries. Its public display records adapt canonical entries and keep historical/editorial identifiers separate. Graph edge kinds distinguish registered dependencies from interpretive links and open research questions.

The [source register](../../10_REFERENCES/Atlas_Sources.md) and [coverage report](../../10_REFERENCES/Corpus_Coverage.md) record the inspected saved-document candidates and owner-reported historical leads. No complete original ChatGPT export or independently timestamped original message corpus was recovered in the documented search. File creation dates are not substituted for conversation dates. The original named preview/importer and an alternate historical checkout were not found within bounded coverage; no universal absence claim is made.

An external private source index now records SHA-256 for six extraction/metadata JSON files. These checksums identify stored extraction bytes, not original cloud documents or complete conversation transcripts. The private index does not increase the established message-history coverage and is excluded from Git/public assets.

The [mathematical review](../../12_VALIDATION/Atlas_Mathematical_Review.md) records scalar variation, local center algebra, units and interpretation limits. The [metric bulk-variation draft](../../12_VALIDATION/Atlas_Metric_Bulk_Variation_Draft.md) remains a separate review artifact. Neither a UI visual nor the existence of this draft silently promotes a claim in the canonical registry.

## Software and privacy

The browser atlas supplies the three reading modes and four interactive modules: canonical QFP/local-center, projection, access and scale exploration. The previous geometry laboratory is retained in `WEB/qfp-lab/geometry.html`. Browser state and visuals must keep their declared model/domain boundaries and must not imply a demonstrated physical projection, global gravitational solution or experimentally established emergent mechanism.

The new [`archive_tools/`](../../archive_tools/README.md) importer accepts explicit local JSON/ZIP files. Exact source bytes, provenance hashes, complete message graphs, alternative branches, IDs, roles, raw content, timestamps, metadata and attachment references are preserved. Repeated and differing versions remain separate occurrences. Current ancestry follows exported parent links; it is not guessed from array order or recency. Unknown model, author, language and timezone metadata remain unknown.

Private output is required outside the repository and any `WEB` directory. Two-/three-year date views and keyword candidate indexes do not filter or discard the full corpus. ZIP path, byte/count/ratio and JSON-depth limits are explicit, and incomplete runs cannot claim complete import. The implementation does not make network requests or publish transcripts. Synthetic fixtures contain no real conversations.

## Validation record

The [integrated verification record](../../docs/VERIFICATION.md) separates local build, browser inspection, package tests, importer tests, scientific checks and deployment observations. JavaScript validation passed the 12 original mathematical groups, 6 supplemental review groups and 6 new named atlas tests. The scientific/data Python suite passed **39/39** tests: 14 existing dependency-audit tests, 17 atlas-data validation tests and 8 symbolic tests. The final full integrated browser suite passed **16/16** tests on the built bundle under the project base path, including the added preview-server missing-index regression. No skipped, unexpected or flaky browser tests remain in that completed report. An earlier 15-test browser run and three targeted rechecks after the claim-dialog metadata/source-link presentation update preceded the final full run; these are not additional unique tests. The public build contains **17 allowlisted source assets**, plus `.nojekyll` and a historical-route compatibility page. Actual desktop/phone screenshots were regenerated and inspected.

The independently reviewed private importer, version **1.0.1**, passed **19/19 synthetic tests** in the final integrated run under Python 3.14.0 (initial development checks also ran under Python 3.14.7):

```text
python -B -m unittest discover -s archive_tools/tests -v
```

The review added checks for parent cycles outside the current ancestry, missing reciprocal graph links, ambiguous top-level wrappers and a source file growing beyond the total byte budget during copying. Graph problems now produce an explicit reported-gap completion state. Metadata coverage distinguishes a missing author field from a missing declared author name, and counts absent current-node information. No real export has been imported, and synthetic fixtures cannot establish compatibility with every historical/future export shape or the owner's missing complete archive.

The independent atlas-data validator reported **34 claims, 13 canonical records and 20 sources, with zero issues**. Its mutation/validation suite passed **17/17 tests**:

```text
python -B SOFTWARE/validate_atlas_data.py
python -B SOFTWARE/tests/test_atlas_data_validation.py
```

These results validate software/data invariants and preserved canonical mappings; they do not validate historical authenticity, physical truth or the completeness of missing source material.

## Publication and live verification

[PR #1](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/pull/1) merged normally as [`13b187732c68a5bea0e52ebfaac2ba86cfb29777`](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/commit/13b187732c68a5bea0e52ebfaac2ba86cfb29777) after [PR run 43029400956](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43029400956) passed. [Main run 43029614365](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43029614365) subsequently succeeded in both validation and deployment. Earlier manual branch run `43028978675` had passed validation but its deployment was rejected by the main-only environment policy. The protections were preserved and publication proceeded through the normal main merge.

The [public atlas](https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/) was observed at **2026-11-11T13:32:43.350Z** with **HTTP 200**. Live Chrome checks verified the de Sitter reference PASS state, boundary-point slice, access-window independence, scale reflection and `QFP-S001` as `SCHEMA`. All three routes were checked in Romanian at 390 pixels without horizontal overflow. The retained geometry and compatibility routes returned HTTP 200; the live run reported zero page errors and zero failed asset responses. Live desktop/phone screenshots were visually inspected.

SHA-256 comparisons of four served assets—`index.html`, `atlas.js`, `research.json` and `three.module.js`—matched the exact committed Git-blob bytes at the merge commit. Detailed local evidence is recorded in `test-results/live-verification.json`; the [public sanitized deployment record](../../12_VALIDATION/atlas-deployment-2026-11-11.json) captures the latest repeat observation and hashes. The reproducible command is `node SOFTWARE/verify-published-atlas.mjs https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/ 13b187732c68a5bea0e52ebfaac2ba86cfb29777`, with scope described in the [verification record](../../docs/VERIFICATION.md). An initial smoke assertion waiting for a hidden-route counter to be visible and a Windows-CRLF-versus-Git-LF hash comparison were corrected as verification-harness issues, not classified as application failures or silently counted as successful checks.

The reproducible live checker passed again at **2026-11-11T13:34:30.797Z**, recorded in the public sanitized JSON with source revision `13b187732c68a5bea0e52ebfaac2ba86cfb29777`. These live results apply to that identified merge deployment at the observed times. They do not claim that a later verification-tool/documentation commit or future revision has already deployed.

## Consequences and unresolved issues

- Readers can inspect public source summaries and model boundaries while raw private archives remain outside the site and Git.
- The new navigation and curation do not establish philosophical propositions, historical priority, empirical support or a physical mechanism.
- Complete original conversation exports, the missing PDF and reported historical leads still require original-source recovery before transcript-level claims can be made.
- Historical topology/curvature/uniqueness assertions retain their original context and explicit review concerns; they do not become canonical results through visualization.
- The metric draft still requires independent review at the stated level. Full metric reduction, boundary conditions, global existence/uniqueness, convergence radius, stability and observational discrimination remain separate research tasks.
- Initial Pages investigation found failed `ConfigurePages` runs and a Pages API 404; the later successful main deployment and live verification are recorded above. Local tests alone do not establish public availability, and any future revision still needs its own deployment/asset observation.
