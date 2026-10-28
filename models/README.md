# Model artifacts — trusted research checkpoints

| Path | Role | Serving status |
|---|---|---|
| `bottlecap_primary_best.pt` | Validation-selected champion | **Active**, loaded by `backend/app/inference/detector.py` |
| `bottlecap_primary_last.pt` | Last training checkpoint | Not serving; research traceability |
| `bottlecap_primary_best.onnx` | Exported ONNX graph (audit reports 12,750,110 bytes) | **Not** currently used by FastAPI |

The API expects the five checkpoint names **in order**: Broken Cap, Broken Ring, Good Cap, Loose Cap, No Cap. It asserts YOLO detect task/class contract instead of silently remapping names. Training config was `yolov8n.pt`, imgsz 640; selection used validation; held-out results are under [`../reports/`](../reports/).

Safety: `.pt` checkpoint formats can deserialize untrusted objects; **do not load arbitrary user-provided weights**. Only use vetted local artifacts. ONNX export success does not establish parity, runtime speed or independent industrial safety. The repo's MIT code license does not automatically grant rights to all upstream pretrained weight packages or dataset contents.
