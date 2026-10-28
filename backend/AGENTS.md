# Backend agent contract

- Read repository reports before changing metric claims. Do not retrain or modify trained checkpoints unless explicitly requested.
- Checkpoint contract is five classes in exact order: Broken Cap, Broken Ring, Good Cap, Loose Cap, No Cap.
- Model lives at repository-root `models/bottlecap_primary_best.pt`; never load remote/untrusted pickled checkpoints.
- Preserve `/api/v1/health`, `/api/v1/models`, `/api/v1/predict` contracts. Any breaking API changes require frontend + docs update.
- `quality_decision` must remain `not_assessed`; do not equate Good Cap detection with whole-bottle compliance.
- Tests mocking inference validate HTTP schema only. They are not evidence of real checkpoint inference, which must be tested separately.
- Handle upload limits; avoid logging image contents; never persist uploaded production images without consent.
