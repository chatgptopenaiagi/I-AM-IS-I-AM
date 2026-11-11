# Repository inventory and investigation boundary

Observed on **2026-11-11** for the interactive research-atlas work. This is a bounded repository/workflow inventory, not a claim to have located every copy or historical artifact on the workstation.

## Baseline

The mission checkout was freshly cloned at `6fa0f1f` (`Add QFP Epistemic Protocol v2 and dependency auditing`) and the work takes place on `codex/interactive-research-atlas`. The existing history also contains the geometry-laboratory milestone `6c5f397` and local-center status promotion `83a7f32`. Protocol v2, its selective canonical claim registry and the dependency-audit tooling therefore predate this atlas implementation; they are not presented as newly recovered or newly invented here.

The inspected baseline includes foundation/theory/mathematics/model/hypothesis/simulation/experiment/figure/paper/portfolio/reference/research-log/validation directories, `SOFTWARE/`, `ARCHIVE/`, repository governance and a static geometry laboratory. Existing untracked or modified files created during this mission are being integrated deliberately; Git state alone does not establish their scientific maturity.

## Components

| Component | Location | Role and boundary |
| --- | --- | --- |
| Governance | [`AGENTS.md`](../AGENTS.md) | Scientific record, classification, validation and Git rules |
| Protocol v2 | [`00_FOUNDATION/QFP_Epistemic_Protocol_v2.md`](../00_FOUNDATION/QFP_Epistemic_Protocol_v2.md) | Prospective scope/dependency/validation record |
| Canonical registry | [`00_FOUNDATION/qfp_claim_registry.json`](../00_FOUNDATION/qfp_claim_registry.json) | Selected canonical objects; no silent status migration |
| Dependency auditing | [`SOFTWARE/qfp_dependency_audit.py`](../SOFTWARE/qfp_dependency_audit.py) | Registry reference/graph checks and impact reporting |
| Symbolic center check | [`SOFTWARE/regular_center_scalar_reduction.py`](../SOFTWARE/regular_center_scalar_reduction.py) | Reproducible conditional mathematical computation |
| Research overview | [`01_THEORY/Research_Atlas.md`](../01_THEORY/Research_Atlas.md) | Branches, mathematical context and open questions |
| Curated sources | [`10_REFERENCES/Atlas_Sources.md`](../10_REFERENCES/Atlas_Sources.md) | Inspected sources and attribution boundaries |
| Corpus coverage | [`10_REFERENCES/Corpus_Coverage.md`](../10_REFERENCES/Corpus_Coverage.md) | Bounded searches, recovered candidates and missing originals |
| Atlas display data | [`WEB/qfp-lab/data/research.json`](../WEB/qfp-lab/data/research.json) | Public curation/display adapter, not a private conversation dump |
| Browser application | [`WEB/qfp-lab/index.html`](../WEB/qfp-lab/index.html) | Explore, Understand and Examine entry points |
| Retained laboratory | [`WEB/qfp-lab/geometry.html`](../WEB/qfp-lab/geometry.html) | Original geometry-laboratory functionality |
| Build/local preview | [`package.json`](../package.json), [`SOFTWARE/serve-atlas.mjs`](../SOFTWARE/serve-atlas.mjs) | Reproducible local build/test/preview commands; deployment verified separately |
| Mathematical review | [`12_VALIDATION/Atlas_Mathematical_Review.md`](../12_VALIDATION/Atlas_Mathematical_Review.md) | Scalar variation, center algebra, units and software interpretation |
| Metric review draft | [`12_VALIDATION/Atlas_Metric_Bulk_Variation_Draft.md`](../12_VALIDATION/Atlas_Metric_Bulk_Variation_Draft.md) | Separate review artifact; not an automatic canonical promotion |
| Archive importer | [`archive_tools/`](../archive_tools/README.md) | Private local normalization, preservation and coverage reporting |

## Recovery coverage

The source investigator's [coverage record](../10_REFERENCES/Corpus_Coverage.md) documents the actual local and connected-source search. Within those bounds, no original full ChatGPT export, supplied starting HTML/import utility, research pack, or alternate historical checkout was recovered. This does not establish absence outside the searched locations. No unnamed old local metric/variation artifact was identified by this recovery; the current metric review draft is new work with its own provenance.

The atlas uses inspected saved-document candidates and explicitly labeled owner-reported leads. It does not claim recovered message IDs, generating model identities, original timestamps or two-/three-year transcript completeness where none was obtained. Private extracts and lookup metadata remain outside the repository. The importer was developed and tested with synthetic data; no real export has yet been imported by this implementation.

An external private `source-index.json` inventories six extraction/metadata files with SHA-256. Its checksums apply to the stored extraction JSON bytes; they are not original cloud-file hashes or evidence of actual transcripts. This private-file count is distinct from the number of inspected source-document candidates.

## Publication observation

At the initial repository investigation, two existing Pages workflow runs on `main` had failed at `ConfigurePages`, and the repository's Pages API returned HTTP 404. Those are observations of that investigation, not a permanent diagnosis or proof that publication cannot work. The atlas's local build and a future public deployment must be verified independently. The README's local URL is a loopback development/preview address, not a claim that a public site is live.

The [verification record](VERIFICATION.md) and [dated research log](../11_RESEARCH_LOG/2026/2026-11-11_interactive-research-atlas.md) contain the completed local validation outcomes. Any later deployment observation is recorded separately from those local results.
