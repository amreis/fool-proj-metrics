export interface Metrics {
  average_local_error: number;
  class_aware_continuity: number;
  class_aware_trustworthiness: number;
  continuity: number;
  distance_consistency: number;
  false_neighbors: number;
  jaccard: number;
  missing_neighbors: number;
  mrre_data: number;
  mrre_proj: number;
  neighborhood_hit: number;
  normalized_stress: number;
  pearson_correlation: number;
  procrustes: number;
  scale_normalized_stress: number;
  shepard_goodness: number;
  true_neighbors: number;
  trustworthiness: number;
}

export interface FoolerDataRow extends Metrics {
  epoch: number;
  dataset: string;
  k: number;
  metric: keyof Metrics | "all";
  projection: string;
}

export interface PostprocessDataRow extends Metrics, FoolerDataRow {
  method: string;
}

export type TargetMetric =
  | "trustworthiness"
  | "continuity"
  | "jaccard"
  | "neighborhood_hit"
  | "all";

export interface VisParams {
  dataset: string;
  k: number;
  metric: TargetMetric;
  projection: string;
}
