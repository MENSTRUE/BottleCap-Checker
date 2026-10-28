# Visual evidence and media provenance

`plots/` contains Kaggle-generated original research visualizations (train curves, validation/test confusion matrices, class balance and held-out charts). Use them to *explain* recorded results, not to recalculate numbers from pixels. Definitive metrics live in `reports/*.json`.

`screenshots/Screenshot 2026-10-28 184458.png` shows a real user-captured **local dashboard Loose Cap prediction** with one visible bounding box, approximately 89.5% confidence and 59.1 ms displayed inference time. It is a *single-case smoke test*, not an independent benchmark or speed SLA.

`examples/` is reserved for permission-cleared demonstration images (no raw training/test assets uploaded merely for convenience). `diagrams/` is reserved for architecture drawings. Do not invent figure provenance or distribute third-party imagery without confirming license and attribution. See [Claims](../docs/CLAIM_BOUNDARIES.md).
