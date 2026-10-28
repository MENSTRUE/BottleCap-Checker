# Notebook — primary experiment

**Source of truth:** [`bottlecap-checker.ipynb`](bottlecap-checker.ipynb). This is the actual Kaggle research notebook for Day 23. Do not replace with a placeholder, silently clear its executed results or append fake outcomes.

Original data mount: `/kaggle/input/datasets/loliwibu/bottlecap-checker-day23-datasets`. The primary source is `Bottle Defects.v28i.yolov8` and the separately audited secondary source is excluded. Primary split 398/113/112; YOLOv8n from `yolov8n.pt`, img size 640, requested 65 epochs, patience 15, batch 16, seed 42. Selection on validation; held-out test report on 112 images. Run on an environment with compatible Ultralytics, PyTorch and the original dataset; no notebook execution is needed to use the local web app.

Companion artifacts: [`../reports/`](../reports/), [`../models/`](../models/), [`../assets/plots/`](../assets/plots/). See [Methodology](../docs/METHODOLOGY.md) for data lineage, scientific limits and re-run guidance. Preserve the original study and version any new experiments separately.
