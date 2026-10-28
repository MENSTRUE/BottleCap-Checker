# Scripts and reproducibility helpers

This directory currently contains **no shipped runnable script** beyond directory metadata. Do not imply there is a CLI audit/benchmark utility or add empty `.py` placeholders. The original executable research workflow is `notebooks/bottlecap-checker.ipynb`; the real application lives under `backend/` and `frontend/`.

Future accepted scripts should be idempotent and documented: dataset manifest validator, SHA-256 checkpoint manifest generator, test-image sampling tool, release-link checker, and inference benchmarking with hardware/version reports. Never silently retrain, overwrite held-out reports, or copy unlicensed dataset images to the repo. For current steps see [Methodology](../docs/METHODOLOGY.md), [Testing](../docs/TESTING.md) and [root README](../README.md).
