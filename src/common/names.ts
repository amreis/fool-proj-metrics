import { Metrics } from "./schema";

type MetricNamesObject = Record<Exclude<keyof Metrics, "missing_neighbors">, undefined>;

const metricNamesProps: MetricNamesObject = {
  average_local_error: undefined,
  class_aware_continuity: undefined,
  class_aware_trustworthiness: undefined,
  continuity: undefined,
  distance_consistency: undefined,
  false_neighbors: undefined,
  jaccard: undefined,
  mrre_data: undefined,
  mrre_proj: undefined,
  neighborhood_hit: undefined,
  normalized_stress: undefined,
  pearson_correlation: undefined,
  procrustes: undefined,
  scale_normalized_stress: undefined,
  shepard_goodness: undefined,
  true_neighbors: undefined,
  trustworthiness: undefined,
};

export const METRIC_NAMES = Object.keys(metricNamesProps) as (keyof MetricNamesObject)[];

export const NICE_METRIC_NAMES: { [k in keyof MetricNamesObject | "all"]: string } = {
  average_local_error: "Avg. Local Error",
  class_aware_continuity: "Class-Aware Continuity",
  class_aware_trustworthiness: "Class-Aware Trustworthiness",
  continuity: "Continuity",
  distance_consistency: "Distance Consistency",
  false_neighbors: "False Neighbors",
  jaccard: "Jaccard",
  // "missing_neighbors",
  mrre_data: "MRRE Data",
  mrre_proj: "MRRE Projection",
  neighborhood_hit: "Neighborhood Hit",
  normalized_stress: "Normalized Stress",
  pearson_correlation: "Pearson R",
  procrustes: "Procrustes",
  scale_normalized_stress: "Scale-Normalized Stress",
  shepard_goodness: "Shepard Goodness",
  true_neighbors: "True Neighbors",
  trustworthiness: "Trustworthiness",
  all: "ALL",
};

export const NICE_PROJ_NAMES: { [k: string]: string } = {
  tsne: "t-SNE",
  mds: "MDS",
  isomap: "Isomap",
  umap: "UMAP",
};
