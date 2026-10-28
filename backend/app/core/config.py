"""Runtime configuration for local research deployment."""
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_PATH = PROJECT_ROOT / "models" / "bottlecap_primary_best.pt"
SUMMARY_PATH = PROJECT_ROOT / "reports" / "final_summary.json"
CLASSES = ("Broken Cap", "Broken Ring", "Good Cap", "Loose Cap", "No Cap")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
ALLOWED_MIME = frozenset({"image/jpeg", "image/png", "image/webp"})
