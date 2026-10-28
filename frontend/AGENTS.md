# Frontend agent guidance

- Source of truth: the existing backend routes and `reports/final_summary.json`; never invent AI predictions or dynamic accuracy.
- Preserve five classes and class IDs in `src/types/api.ts`.
- Keep score semantics accurate. No automated pass/fail, accept/reject, safety certification, or fabricated assurance.
- Keep HTTP requests in `src/services/api.ts` and reuse typed schemas.
- `npm run build` and `npm run typecheck` must both pass for source changes.
- Do not silently alter CORS, checkpoint paths, dataset licenses, metrics, or test split descriptions.
- Upload images only on explicit user interaction; never persist or transmit them to external providers by default.
- Preserve accessibility labels, keyboard navigation and responsive layouts.
