# Research methodology, data audit and reproducibility

## Scientific question

Can a lightweight pretrained YOLOv8n object detector localize and classify five annotated bottle-cap visual conditions on a **held-out test split from the same dataset export**? This is not a study of seal torque, leak proofing, GMP certification or automated line rejection.

## Primary data and ontology

**Source:** `Bottle Defects.v28i.yolov8` as mounted in Kaggle at `/kaggle/input/datasets/loliwibu/bottlecap-checker-day23-datasets/`. The notebook points to its `data.yaml`. Original dataset split: **398 train / 113 valid / 112 test = 623 images**. Five labels in checkpoint order are Broken Cap, Broken Ring, Good Cap, Loose Cap, No Cap. Bounding-box counts: 63, 66, 218, 158, 161 respectively. A per-class **object count** is not the same as the number of distinct images bearing that class.

Primary audit evidence: `reports/primary_audit.json`, `reports/primary_manifest.csv`, `reports/primary_family_audit.json`. Invalid records: **0**; cross-split exact SHA hash overlaps: **0**; filename-family cross-split overlaps: **0**; unique filename families: **623**. These tests inspect exactly what they name; compression variants, recrops or same physical product across unrelated filenames can still leak information. No image-embedding deduplication or camera-session controls are documented.

## Secondary source — excluded

`Dataset of Packaging Defects and Associated Cost...` uses four incompatible labels (`Cap`, `Missing`, `Wrong bottle`, `box`). The committed audit found **9,651 unmatched/orphan label records** with **0 matched images** in the inspected parser layout. Do not interpret these as 9,651 faulty packages. This dataset was **not** used to train or evaluate the champion; its licensing needs separate verification. Evidence: `reports/secondary_audit.json`, `reports/source_discovery.json`, `reports/secondary_manifest.csv` (currently empty).

## Experimental policy

The notebook preserved the provided train/validation/test split. Use the training partition for fitting; validation is used for model/checkpoint selection; held-out test is reserved for final evaluation. The repository reports one principal architecture (`yolov8n.pt`) rather than a multi-architecture competition. Config from `reports/environment.json`: seed 42, YOLOv8n, 65 requested epochs, patience 15, 640 input size, batch 16, workers 2, `secondary_train=false`, `export_onnx=true`. Training log in `reports/training_info.json` records Ultralytics 8.4.190, GPU device 0, elapsed `248.47` seconds. Do not infer final epoch count from requested epoch count; inspect notebook or complete run logs for actual stopping.

Ultralytics selected the best validation checkpoint. A different `last.pt` exists but was not the reported final champion. The exported ONNX is separate; the FastAPI runtime still loads `.pt`.

## Recorded evaluation

All metrics here are copied from `reports/final_summary.json` and `reports/primary_heldout_metrics.json`.

| Split | Images | Precision | Recall | mAP@50 | mAP@50–95 |
|---|---:|---:|---:|---:|---:|
| Validation | 113 | .92072941499 | .90852842809 | .95726733954 | .78664990376 |
| **Held-out test** | **112** | **.90027636928** | **.93376881996** | **.95211199195** | **.75982049849** |

| Class | AP50–95 (held-out test) |
|---|---:|
| Broken Cap | .74394611518 |
| **Broken Ring** | **.37346104112** |
| Good Cap | .91369480519 |
| Loose Cap | .82468890630 |
| No Cap | .94331162465 |

The weakest strict-IoU localization is Broken Ring; prioritizing it is scientifically important. Precision, recall and mAP depend on dataset labels and protocol. Not a pass/fail accuracy, probability calibration, production risk index, leak test or real-camera external validity result. A good-looking result from one upload is a **sanity check**, not held-out statistical evidence.

## Artifact provenance and comparison

- `notebooks/bottlecap-checker.ipynb`: executed experiment and data operations; preserve original notebook outputs.
- `models/bottlecap_primary_best.pt`: deployed runtime checkpoint, trusted local research artifact.
- `models/bottlecap_primary_last.pt`: alternative last training epoch artifact.
- `models/bottlecap_primary_best.onnx`: export audit success; not the runtime serving engine.
- `reports/environment.json`, `reports/training_info.json`: training software and hardware evidence.
- `reports/onnx_export_audit.json`: ONNX file export success, 12,750,110 bytes; **export success does not establish ONNX vs PyTorch prediction parity**.
- `assets/plots/test_confusion_matrix*.png`: visual diagnosis, not a substitute for test metrics source JSON.

## Re-run the experiment without contaminating the original release

1. Obtain the **same** primary source dataset and examine upstream licensing and `data.yaml` content; confirm folder and hashes/manifest.
2. Open `notebooks/bottlecap-checker.ipynb` in Kaggle and attach it at the expected input mount, or intentionally update the data-root code while documenting the change.
3. Confirm Python/Ultralytics/PyTorch/CUDA versions. Original environment: Python 3.13.15, PyTorch 2.11.0+cu128, Ultralytics 8.4.190, GPU available.
4. Run dataset discovery and integrity/annotation checks before training. Abort on invalid labels and unexplained cross-split overlaps.
5. Run training with the recorded config. Use validation to select the best checkpoint; do not inspect final held-out test for tuning.
6. Evaluate selected checkpoint once on test. Export **new versioned** reports and plots; do not overwrite committed research evidence without explicit provenance/versioning.
7. Compare per-class results and inspect failure cases; report changes to data, library versions, seeds and environment.
8. Verify ONNX actual graph input/output semantics and parity before switching the server to ONNX Runtime. The current backend is not an ONNX benchmark.

Original model may not reproduce bit-for-bit because device kernels and dependencies differ. Full cross-platform reproducibility is unverified. Reference images used for documentation should be permission-cleared.

## Threats to validity

Small dataset (623 images), test set 112, class imbalance in object counts, possible near-duplicate or camera-session overlap, unknown factory variability, weak Broken Ring localizations, only one main architecture/seed, pretrained model terms, no independent external test, and potential field-of-view dependence. Make these limitations visible when publishing metrics.
