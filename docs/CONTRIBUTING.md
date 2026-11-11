# Contributing to I-AM-IS-I-AM

Read [AGENTS.md](../AGENTS.md) before changing scientific content or software. Its distinction between scientific object type and epistemic status is binding. The [QFP Epistemic Protocol v2](../00_FOUNDATION/QFP_Epistemic_Protocol_v2.md) governs prospective major objects and deliberate migrations of active canonical objects.

## Preserve the research record

Keep definitions, assumptions, derivations, computations, predictions, observations and empirical evidence distinct. Label a significant scientific object with its object type, and a significant validity/support claim with exactly one epistemic status. A definition need not receive a truth-status label simply because it exists. Do not silently replace a foundational formulation with a more conventional one.

When a formulation appears incorrect, preserve its source, identify the issue, propose the correction separately and explain the reasoning. Record a major conceptual or mathematical change in a dated research-log entry. Retain historically useful superseded work with its status and provenance. Do not invent citations, experiments, complete historical coverage or priority.

The canonical registry and the atlas display dataset serve different purposes. Preserve registered IDs, domains, dependencies and validation metadata when presenting a canonical record. Give historical/editorial records their own `ATLAS-` identifiers. An interpretive connection is not a derivation. A changed dependency calls for impact review; it does not by itself falsify a dependent claim.

## Change the atlas

1. Inspect the affected source document, canonical registry record or historical-source summary.
2. Make the UI or curated-data change under `WEB/qfp-lab/`; preserve the retained `geometry.html` laboratory unless the change explicitly concerns it.
3. Keep displayed scope and limits close to the relevant equation, visual or interaction. Label dimensionless display variables and approximation domains.
4. Test the changed behavior, then build and inspect the relevant desktop and mobile layout. Check keyboard operation, reduced-motion behavior, readable status labels and failure states where affected.
5. Document meaningful changes and their actual verification. Do not describe a test that was merely written as a passed test.

The browser must not acquire direct access to private exports. Keep private content, cloud credentials, local account details and raw transcripts out of JavaScript bundles, fixtures, screenshots and public source registries.

## Local commands

```sh
npm ci
npm test
npm run build
npm run serve
```

The local source preview is served at `http://127.0.0.1:4173/I-AM-IS-I-AM/`; the build output is separate in `dist/`. Set the server's `ATLAS_ROOT` environment variable to `dist` when verifying that bundle. `npm run test:browser` runs the configured browser suite when its required browser runtime is available. A browser test dependency or runtime that is unavailable is a limitation to report, not a passed check.

The private importer has no third-party Python requirements:

```sh
python -B -m unittest discover -s archive_tools/tests -v
```

For curated atlas-data changes, also run the independent registry/provenance validator and its mutation tests:

```sh
python -B SOFTWARE/validate_atlas_data.py
python -B SOFTWARE/tests/test_atlas_data_validation.py
```

Scientific checks use their own documented environments. In particular, SymPy is needed for the symbolic scripts; it is not a requirement of the archive importer. Consult [`SOFTWARE/README.md`](../SOFTWARE/README.md) and the [mathematical review](../12_VALIDATION/Atlas_Mathematical_Review.md) for exact commands, versions and assumptions.

## Import and curate historical material

Use the [private archive workflow](../archive_tools/README.md) only with explicitly supplied or authorized source files. Keep the full normalized corpus and exact originals outside Git and public web directories. Review the manifest, unsupported-format records, duplicate/conflicting versions, graph issues, attachment states and actual date coverage before making historical claims.

Do not infer an author or model from prose style. Do not substitute a saved file's date for a message timestamp, or assume a retrieved draft represents a complete conversation. Publish only reviewed project-relevant excerpts or summaries with an appropriate source reference and extraction limits. Unknown fields stay unknown. Search keywords identify candidates; they do not establish authorship, topic identity or scientific support.

## Report validation precisely

Record the command, runtime/package versions, inputs, relevant parameters and observed result. Scientific computations also need the assumptions, domain, numerical/symbolic method, tolerances, solver and error/convergence information that actually apply. A symbolic identity or local software check is not empirical confirmation or a global existence result.

Separate a successful local build from a successful Pages deployment. Record a deployment only after observing the deployed route and its assets. Never commit private archives, API keys, passwords, model credentials or unrelated personal files. Do not push, rewrite Git history or alter remotes without explicit authorization.
