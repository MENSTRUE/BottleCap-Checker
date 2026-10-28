# Claim boundaries, limitations and research ethics

**Objective:** defend the credibility of this portfolio by distinguishing actually observed evidence from attractive but unsupported industrial claims.

## Supported claims

- Built a YOLOv8n five-class bottle-cap object detection prototype using a primary source export with 623 images (398 train, 113 val, 112 test).
- Selected a best checkpoint on validation and documented a source held-out test of 112 images: precision 90.03%, recall 93.38%, mAP50 95.21%, mAP50–95 75.98%.
- Audited primary annotations (0 invalid records), byte-identical split overlap (0 exact hashes) and filename-family split overlap (0 by heuristic), with explicit remaining risk.
- Reported a weak Broken Ring held-out AP50–95 of 37.35%, not hidden by aggregate metrics.
- Exported an ONNX file successfully, **without** implying ONNX inference is used or verified equivalent.
- Built a local FastAPI + React/TypeScript UI with image upload, real `.pt` model inference, XYXY bounding boxes, threshold settings and export.
- Demonstrated one local Loose Cap prediction at roughly 89.5% displayed confidence in a screenshot; **single-case observation only**.
- Included static research metrics in Model Insights using committed JSON reports.

## Unsupported / prohibited claims

- `95% manufacturing QC accuracy`, `95% packages approved correctly`, `99% safe products`, `guaranteed defect-free`, `certified food safety`, `production ready`, or `ISO/GMP compliant`.
- `100% leakage-free`: only exact hash and filename family checks were documented; visual/scene near duplicates may remain.
- `Trained using two datasets`: the secondary set was **audited and excluded** after a 9,651 orphan-label problem and different label ontology.
- `All five classes tested end to end`: browser evidence currently contains a demonstrated Loose Cap case, not five independently verified cases.
- `ONNX Runtime deployment`: the current backend uses PyTorch/Ultralytics `.pt`.
- `59 ms guaranteed inference` or a speed SLA: one displayed value is not a benchmark.
- `Good Cap = product passed`, `no detections = normal bottle`, or model confidence as a calibrated probability of sealing quality.
- `MIT licenses all datasets, images, or pretrained weights`: repository-owned source code has MIT; third-party obligations are separate.

## Disclosure examples

**Acceptable:** “Held-out source test (112 images): mAP@50 95.21%, mAP@50–95 75.98%. Broken Ring strict-IoU AP50–95 remains 37.35%. An end-to-end FastAPI/React research prototype runs the best `.pt` model; decisions remain with a reviewer.”

**Misleading:** “Our AI inspects factory products with 95.21% accuracy and automatically passes good bottles.”

## Safety framing

Use `quality_decision: not_assessed` in the API. A visual detection may inform a human review workflow, but site-specific quality decisions require independently established thresholds, traceability, domain testing and process governance. An empty prediction can mean model uncertainty or an unseen condition; never treat it as automatic assurance.

## Intellectual property

The repository includes an MIT `LICENSE` for owned code. The notebook reports a primary source Roboflow CC BY 4.0 export; verify actual upstream authors and attribution before reuse. Secondary licensing is unverified. Third-party libraries/weights and any example raw images retain their own rights. A screenshot of a local inference is not automatically licensed to represent the underlying dataset image independently.
