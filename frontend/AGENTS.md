# Frontend agent rules — BottleCap Checker

Applies to `frontend/`, plus root `AGENTS.md`.

## Architecture / truth

React 18 + TypeScript + Vite. The `frontend/src/services/api.ts` client is wired to `/api/v1` (default, through Vite proxy to localhost backend). Backend DTO truth lives in `frontend/src/types/api.ts` and actual backend routes. Keep this type contract synchronized; no invented fields or metrics.

Navigation includes overview, AI inspection, model insights. Keep native real file upload (JPEG/PNG/WebP), preview, original/annotated toggle, threshold sliders (confidence and NMS IoU), detection table, class filters, JSON export and annotated-image export functioning. Handle API offline, invalid upload and no detections without fabricating success.

## UI claim boundaries

- `quality_decision: not_assessed` and human review requirement are permanent for this research build. Don't replace with a green `PASS` for `Good Cap` or zero predictions.
- Dataset stats and per-class AP values must originate from committed `reports/final_summary.json` via `/models`, not hardcoded alternative numbers.
- Confidence scores are model scores, not guaranteed probabilities. A live request latency is one backend call, not a benchmark SLA.
- Label `Broken Ring` is weak on held-out AP50–95; don't omit it from Model Insights.
- Exported JSON should omit large image Base64 while preserving actual detections, provenance, model and thresholds. Exported JPEG must match the backend annotation output.

## Commands, QA and styling

From `frontend/`:

```powershell
npm ci
npm run typecheck
npm run build
npm run dev
```

Do not treat `vite ready` as proof production build passed. Check keyboard access, responsive layout, meaningful errors, loading states, progress and empty states. Preserve the functional project look without an unnecessary design rewrite. No unrelated stock images or fake testing statistics.

The original screenshot is `assets/screenshots/Screenshot 2026-10-28 184458.png`. This is user-observed demonstration evidence and belongs to the portfolio, not a replacement for the held-out test. Do not copy raw dataset photos without confirmed rights.
