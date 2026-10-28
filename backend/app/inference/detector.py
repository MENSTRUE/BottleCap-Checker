"""YOLOv8 primary model; loads only the trusted local research checkpoint."""
from functools import lru_cache
from threading import Lock
import numpy as np
from PIL import Image
from app.core.config import CLASSES, MODEL_PATH

MODEL_LOCK = Lock()


@lru_cache(maxsize=1)
def get_model():
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Missing model checkpoint: {MODEL_PATH}")
    from ultralytics import YOLO
    model = YOLO(str(MODEL_PATH))
    names = {int(k): str(v) for k, v in model.names.items()}
    expected = dict(enumerate(CLASSES))
    if model.task != "detect" or names != expected:
        raise RuntimeError(f"Model class/task contract mismatch: {names!r}, {model.task!r}")
    return model


def detect(image: Image.Image, confidence: float, iou: float):
    model = get_model()
    with MODEL_LOCK:
        prediction = model.predict(
            source=np.asarray(image.convert("RGB")),
            imgsz=640, conf=confidence, iou=iou, verbose=False,
        )[0]
    rows = []
    boxes = prediction.boxes
    if boxes is not None:
        for box in boxes:
            idx = int(box.cls.item())
            if idx < 0 or idx >= len(CLASSES):
                raise RuntimeError(f"Unexpected class index: {idx}")
            coords = [round(float(v), 2) for v in box.xyxy[0].tolist()]
            rows.append({
                "class_id": idx,
                "class_name": CLASSES[idx],
                "confidence": round(float(box.conf.item()), 6),
                "bbox": dict(zip(("x1", "y1", "x2", "y2"), coords)),
            })
    return sorted(rows, key=lambda row: row["confidence"], reverse=True)
