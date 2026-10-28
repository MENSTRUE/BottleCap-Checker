# Backend agent rules — BottleCap Checker

Applies to `backend/` alongside root `AGENTS.md`.

## Runtime correctness

- `app/core/config.py` defines project-root paths and exact ordered classes. Keep `models/bottlecap_primary_best.pt` as the default checkpoint unless a reviewed migration is approved.
- `app/inference/detector.py` loads **trusted local** Ultralytics YOLO weights. Reject invalid class order/task. Do not catch and suppress misclassification or load untrusted uploaded `.pt` files.
- `app/services/images.py` validates actual decoded format, MIME, upload bytes (10 MiB), pixel count (16,000,000), EXIF orientation. Maintain bounded reads and explicit HTTP errors.
- `app/api/routes/inspection.py` returns 5-class detections, XYXY coordinates, per-class counts, timing and optional backend-drawn JPEG. Keep `quality_decision` equal to `not_assessed` and `requires_human_review` true.
- `app/api/routes/system.py` does **not** perform live benchmark evaluation. `/health` reports checkpoint presence; current `model_loaded: false` is static by code, not evidence the checkpoint is unloaded or broken.
- `app/main.py` currently allows only localhost Vite origins. Document real hardening requirements instead of widening CORS to `*` in a production claim.

## Changes and testing

Add specific tests for malformed uploads, wrong MIME, oversized input, correct response keys, zero detections, thresholds, annotation disabled, missing model and class contract mismatch. Existing three passing tests are basic smoke/unit evidence only. If adding concurrency, protect model state and measure performance rather than claiming throughput.

Run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Do not change benchmark JSON from API requests. Log operational errors without storing private uploads. `requirements.txt` has bounded major versions, not a fully locked environment; do not claim exact reproducibility of future installs.

## Safety and evidence

Never produce a product acceptance or rejection outcome. No box means no box at the chosen inference threshold, not evidence of a good seal. Use the recorded held-out metrics strictly as research metrics. ONNX export exists but the backend **does not** run ONNX Runtime. Cite relevant original files when documenting behavior.
