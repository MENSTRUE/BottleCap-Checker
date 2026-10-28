"""Image inspection endpoint; no automated manufacturing verdict."""
import logging
import time
from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from app.inference.detector import detect
from app.services.images import read_upload, render_annotations

router = APIRouter(prefix="/api/v1", tags=["Inspection"])
logger = logging.getLogger(__name__)


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    confidence: float = Query(0.25, ge=0.01, le=1.0),
    iou: float = Query(0.45, ge=0.01, le=1.0),
    include_annotated: bool = Query(True),
):
    image = await read_upload(file)
    started = time.perf_counter()
    try:
        results = detect(image, confidence=confidence, iou=iou)
    except FileNotFoundError as exc:
        logger.exception("Model missing")
        raise HTTPException(503, "Local model checkpoint is missing") from exc
    except Exception as exc:
        logger.exception("Detection failed")
        raise HTTPException(503, "Inference failed; consult backend logs") from exc
    elapsed = round(1000 * (time.perf_counter() - started), 2)
    counts = {name: sum(d["class_name"] == name for d in results)
              for name in ("Broken Cap", "Broken Ring", "Good Cap", "Loose Cap", "No Cap")}
    return {
        "pipeline": "bottlecap_yolov8n", "model": "bottlecap_primary_best.pt",
        "image": {"width": image.width, "height": image.height},
        "thresholds": {"confidence": confidence, "iou": iou},
        "detections": results, "detection_count": len(results),
        "class_counts": counts, "inference_ms": elapsed,
        "annotated_image_base64": render_annotations(image, results) if include_annotated else None,
        "quality_decision": "not_assessed", "requires_human_review": True,
        "note": "Detection labels are research observations, not an automatic accept/reject decision. Good Cap detections do not certify the whole package."
    }
