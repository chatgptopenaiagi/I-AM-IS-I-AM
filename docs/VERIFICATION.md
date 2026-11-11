# Atlas verification record

**Date:** 2026-11-11. **Scope:** local integrated research-atlas build, data invariants, mathematical/software checks, browser behavior, synthetic archive import and the specifically identified live deployment below. This record describes executed checks; it does not certify physical truth or historical completeness.

## Environment and reproducibility

The local run used Windows, Node.js **26.12.0**, Playwright **1.65.0**, the installed Chrome channel for browser tests, and locally bundled Three.js **0.160.0**. The scientific Python suite used Python **3.14.7** and SymPy **1.14.0**. The final integrated archive suite used Python **3.14.0**; the initial importer development checks also ran under Python 3.14.7. The importer itself uses only the Python standard library.

JavaScript dependencies are pinned in `package-lock.json`. `npm ci` restores that lockfile. The commands below assume the appropriate existing Python interpreter is selected; the `python` command on a different machine may resolve to another environment.

| Executed check | Command | Observed result |
| --- | --- | --- |
| JavaScript mathematics and state tests | `npm test` | 12 original math groups, 6 supplemental review groups and 6 new named atlas tests passed |
| Scientific/data Python suite | `python -B -m unittest discover -s SOFTWARE/tests -v` | **39/39 passed:** 14 existing dependency-audit tests, 17 atlas-data validation tests, 8 supplemental symbolic tests |
| Private importer suite | `python -B -m unittest discover -s archive_tools/tests -v` | **19/19 passed**, synthetic inputs only, importer v1.0.1 |
| Public data integrity | `python -B SOFTWARE/validate_atlas_data.py` | **34 claims, 13 canonical records, 20 sources; zero issues** |
| Public artifact build | `npm run build` | **17 allowlisted source assets**, plus `.nojekyll` and a historical-route compatibility page; dataset includes 34 claims |
| Integrated browser suite | `npm run test:browser` | **16/16 passed**, zero skipped, unexpected or flaky tests in the completed report |

The Node TAP output includes container-level results; its eight top-level containers must not be reported as “eight mathematical tests.” The grouped counts above describe the actual suites without conflating their reporting conventions. Likewise, the data validator is one executed validation command, separate from its 17 mutation/validation tests.

The [mathematical review](../12_VALIDATION/Atlas_Mathematical_Review.md) records the separate coordinate-curvature script, scalar variation, center checks, conventions and symbolic method. Its results are not added again to the suite totals above.

## Browser and visual checks

The Playwright configuration starts a loopback server using `ATLAS_ROOT=dist`, `PORT=4174` and the actual project mount **`/I-AM-IS-I-AM/`**. This exercises the built bundle, not only an unmounted source page. The ordinary `npm run serve` command uses source preview at port 4173 unless `ATLAS_ROOT` is set explicitly.

The completed browser checks cover:

- Loading the project base path, local essential assets and QFP numerical readouts without page errors.
- Preview-server handling of a missing index file, covered by the added regression test.
- QFP reference presets, scalar-center closure, interval/zero-crossing warnings and mode switching.
- Projection/slice boundaries, independent access state/view controls, and the logarithmic scale/reflection identity.
- Explore/Understand/Examine navigation, source/claim inspection and dependency review.
- English/Romanian interaction, 1440-pixel desktop and 390-pixel phone layouts, keyboard use and reduced-motion configuration.
- JSON experiment export/import, bounded/known-field state restoration, malformed experiment hashes, and preserving the current experiment when using the skip link.
- Tiny nonzero residuals remaining distinguishable from exact zero.
- The SVG/text calculation path and a forced WebGL-failure fallback. This is not a certification of every GPU, driver or browser's optional 3D behavior.
- Share-link payloads excluding unrelated query parameters. **The Clipboard API is mocked for this assertion:** the URL payload is verified, but native OS clipboard access/permissions are not tested end to end.

Actual generated screenshots were visually inspected at desktop and phone sizes:

- [`assets/atlas-desktop.png`](../assets/atlas-desktop.png)
- [`assets/atlas-phone.png`](../assets/atlas-phone.png)

Read-only frontend review identified state reset through a generic anchor hash, stale claim-dialog scroll/focus, near-zero formatting that could display a nonzero residual as exact zero, and query-string inclusion in shared links. The implementation was corrected and the relevant browser regressions were added. The UI also explains that its finite access-state control bounds do not restrict the mathematical integer model.

An initial browser run had one assertion expecting “Invalid” on a route that correctly displayed “Malformed.” The test was corrected to distinguish initial-load and later-hash error paths, and the full suite passed afterward. No failing check was ignored or reclassified as a pass.

Local detailed reports are written under `test-results/`, including `browser-results.json` and `.last-run.json`; these generated reports are not public corpus sources or evidence of scientific validity.

After an earlier complete 15-test run, the claim dialog gained explicit physical-validation and units metadata plus source links. **Three targeted browser rechecks passed** after that presentation change, and the desktop/phone screenshots were regenerated. The subsequent **final full browser run passed 16/16**, including the added preview-server missing-index regression. The targeted rechecks are not additional unique tests to add to that final count.

