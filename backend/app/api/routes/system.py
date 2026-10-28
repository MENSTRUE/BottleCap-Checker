"""Health/model endpoints. Research scores are read-only stored evidence."""
import json
from fastapi import APIRouter
from app.core.config import CLASSES, MODEL_PATH, SUMMARY_PATH

router = APIRouter(prefix="/api/v1", tags=["System"])


@router.get("/health")
def health():
    return {"status": "ok", "model_present": MODEL_PATH.is_file(),
            "model_loaded": False, "note": "Health does not run or validate model inference."}


@router.get("/models")
def models():
    summary = None
    if SUMMARY_PATH.is_file():
        try:
            payload = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
            summary = payload.get("heldout_test")
        except (OSError, ValueError):
            pass
    return {
        "task": "object_detection", "name": "BottleCap Checker",
        "checkpoint": "models/bottlecap_primary_best.pt",
        "classes": list(CLASSES), "heldout_test": summary,
        "warning": "Static held-out research metrics are not live prediction accuracy."
    }
