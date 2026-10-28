# Testing and validation protocol

## Evidence categories

**Research benchmark:** the Kaggle notebook plus committed reports are the original source for held-out precision/recall/mAP. **Unit/API tests:** check endpoint contracts, not generalization. **Browser smoke test:** demonstrates an actual local prediction, not benchmark quality. Keep them separate.

## Currently evidenced

- User Windows log: `pytest` finished **3 passed**, one Starlette/httpx deprecation warning; FastAPI started successfully on `http://127.0.0.1:8000`.
- User Windows log: frontend `tsc --noEmit && vite build` succeeded, 1,582 modules transformed, Vite ready on `127.0.0.1:5173`.
- User screenshot stored `assets/screenshots/Screenshot 2026-10-28 184458.png`: one `Loose Cap` prediction, confidence ~89.5%, elapsed ~59.1 ms, one box, API connected. Image provenance beyond the screenshot and exact dataset split cannot be independently confirmed from screenshot alone.
- No evidence currently establishes that all five classes have been individually exercised in the UI, performance against factory-held-out imagery, or secure production load testing.

## Baseline checks

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

From `frontend/`, in another terminal:

```powershell
npm ci
npm run typecheck
npm run build
npm run dev
```

API smoke checks:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
Invoke-RestMethod http://127.0.0.1:8000/api/v1/models
curl.exe -X POST 'http://127.0.0.1:8000/api/v1/predict?confidence=0.25&iou=0.45&include_annotated=false' -F 'file=@C:\path\to\test.jpg'
```

These commands are usage examples; do not mark them as executed unless actually run. Confirm `model_present` true, names exactly match class contract, prediction returns well-formed XYXY boxes and `quality_decision` is `not_assessed`.

## Five-class human-reviewed end-to-end matrix

| Intended class | Example provenance | Ground truth known? | Predicted boxes/class? | Human review | Evidence |
|---|---|---|---|---|---|
| Broken Cap | Primary *test* image | Pending | Pending | Pending | Pending |
| Broken Ring | Primary *test* image | Pending | Pending | Pending | Pending |
| Good Cap | Primary *test* image | Pending | Pending | Pending | Pending |
| Loose Cap | Screenshot of browser demo | Not independently verified | 1 Loose Cap | Screenshot only | `assets/screenshots/Screenshot 2026-10-28 184458.png` |
| No Cap | Primary *test* image | Pending | Pending | Pending | Pending |

Do not invent confidence scores or mark missing test rows passed. When access is available, select **test-only** example images from original dataset; avoid using training images as held-out demonstrations without labels. Keep the original untouched image separate from backend's annotated output.

## Record format for real cases

For each test, record: ISO timestamp; dataset/source and licensing; filename or privacy-safe hash; source split; expected object labels / boxes if available; model checkpoint SHA-256; confidence/IoU settings; predicted labels/confidence/XYXY; backend elapsed ms; result of manual inspection; known failure type (wrong label, missed defect, misplaced box, false alarm); screenshot link; reviewer signoff. Do not commit copyrighted/private test photos without rights. No test result means no claim.

## Error and boundary testing

1. Valid JPEG/PNG/WebP each within limit → decode and inference succeeds (or explicit model failure).
2. Unsupported MIME or mismatched bytes → 415.
3. Empty image → 400.
4. File above 10 MiB and >16 million decoded pixels → 413; no huge memory allocations.
5. Corrupt image → 422.
6. Unavailable checkpoint or incompatible class mapping → 503, diagnostic server log, no bogus result.
7. Threshold extremes 0.01 and 1.00 within accepted bounds; out-of-range query validation.
8. Zero detections → empty list, all class counts zero, still requires human review.
9. Multiple overlapping boxes → NMS IoU affects count; no double-count assumptions.
10. Original/annotated toggle, JSON/JPEG download, class filtering, upload replacement and controls work in frontend.
11. Backend stopped during upload → visible error, no false success state.
12. Test image with blur, glare, background variation, sideways orientation, low contrast and unseen packaging → log error types without claiming accuracy.

## Quantitative next steps

Evaluate independent held-out photos for each class with known annotations, normalized confusion matrix, class-specific precision/recall, calibration/reliability where appropriate, localization failure analysis and uncertainty intervals. Record cold/warm inference latency across enough runs and hardware environments to report median/p95. Do not extrapolate a single 59.1 ms screenshot into throughput or speed guarantees.
