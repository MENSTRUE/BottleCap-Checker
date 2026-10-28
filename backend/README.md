# BottleCap Checker — Backend (FastAPI)

Real local inference uses `models/bottlecap_primary_best.pt` from the repository root. FastAPI verifies that the YOLO detection checkpoint has five **exact** labels: Broken Cap, Broken Ring, Good Cap, Loose Cap, No Cap. It does not use an ONNX Runtime session or emit an automated product approval.

## Local Windows setup

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API docs: `http://127.0.0.1:8000/docs`. These are development commands; do not publish `--reload` or unauthenticated endpoints to the Internet.

## Current API contract

| Endpoint | Meaning |
|---|---|
| `GET /api/v1/health` | Status and checkpoint presence; `model_loaded: false` is currently static, not an inference failure |
| `GET /api/v1/models` | Class contract and **stored** held-out metrics from `reports/final_summary.json` |
| `POST /api/v1/predict` | True Ultralytics model inference from a multipart image |

POST query params: `confidence` (default 0.25, accepted 0.01–1), `iou` (default 0.45, accepted 0.01–1), `include_annotated` (default true). `file` is JPEG/PNG/WebP; maximum 10 MiB and 16,000,000 decoded pixels. Response: `pipeline`, `model`, `image`, `thresholds`, `detections` with `class_id`/`class_name`/`confidence`/`bbox` (pixel-space XYXY), `detection_count`, `class_counts`, `inference_ms`, `annotated_image_base64`, `quality_decision: not_assessed`, `requires_human_review: true` and note.

```powershell
curl.exe -X POST 'http://127.0.0.1:8000/api/v1/predict?confidence=0.25&iou=0.45&include_annotated=false' -F 'file=@C:\path\to\test.jpg'
```

### Technical layout

- `app/main.py` — FastAPI and local CORS middleware, route wiring.
- `app/core/config.py` — checkpoint paths, accepted formats/limits and class names.
- `app/services/images.py` — decode, MIME/format, size/pixel checks, EXIF orientation, annotated JPEG rendering.
- `app/inference/detector.py` — lazy cached model loading, exact class order verification, 640px Ultralytics inference, lock for concurrent calls.
- `app/api/routes/inspection.py` — prediction and response serialization; `not_assessed` decision.
- `app/api/routes/system.py` — health and static research-model metadata.
- `tests/test_api.py` — current basic route tests; logged 3 passed on user's Windows machine.

### Scientific and operational boundaries

Research benchmark: 112 held-out source test images, P 90.03%, R 93.38%, mAP50 95.21%, mAP50–95 75.98%; **Broken Ring AP50–95 37.35%**. These numbers are not computed from your current uploads. A zero-detection result is not product approval. CORS does not replace authentication. Checkpoint deserialization only from vetted local artifacts. See [Methodology](../docs/METHODOLOGY.md), [Testing](../docs/TESTING.md), [Deployment](../docs/DEPLOYMENT.md) and [scoped AGENTS](AGENTS.md).

### Troubleshooting

- Module not found → install with `.venv\Scripts\python.exe` and run from `backend/`.
- 503 → checkpoint not present, class contract mismatch, or actual inference exception; inspect server logs.
- 413/415/422 → image exceeds limits, format mismatch or corrupt bytes.
- API says connected but no detections → threshold, scene distribution, or possible model miss; never equate empty predictions to safe products.
- First request slower → lazy model loading; do not market one local request as stable latency.
