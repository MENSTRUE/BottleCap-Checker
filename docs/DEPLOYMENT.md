# Deployment guide and production-readiness gap

## Supported current deployment: local development only

The repo presently contains **two development servers**, not a hosted production product. The Python API serves the trusted local `models/bottlecap_primary_best.pt` using Ultralytics; the React/Vite frontend proxies `/api` to `http://127.0.0.1:8000`. This is sufficient for controlled demonstrations and exploratory research testing.

### Terminal A (PowerShell)

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal B

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\frontend"
npm ci
npm run build
npm run dev
```

Visit `http://127.0.0.1:5173`, `/api/v1/health`, `/api/v1/models`, and Swagger `/docs` (backend origin). The Vite `.env.local` can supply `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1` if needed for another local setup, but that may require updating CORS and should not contain secrets.

## Production is not a switch

Do not expose `uvicorn --reload` and Vite `npm run dev` publicly. The current FastAPI service has no authentication, no authorization, no quotas, no persistent audit trail, no deployment manifests, no observability baseline, and no certified factory integration. A green `API Connected` badge does not validate those properties.

Before any real network deployment, plan and verify:

| Area | Required independent work | Why |
|---|---|---|
| Identity and authorization | Authentication + appropriate per-user/service permissions | Untrusted access to inference endpoint |
| HTTPS / ingress | TLS, secure reverse proxy, network policies | Protect uploaded factory imagery |
| Size, rate and compute control | Rate limits, queues, max concurrency and worker caps | CPU/GPU exhaustion and abusive uploads |
| Model supply chain | Verify model SHA-256 and approved artifacts, do not accept user-provided `.pt` | Unsafe serialization/model tampering |
| Origin policy | Strict CORS allowlist and CSRF/security review where relevant | Cross-origin browser behavior (CORS **not auth**) |
| Data handling | Decide image retention, access logging, anonymization and privacy rights | Uploaded images may reveal private/industrial information |
| Reliability | Container pinning, health/readiness distinction, rollback and error budgets | Service uptime and safe failure behavior |
| Observability | Structured metrics, versioned model IDs, drift detection, alerts | Distinguish model failure from process failure |
| Quality governance | Site-specific ground truth, calibrated criteria and human override | Avoid unjustified automated accept/reject decisions |
| Licensing | Verify dataset/model/dependency permissions and attribution | MIT repository license isn't universal rights |

## Possible future architecture (not deployed)

A production-like build might use static compiled React assets behind a reverse proxy and a separately secured ASGI inference service. Constrain inbound file sizes at ingress **and** application layer, load models during a controlled readiness step, and separate runtime credentials. GPUs and horizontal scaling require explicit memory/concurrency testing.

## Runtime and performance contracts

The service loads a `.pt` checkpoint lazily and serializes in-process inference with a lock. Higher worker count may multiply model memory usage, so benchmark before raising it. A local screenshot showing ~59.1 ms on one image is not a p95 latency, fps number, hardware-agnostic throughput or SLA. ONNX is exported but not deployed; benchmark/prediction parity must be established before changing engines.

## Deployment verification / rollback

Record Git commit, checkpoint hash, image source policy, Python dependency lock or exact hashes, frontend lockfile, host CPU/GPU specs, API schema revision, smoke-test snapshots, access policy, and rollback procedure. Perform a staged, supervised rollout. Fail safely: if any detection or service error occurs, do not autonomously accept packages.
