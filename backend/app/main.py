"""BottleCap Checker — local FastAPI research inference service."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.inspection import router as inspection_router
from app.api.routes.system import router as system_router

app = FastAPI(
    title="BottleCap Checker API", version="0.1.0",
    description="Research-grade five-class bottle-cap detection, not certified industrial QA.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["GET", "POST"], allow_headers=["*"],
)
app.include_router(system_router)
app.include_router(inspection_router)
