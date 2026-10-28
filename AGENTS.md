# AGENTS.md — BottleCap Checker engineering contract

Scope: **all files in this repository**. Nested `backend/AGENTS.md` and `frontend/AGENTS.md` add stricter rules for their subtrees. This is an operating contract for human contributors and coding agents, not a request to autonomously run training or deploy anything.

## Mission and non-negotiable behavior

Deliver an **auditable research prototype** for five-class cap defect **object detection**. **Never fabricate training metrics, training logs, confidence values, screenshot evidence, inference outputs, dataset sizes, model provenance or pass/fail decisions.** The primary trained checkpoint and committed notebook are real. Preserve these artifacts unless the user explicitly directs model replacement and provides an audit trail.

## Source-of-truth precedence

1. Executed original `notebooks/bottlecap-checker.ipynb` and `reports/*.json`, `reports/*.csv` for study design, run and metrics.
2. `models/bottlecap_primary_best.pt` for runtime class contract; `backend/app/core/config.py` / `backend/app/inference/detector.py` for currently enforced model contract.
3. `backend/app/api/routes/*.py` for API and `frontend/src/types/api.ts` + services for wire format.
4. `LICENSE` and source attribution notes for copyright; do not extrapolate rights.
5. README and marketing content are descriptive, lower-priority than executable evidence.

When a conflict appears, **pause the claim**, inspect primary sources, document the difference and update only demonstrably wrong prose. Never silently reconcile by inventing details.

## Immutable research facts until new executed results exist

- Day 23, task object detection; primary source `Bottle Defects.v28i.yolov8` with 623 images, train 398, validation 113, test 112.
- Model YOLOv8n initialized from `yolov8n.pt`, `imgsz=640`, 65 requested epochs, patience 15, batch 16, workers 2, seed 42.
- Champion was Ultralytics `best.pt` selected on **validation**; 112-image **held-out test** precision 0.9002763693; recall 0.9337688200; mAP50 0.9521119919; mAP50–95 0.7598204985.
- Per-class held-out AP50–95: Broken Cap .7439461, Broken Ring .3734610, Good Cap .9136948, Loose Cap .8246889, No Cap .9433116.
- 0 invalid primary records, 0 exact hash overlap across splits, 0 filename-family overlap across splits; near duplicates **not eliminated**.
- Secondary packaging dataset audited only, reported 9651 orphan-label records / 0 matched images in parser layout; **not** used to train primary champion.
- `.onnx` export exists, but current backend loads **`.pt`**, not ONNX Runtime.
- Original repo `LICENSE` is MIT for owned code, not a blanket license for third-party datasets or trained/pretrained weights.

## Model / API contract

Zero-based order is exactly: `Broken Cap`, `Broken Ring`, `Good Cap`, `Loose Cap`, `No Cap`. Do not rename or remap without retraining/verified conversion and explicit schema migration.

- GET `/api/v1/health` checks app and checkpoint presence. Current `model_loaded` field is static false: not a loading failure verdict.
- GET `/api/v1/models` reads stored held-out report; don't call it live accuracy.
- POST `/api/v1/predict` accepts a multipart image, confidence 0.01–1.0 (default .25), IoU 0.01–1.0 (default .45), and optional annotated output.
- Success response contains `detections`, `detection_count`, `class_counts`, `inference_ms`, `annotated_image_base64`, `quality_decision: not_assessed`, `requires_human_review: true`.
- Bounding boxes are original image pixel-space XYXY, confidence is a model output score, not calibrated defect probability.
- Keep 10 MiB upload and 16M-pixel decoded-image guard. Never trust filenames, MIME types alone or raw pickle checkpoints from users.

## Scientific integrity and evaluation

No test-set tuning after publication without an explicit new protocol/version. Maintain held-out selection. Track image provenance and license. Don't use actual test images to increase the reported performance via retraining and still call the set held-out. When reporting a new run, include exact config, seed, partitions, dataset manifest, code revision, library versions, checkpoint digest, per-class metrics and failures. New runs belong under versioned paths, not silently overwriting existing research evidence.

No automated product pass/fail; even `Good Cap` is one detection label. A predicted missing cap and **no detections** are entirely different meanings. Never misrepresent images of unseen bottles as guaranteed accurate.

## Engineering practices

- Keep Python modules focused: configuration, image IO, inference and routing separated; add schema/typing/tests when behavior changes.
- Follow local React TypeScript strictness. No unused variables, fake controls, nonfunctional buttons or backend-mismatched DTOs.
- Prefer typed error responses and actionable diagnostic logs; do not expose stack traces, file system paths, authentication material or uploaded image contents in public errors.
- Test with `python -m pytest tests -q` from `backend/`, `npm ci && npm run typecheck && npm run build` from `frontend/`.
- Don't commit virtualenvs, `node_modules`, `dist`, local uploads, datasets, user images, credentials or huge temporary archives.
- Update `README.md`, bilingual docs, API examples and claims whenever any metric, route or model state changes.
- Record screenshot provenance; do not represent a user screenshot as a benchmark or publish unlicensed raw training samples.

## Operational safeguards

Current app is designed for **local development**. Restrict deployment, authenticate users, configure HTTPS/CORS, enforce rate/size limits, protect inference from untrusted model files and maintain human review before any line-control action. CORS is not auth. Production implementation must be separately tested and documented; do not present a local server as cloud deployed.

## Change workflow / acceptance checklist

1. Inspect affected files, reports, and nearest scoped `AGENTS.md`; identify source-of-truth facts.
2. Write a narrow change plan and classify data/model/API/UI/docs changes.
3. Implement minimum change without disturbing original training/heldout artifacts.
4. Execute tests and builds; record actual output, not expected output.
5. Review safety/rights, class ordering, zero-detection edge cases, image validation and user-visible claims.
6. Update evidence docs, screenshots and release checklist where applicable.
7. Commit with a descriptive message; never assume `git push` or deployment happened unless verified.

## Prohibited shortcuts

No dummy AI inference, fabricated data, misleading pass/fail badges, unilateral retraining, undeclared model swaps, test leakage, automatic license assumptions, unrelated refactors, unreviewed destructive Git commands, or removal of uncomfortable metrics (particularly Broken Ring AP50–95).
