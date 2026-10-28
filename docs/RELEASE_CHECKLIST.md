# Day 23 — release and documentation checklist

This is a review record, **not proof that all boxes have already been checked**. Check only after independently verifying each item on a clean environment and recording real evidence.

## Research integrity

- [x] Original notebook committed: `notebooks/bottlecap-checker.ipynb`.
- [x] Primary split and counts documented from `reports/final_summary.json`: 398/113/112.
- [x] Exact-hash and filename-family audit artifacts committed.
- [x] Secondary packaging dataset explicitly excluded; no ontology mixing.
- [x] Champion selection on validation documented, final test metrics separate.
- [x] Five test AP50–95 class values published, including weak Broken Ring.
- [x] Best/last `.pt` plus ONNX export committed (actual parity not claimed).
- [ ] Independently verify upstream primary dataset attribution/redistribution rights.
- [ ] Capture all checkpoint SHA-256 values in a release manifest.
- [ ] External-domain/near-duplicate embedding study or clear acceptance of that limitation.

## Application engineering

- [x] Backend and test files committed in GitHub snapshot used for docs.
- [x] Frontend files and npm lockfile committed in GitHub snapshot.
- [x] One real screenshot under `assets/screenshots/`.
- [x] User-provided Windows log: backend tests 3 passed (one deprecation warning).
- [x] User-provided Windows log: frontend production bundle successfully built.
- [x] User-provided screenshot: one Loose Cap result shown in UI.
- [ ] Review local security scan, dependency versions and pinned requirements.
- [ ] Execute documented five-class smoke-test matrix with source test images.
- [ ] Test malformed, unsupported, oversized and empty inputs in full end-to-end UI.
- [ ] Run on a clean clone and record exact commands and OS/dependency versions.
- [ ] Validate ONNX parity before any change of runtime.

## Documentation and assets

- [x] Root README includes Before–Now–Next, provenance, audit, split, selection, metrics, architecture, limitations, FAQ, road map.
- [x] Root + backend/frontend AGENTS, bilingual docs, testing, deployment and claims rules included in documentation pack.
- [x] Original screenshot and plots linked with **actual repository filenames**.
- [x] `.gitignore` protects local environment, uploads, raw datasets and build outputs.
- [x] Existing MIT `LICENSE` is retained unchanged; dataset/weight rights explicitly separated.
- [ ] Confirm docs copied/committed/pushed; package generation alone is not GitHub publication.
- [ ] Verify Markdown links after push.
- [ ] Add attribution for any new screenshots containing source images or people as needed.

## Production readiness — intentionally not claimed

- [ ] Site-specific independent data and operational acceptance criteria.
- [ ] Security design (auth, TLS, rate limits, privacy controls).
- [ ] Monitoring, logging, versioning, rollback, scalability testing.
- [ ] Calibrated decision rules and supervised human review.
- [ ] External validation of difficult Broken Ring and other failure cases.

**Release label:** Day 23 end-to-end **research prototype** with recorded held-out benchmark; **not production-approved industrial inspection**.
