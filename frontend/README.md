# BottleCap Checker — React/TypeScript/Vite dashboard

Local application for showing **real** five-class YOLOv8n predictions from FastAPI. This UI supports human visual review; it does not classify entire packages as accepted/rejected.

## Run

Prerequisites: Node.js 20+ and running backend on `127.0.0.1:8000` with the trained `.pt` file present. In two separate PowerShell terminals:

```powershell
# Backend
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

```powershell
# Frontend
cd "D:\porto\100 day\day 23\BottleCap-Checker\frontend"
npm ci
npm run typecheck
npm run build
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to `127.0.0.1:8000` by `vite.config.ts`. Optional `VITE_API_BASE_URL` in `.env.local` changes client `/api/v1` base, but cannot safely contain secrets (Vite variables are exposed to frontend JS).

## Implemented pages and features

- **Overview:** research dataset split counts, held-out performance and project context.
- **AI Inspection:** upload/drag-drop/replacement for JPEG, PNG, WebP (10 MiB max), original/annotated toggle, confidence/IoU sliders, live predictions, per-class summary, filterable detection table, JSON and annotated JPEG export.
- **Model Insights:** stored test metrics and class-level AP50–95 including **Broken Ring** weakness. These are research scores, not live accuracy.
- **System status:** backend `/health` and model presence check. The API's `model_loaded: false` is a static field in the current health route, not a load failure indicator.

`src/services/api.ts` calls `/api/v1/health`, `/api/v1/models`, `/api/v1/predict` and sends multipart `file`, `confidence`, `iou`, `include_annotated=true`. Contract is typed in `src/types/api.ts`; changes require syncing with backend. Annotated JPEG comes from backend Base64 field. No dummy detections or inferred scores allowed.

## Evidence and limitations

A user-provided local browser screenshot (`../assets/screenshots/Screenshot 2026-10-28 184458.png`) records one `Loose Cap` detection (~89.5% displayed confidence, ~59.1 ms). This is smoke-test evidence, not five-class held-out performance. UI must preserve `quality_decision: not_assessed`, human review and clear zero-result handling. Exported JSON documents observed model output, not a certified quality verdict.

## Troubleshooting

- **API Offline:** verify backend route `http://127.0.0.1:8000/api/v1/health`, start its terminal, and check other apps aren't occupying port 8000.
- **503:** checkpoint missing/mismatched, model-load error or inference exception; inspect backend terminal.
- **413/415/422:** invalid/mismatched or oversized image; re-encode as real JPEG/PNG/WebP under limits.
- **Build errors:** `npm ci`, `npm run typecheck`, `npm run build`; keep `src/vite-env.d.ts` in project.
- **No boxes:** lower threshold for diagnosis, log original evidence and inspect the model's weak classes. Zero boxes is not product approval.
- **Download mismatch:** ensure backend response includes optional annotated Base64; the JSON export should avoid embedding huge images.

## Deployment considerations

`npm run dev` is for local research. Build assets via `npm run build` for potential static hosting and add secure reverse proxy, TLS/authentication, backend origin restrictions, rate limits and privacy retention rules before any production use. See [Deployment](../docs/DEPLOYMENT.md), [Claims](../docs/CLAIM_BOUNDARIES.md) and [scoped AGENTS](AGENTS.md).
