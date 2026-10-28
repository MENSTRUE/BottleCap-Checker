# BottleCap Checker — FastAPI backend (Day 23)

This backend loads the trusted `models/bottlecap_primary_best.pt` checkpoint and checks the **exact five-class order** from Kaggle. It never makes an automated quality acceptance decision.

## Windows 11 / PowerShell

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

If `py -3.11` is not installed, use a compatible installed Python (3.10–3.12 recommended) and create the venv with that executable. Torch/Ultralytics versions can have platform-specific constraints.

Documentation: `http://127.0.0.1:8000/docs`.

## API contract

- `GET /api/v1/health`: service status, model presence (not inference success).
- `GET /api/v1/models`: five classes + held-out metrics from the **stored report**, not runtime scores.
- `POST /api/v1/predict`: multipart image `file`; `confidence=0.25`, `iou=0.45`, `include_annotated=true`.

Image formats: JPEG/PNG/WebP; max 10 MiB and 16 million pixels. Annotated image is Base64 JPEG in `annotated_image_base64`, or null when disabled. Boxes are pixel-space XYXY.

```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/v1/predict?confidence=0.25&include_annotated=false" -F "file=@C:\path\to\test.jpg"
```

## Reproducibility / boundaries

Research evidence is in `reports/final_summary.json` and `reports/primary_heldout_metrics.json`: 623 source images, 398/113/112 split; 112 held-out test images, P=0.90028, R=0.93377, mAP50=0.95211, mAP50–95=0.75982. **Broken Ring** is weakest at AP50–95=0.37346. This service does not calculate those metrics at request time.

Primary source classes: `Broken Cap`, `Broken Ring`, `Good Cap`, `Loose Cap`, `No Cap`. Checkpoint selection used validation only. Secondary packaging dataset was audited and excluded, not merged. Hash and filename-family checks do not rule out every near-duplicate.

For manufacturing use: label names are dataset classes, no calibrated pass/fail threshold, no external-domain assurance. Do not execute untrusted `.pt` files; trusted local checkpoints only. Review data/model licenses, safety policies, and security before deployment.

## Troubleshooting

- `ModuleNotFoundError`: use `.venv\Scripts\python.exe` to install and run.
- `503 model missing`: verify `models/bottlecap_primary_best.pt` at repository root; API expects that relative location.
- `503 mismatch`: ensure the five checkpoint class names and indices match precisely; do not silently remap.
- `415 / 413 / 422`: unsupported type / too large / invalid image.
- First inference takes longer due to initial model load; use normal test images first.
- `0 detections` is valid at a given threshold and does **not** prove an object is compliant.

Next phase: React/Vite frontend using this API, then end-to-end test on original held-out images.
