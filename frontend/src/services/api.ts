import type { Health, ModelInfo, Prediction } from '../types/api';

const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    let message = `HTTP ${response.status}`;
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === 'string') message += `: ${detail}`;
      else if (detail !== undefined) message += `: ${JSON.stringify(detail)}`;
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function getHealth(signal?: AbortSignal): Promise<Health> {
  return parseResponse<Health>(await fetch(`${base}/health`, { signal }));
}
export async function getModel(signal?: AbortSignal): Promise<ModelInfo> {
  return parseResponse<ModelInfo>(await fetch(`${base}/models`, { signal }));
}
export async function predict(
  image: File,
  confidence: number,
  iou: number,
  signal?: AbortSignal,
): Promise<Prediction> {
  const form = new FormData();
  form.set('file', image);
  const params = new URLSearchParams({
    confidence: confidence.toFixed(2),
    iou: iou.toFixed(2),
    include_annotated: 'true',
  });
  return parseResponse<Prediction>(await fetch(`${base}/predict?${params}`, {
    method: 'POST', body: form, signal,
  }));
}
