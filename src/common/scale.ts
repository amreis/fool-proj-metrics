import * as d3 from "d3";

const DEFAULT_INTERPOLATOR = d3.piecewise(
  d3.schemeRdBu[5].slice(Math.floor(5 / 2) - 1, Math.floor(5 / 2) + 2)
);

type Scale = (n: number) => ReturnType<d3.ScaleDiverging<number>>;

function clip(x: number, min: number, max: number): number {
  return x <= min ? min : x >= max ? max : x;
}
function lowerIsBetterScale(interpolator = DEFAULT_INTERPOLATOR): Scale {
  return (x: number) => d3.scaleDiverging([1, 0, -1], interpolator)(clip(x, -3, 3));
}
function higherIsBetterScale(interpolator = DEFAULT_INTERPOLATOR): Scale {
  return (x: number) => d3.scaleDiverging([-1, 0, 1], interpolator)(clip(x, -3, 3));
}
export const PER_METRIC_SCALES: { [k: string]: Scale } = {
  class_aware_continuity: higherIsBetterScale(),
  class_aware_trustworthiness: higherIsBetterScale(),
  continuity: higherIsBetterScale(),
  distance_consistency: higherIsBetterScale(),
  jaccard: higherIsBetterScale(),
  neighborhood_hit: higherIsBetterScale(),
  pearson_correlation: higherIsBetterScale(),
  shepard_goodness: higherIsBetterScale(),
  true_neighbors: higherIsBetterScale(),
  trustworthiness: higherIsBetterScale(),
  average_local_error: lowerIsBetterScale(),
  false_neighbors: lowerIsBetterScale(),
  missing_neighbors: lowerIsBetterScale(),
  mrre_data: lowerIsBetterScale(),
  mrre_proj: lowerIsBetterScale(),
  normalized_stress: lowerIsBetterScale(),
  procrustes: lowerIsBetterScale(),
  scale_normalized_stress: lowerIsBetterScale(),
};
