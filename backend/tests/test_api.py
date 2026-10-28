"""API smoke tests; mock the detector to avoid pretending model inference passed."""
from io import BytesIO
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_reject_invalid_upload():
    response = client.post("/api/v1/predict", files={"file": ("x.txt", b"hello", "text/plain")})
    assert response.status_code == 415


def test_predict_schema(monkeypatch):
    from app.api.routes import inspection
    monkeypatch.setattr(inspection, "detect", lambda image, confidence, iou: [])
    image = Image.new("RGB", (120, 90), "white")
    buf = BytesIO()
    image.save(buf, format="PNG")
    response = client.post(
        "/api/v1/predict?include_annotated=false",
        files={"file": ("test.png", buf.getvalue(), "image/png")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["detection_count"] == 0
    assert payload["quality_decision"] == "not_assessed"
    assert payload["annotated_image_base64"] is None
