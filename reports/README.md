# Research reports — source of truth

These are machine-produced notebook audit/training/evaluation artifacts. **Do not edit raw metrics to match marketing claims**, and do not overwrite them with new online app predictions.

| File | Evidence |
|---|---|
| `final_summary.json` | Project, dataset counts, checkpoint selection, validation/held-out metrics and limitations |
| `primary_audit.json` | Source paths, classes, split images, annotation counts and exact cross-split hash checks |
| `primary_family_audit.json` | Filename-family overlap heuristic |
| `primary_manifest.csv` | Primary sample-level manifest |
| `primary_validation_metrics.json` | Validation metrics used in selection workflow |
| `primary_heldout_metrics.json` | Final test precision/recall/mAP and per-class AP |
| `primary_per_class.csv` | Tabular per-class metrics |
| `source_discovery.json` | Both discovered candidate source datasets and original split paths |
| `secondary_audit.json` | Excluded packaging source, 9,651 reported unmatched labels in parser layout |
| `secondary_manifest.csv` | Secondary manifest currently has no matched samples |
| `training_info.json`, `environment.json` | Training library/device/config provenance |
| `onnx_export_audit.json` | Export success; **not** ONNX serving or parity validation |
| `qualitative_prediction_inventory.json` | Notebook qualitative prediction inventory |

Primary dataset 623 images split 398/113/112. Held-out test 112 images: P 0.9002763693, R 0.93376882, mAP50 0.9521119919, mAP50–95 0.7598204985. Weak Broken Ring AP50–95 0.3734610411. See [Methodology](../docs/METHODOLOGY.md) and [Claims](../docs/CLAIM_BOUNDARIES.md).