## Archive preservation and privacy checks

The importer tests create temporary synthetic exports outside the repository. They verify exact original bytes and SHA-256, recognized list/object/wrapper/flat forms, complete graph branches, ancestry following changed parent links, cycles including inactive branches, reciprocal-link gaps, duplicate/conflicting versions and source provenance. They also exercise actual timestamp/offset handling, unknown metadata, calendar-year boundaries, attachment references/missing files, duplicate ZIP member names, traversal/symlink rejection, byte/count/depth limits, unsupported/malformed JSON, duplicate object keys, output boundaries and non-overwriting runs.

The independent review added explicit gap reporting for graph anomalies and ambiguous wrappers, copy-time total-source limits, and distinct missing-author-field versus missing-declared-name counters. It did not infer an author, language, model or timezone from content.

**No real original ChatGPT export was available or imported.** The two-/three-year view implementation is tested on synthetic dates; the owner's actual two-/three-year message coverage remains unestablished. Missing original messages, model metadata and attachments cannot be recovered by a parser alone. See the [corpus coverage record](../10_REFERENCES/Corpus_Coverage.md).

Separately, an external private `source-index.json` records SHA-256 for six saved extraction/metadata JSON files. These hashes attest the stored extraction bytes, not original cloud-document bytes, complete page fidelity or original transcripts. This source index is not part of the Git or website artifact and is not evidence of recovered conversation coverage.

Private importer output is refused inside this repository or any `WEB` directory. Its exact source copies can contain sensitive data; they are not encrypted and inherit Windows permissions from the chosen parent. No source export is shipped in the website. The public build copies an explicit allowlist and refuses unexpected existing build files/directories and symlinks rather than silently publishing them.

## Verified live deployment

The [public atlas](https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/) returned **HTTP 200** at **2026-11-11T13:32:43.350Z**. This observation is tied to merge commit [`13b187732c68a5bea0e52ebfaac2ba86cfb29777`](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/commit/13b187732c68a5bea0e52ebfaac2ba86cfb29777), not to any later documentation commit.

[PR #1](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/pull/1) merged normally after [PR validation run 43029400956](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43029400956) passed. The subsequent [main workflow run 43029614365](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43029614365) completed both validation and deployment successfully. An earlier [manual branch run 43028978675](https://github.com/chatgptopenaiagi/I-AM-IS-I-AM/actions/runs/43028978675) passed validation but was rejected at deployment by the environment's main-only policy. That protection was preserved; the normal main-branch merge provided the authorized publication path.

Chrome smoke checks against the live site verified the de Sitter reference PASS state, the point slice at the boundary, independence of the access window from the model state, scale reflection and the `SCHEMA` classification of `QFP-S001`. All three routes were checked at 390 pixels in Romanian without horizontal overflow. The [retained geometry laboratory](https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/geometry.html) and [historical compatibility route](https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/WEB/qfp-lab/index.html) also returned HTTP 200. The observed live run recorded **zero page errors and zero failed asset responses**. Live desktop and phone screenshots were visually inspected.

The raw served bytes for `index.html`, `js/atlas.js`, `data/research.json` and `vendor/three/three.module.js` had SHA-256 values matching their committed Git blobs at the identified merge commit. This checks four specific deployed assets; it is not a claim that every public resource was exhaustively hashed. The local detailed evidence is `test-results/live-verification.json`; the [public sanitized deployment record](../12_VALIDATION/atlas-deployment-2026-11-11.json) records the successful reproducible repeat at **2026-11-11T13:34:30.797Z**, with the same source revision and asset hashes.

The reproducible live checker compares against committed Git bytes rather than platform-dependent working-tree line endings:

```sh
node SOFTWARE/verify-published-atlas.mjs https://chatgptopenaiagi.github.io/I-AM-IS-I-AM/ 13b187732c68a5bea0e52ebfaac2ba86cfb29777
```

The checker and this documentation are later verification additions. Their existence does not claim that they were included in the tested merge deployment; the published application source files remain the comparison target.

Two verification-harness issues were resolved before the successful observation. The first live smoke assertion waited for a claim counter to become visible while its route was hidden; the check was corrected to account for route visibility. An initial raw hash comparison used Windows working-tree bytes with CRLF line endings against deployed Git/LF bytes; it was replaced with a comparison against the exact committed Git-blob bytes. Neither mismatch demonstrated an application failure, and neither was treated as a passed check without correction.

## What these results do not establish

- They do not establish empirical support for QFP, a physical projection mechanism, global regularity, existence/uniqueness of a full solution, perturbative stability or agreement with observations.
- They do not establish original conversation dates, participants, generating models, intellectual priority or complete research-history coverage for missing originals.
- They do not independently verify every external source URL, browser/assistive-technology combination, hardware renderer or export schema.
- Local tests alone do not establish public Pages availability. The live observation above separately establishes availability and the stated behavior for the identified merge deployment at its observation time; it does not establish uninterrupted future availability or deployment of later changes.

The initial repository investigation found failed `ConfigurePages` runs and a Pages API 404. The subsequent successful main deployment and live checks are recorded above without erasing that earlier history. Repository/environment protections remained in place. Any later revision requires its own deployment observation before being described as live.
