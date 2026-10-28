"""Upload checks and optional annotated image generation."""
import base64
from io import BytesIO
from fastapi import HTTPException, UploadFile
from PIL import Image, ImageDraw, ImageOps, UnidentifiedImageError
from app.core.config import ALLOWED_MIME, MAX_IMAGE_PIXELS, MAX_UPLOAD_BYTES

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


async def read_upload(file: UploadFile) -> Image.Image:
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(415, "Only JPEG, PNG and WebP images are supported")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(400, "Empty upload")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Upload exceeds 10 MiB")
    try:
        with Image.open(BytesIO(data)) as source:
            if source.format not in ("JPEG", "PNG", "WEBP"):
                raise HTTPException(415, "Uploaded bytes are not JPEG, PNG or WebP")
            if source.width * source.height > MAX_IMAGE_PIXELS:
                raise HTTPException(413, "Image exceeds pixel limit")
            source.load()
            return ImageOps.exif_transpose(source).convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(422, "Invalid or unreadable image") from exc


def render_annotations(image: Image.Image, detections: list[dict]) -> str:
    canvas = image.copy()
    painter = ImageDraw.Draw(canvas)
    for detection in detections:
        box = detection["bbox"]
        painter.rectangle(
            (box["x1"], box["y1"], box["x2"], box["y2"]),
            outline="#29c4a5", width=max(2, image.width // 320),
        )
        text = f'{detection["class_name"]} {detection["confidence"]:.2f}'
        painter.text((box["x1"], max(0, box["y1"] - 15)), text, fill="#29c4a5")
    buffer = BytesIO()
    canvas.save(buffer, format="JPEG", quality=88)
    return base64.b64encode(buffer.getvalue()).decode("ascii")
