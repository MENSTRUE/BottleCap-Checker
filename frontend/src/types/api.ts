export const CLASSES = ['Broken Cap', 'Broken Ring', 'Good Cap', 'Loose Cap', 'No Cap'] as const;
export type BottleClass = (typeof CLASSES)[number];
export type BoundingBox = { x1: number; y1: number; x2: number; y2: number };
export type Detection = {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
};
export type Prediction = {
  pipeline: string;
  model: string;
  image: { width: number; height: number };
  thresholds: { confidence: number; iou: number };
  detections: Detection[];
  detection_count: number;
  class_counts: Record<string, number>;
  inference_ms: number;
  annotated_image_base64: string | null;
  quality_decision: 'not_assessed';
  requires_human_review: boolean;
  note: string;
};
export type Health = { status: string; model_present: boolean; model_loaded: boolean; note: string };
export type ResearchMetrics = {
  split?: string;
  precision?: number;
  recall?: number;
  map50?: number;
  map50_95?: number;
  dataset_images?: number;
  per_class_map50_95?: Record<string, number>;
};
export type ModelInfo = {
  task: string;
  name: string;
  checkpoint: string;
  classes: string[];
  heldout_test: ResearchMetrics | null;
  warning: string;
};
