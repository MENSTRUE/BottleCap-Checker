# BottleCap Checker — English technical overview

**Day 23/100 | Five-class visual object detection | Research prototype**

[Full root README](../../README.md) · [Methodology](../METHODOLOGY.md) · [Testing](../TESTING.md) · [Deployment](../DEPLOYMENT.md) · [Claim boundaries](../CLAIM_BOUNDARIES.md)

## Problem statement

Bottle caps and sealing rings can show conditions that justify a human visual inspection. BottleCap Checker is a reproducible **visual evidence assistant**, not an automated seal integrity test or factory reject controller. An object detector locates one or more regions and assigns dataset-defined labels; a person interprets these observations against an external quality policy.

## Before → Now → Next

- **Before:** candidates included a primary five-class Bottle Defects export and a separate four-class packaging source; training suitability was unknown.
- **Now:** primary dataset audited; YOLOv8n trained and selected using validation; held-out test results and artifacts committed; real FastAPI backend and React/Vite dashboard connected.
- **Next:** perform complete five-class UI smoke tests, document error cases, audit external domain shift and access/asset licenses, build CI, and assess security before hosting.

## Primary dataset and ontology

Original Kaggle mount: `/kaggle/input/datasets/loliwibu/bottlecap-checker-day23-datasets/Bottle Defects.v28i.yolov8/data.yaml`. **623 images** split **398 train / 113 validation / 112 test**. Immutable class order: Broken Cap (0), Broken Ring (1), Good Cap (2), Loose Cap (3), No Cap (4). Box annotation counts are 63, 66, 218, 158, 161. These are objects, not image counts.

**Primary audits:** no invalid records, zero byte-identical cross-split hash overlaps, zero filename-family cross-split overlaps; these checks cannot rule out perceptually near-identical photos or source session correlation. The *secondary* packaging source has different classes (Cap, Missing, Wrong bottle, box) and **9,651 reported orphan-label records with no images matched in the inspected layout**. It was **excluded** from training and evaluation; do not merge its labels by assumption.

## Experiment and champion

Notebook: `notebooks/bottlecap-checker.ipynb`. Pretrained `yolov8n.pt`, image size 640, 65 requested epochs, patience 15, batch 16, seed 42. Reported Kaggle environment: Python 3.13.15, Ultralytics 8.4.190, Torch 2.11.0+cu128, GPU available. Validation selected `best.pt`; test results are from the untouched source held-out split. `last.pt` is kept for traceability. ONNX export succeeded; the running service **does not** use ONNX Runtime.

## Recorded research results

| Metric | Validation (113) | Held-out test (112) |
|---|---:|---:|
| Precision | 92.07% | **90.03%** |
| Recall | 90.85% | **93.38%** |
| mAP50 | 95.73% | **95.21%** |
| mAP50–95 | 78.66% | **75.98%** |

Per-class AP50–95 on test: Broken Cap 74.39%, **Broken Ring 37.35%**, Good Cap 91.37%, Loose Cap 82.47%, No Cap 94.33%. Broken Ring strict-localization performance is a concrete weakness and must remain visible. Source: `reports/primary_heldout_metrics.json`. These metrics are not product-level pass/fail success rates or out-of-domain manufacturing accuracy.

## App architecture and contract

The current flow is React → `POST /api/v1/predict` FastAPI → validated image decode → trusted local `.pt` YOLO inference → JSON detections with XYXY coordinates and scores → optional Base64 annotated JPEG → UI summary/export. Read-only `GET /api/v1/health` checks application and checkpoint presence; `GET /api/v1/models` reads recorded evaluation metrics from disk. A health response's static `model_loaded: false` must **not** be presented as a lazy-loading error.

Accepted images: JPEG/PNG/WebP; maximum 10 MiB and 16 million pixels. Confidence and IoU query parameters default to 0.25 and 0.45; each validated to 0.01–1.0. `quality_decision: not_assessed` and `requires_human_review: true` are intentional. Zero detections do not mean a bottle has passed inspection.

## Run locally on Windows

Backend in terminal one:

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Frontend in another terminal:

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\frontend"
npm ci
npm run typecheck
npm run build
npm run dev
```

Open `http://127.0.0.1:5173` and Swagger `http://127.0.0.1:8000/docs`. The Vite proxy forwards local `/api` requests to port 8000. Never claim this developer stack is a secure production deployment.

## Evidence and limitations

User-provided Windows logs show three passing Python tests and a successful TypeScript/Vite build. The original UI screenshot illustrates **one Loose Cap detection** (~89.5% confidence, ~59.1 ms). That confirms a specific smoke-test response, **not** robust performance or representative latency. Independent five-class end-to-end checks, difficult examples and external factory-like dataset testing remain outstanding.

A lightweight pretrained detector on a 623-image source export cannot establish sealing torque, sanitary compliance, general packaging safety or enterprise readiness. Confidence is a model score, not a calibrated product-defect probability. The test source may still have near duplicates and shared shooting conditions; unknown domains, angle, lighting, glare and blur remain unverified. There is no automatic quality decision.

## Rights and deployment

The existing repository [`LICENSE`](../../LICENSE) is **MIT** for owned software. The notebook describes the primary dataset Roboflow export as **CC BY 4.0**; verify upstream creator/source and attribution for images. The secondary dataset has unverified rights. Pretrained weights, Ultralytics and dependencies have separate applicable terms. Do not infer blanket permissions from the code license. Public deployment needs authentication, HTTPS, rate/resource controls, privacy/data retention, model integrity, monitoring, rollback, and documented human authority.

## Roadmap, troubleshooting, and FAQ

Prioritize a sourced held-out UI walkthrough for all five classes, failure-case labels, near-duplicate perceptual audit, external data study, stable dependency locks and CI. Then consider ONNX parity and production security. For `API Offline`, start FastAPI and verify port 8000; for 503, examine `.pt` path/contract and logs; for 413/415/422, check upload size/format; for empty detections, evaluate thresholds and source images without assuming conformity; for TS build failure, run `npm ci && npm run typecheck`.

**FAQ:** Is this trained AI? **Yes**, committed Kaggle-trained best checkpoint. Are both candidate datasets used? **No**. Is 95.21% an inspection pass rate? **No**, it is held-out detection mAP50. Is ONNX currently served? **No**, Ultralytics `.pt` is. Is `Good Cap` a product approval? **No**. Are full manufacturing deployment or SLA claims supported? **No**.

For details, read the full [root README](../../README.md), [test protocol](../TESTING.md) and [claim boundaries](../CLAIM_BOUNDARIES.md).
