import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { NICE_METRIC_NAMES, NICE_PROJ_NAMES } from "./common/names.js";
import { PER_METRIC_SCALES } from "./common/scale.js";
import {
  FoolerDataRow,
  PostprocessDataRow,
  TargetMetric,
  VisParams,
} from "./common/schema.js";
import csvFooler from "./data/per_epoch_for_d3.csv?url";
import csvPostprocess from "./data/postprocess_for_d3.csv?url";
// const csvFooler = (await import("./data/per_epoch_for_d3.csv?url")).default;
// const csvPostprocess = (await import("./data/postprocess_for_d3.csv?url"))
  // .default;
import "./postprocessmatrix.css";

const K_VALS = [1, 7, 21, 51];
const TARGET_METRICS: TargetMetric[] = (
  [
    "trustworthiness",
    "continuity",
    "jaccard",
    "neighborhood_hit",
    "all",
  ] as TargetMetric[]
).sort();
// type TARGET_METRICS =
//   | "all"
//   | "continuity"
//   | "jaccard"
//   | "neighborhood_hit"
//   | "trustworthiness";

const PROJECTIONS = ["tsne", "umap", "mds", "isomap"].sort();
const DATASETS = [
  "mnist",
  "fashionmnist",
  "spambase",
  "har",
  "reuters",
  "usps",
].sort();
const POSTPROCESS_IDS = ["projnn", "truenn", "delaunay"];

const Controls = ({
  updateMatrix,
  params,
}: {
  updateMatrix: (p: VisParams) => void;
  params: VisParams;
}) => {
  const {
    k: kParamInit,
    metric: metricParamInit,
    dataset: datasetParamInit,
    projection: projectionParamInit,
  } = params;

  const [kParam, setKParam] = useState(kParamInit);
  const [metricParam, setMetricParam] = useState(metricParamInit);
  const [projectionParam, setProjectionParam] = useState(projectionParamInit);
  const [datasetParam, setDatasetParam] = useState(datasetParamInit);

  useEffect(() => {
    const {
      k: kParamInit,
      metric: metricParamInit,
      dataset: datasetParamInit,
      projection: projectionParamInit,
    } = params;
    setKParam(kParamInit);
    setMetricParam(metricParamInit);
    setProjectionParam(projectionParamInit);
    setDatasetParam(datasetParamInit);
  }, [params]);

  useEffect(() => {
    const url = new URL(
      "/src/data/compressed" +
        `p${projectionParam.toLowerCase()}` +
        `_d${datasetParam.toLowerCase()}` +
        `_m${metricParam.toLowerCase()}` +
        `_k${kParam}` +
        ".jpg",
      import.meta.url
    );

    fetch(url)
      .then(() => {
        updateMatrix({
          k: kParam,
          metric: metricParam,
          projection: projectionParam,
          dataset: datasetParam,
        });
      })
      .catch(() => {
        console.log("file doesnt exist");
      });
  }, [updateMatrix, kParam, metricParam, projectionParam, datasetParam]);

  return (
    <>
      <div
        className="paramsPanel"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gridAutoRows: "fit-content(3vh)",
          width: "20%",
        }}
      >
        <div>
          <label htmlFor="postprocessk-param-select">K = </label>
        </div>
        <div>
          <select
            id="postprocessk-param-select"
            onChange={(e) => setKParam(parseInt(e.target.value))}
            value={kParam}
          >
            {K_VALS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="metric-param-select">Metric = </label>
        </div>
        <div>
          <select
            typeof="TargetMetric"
            id="metric-param-select"
            onChange={(e) => setMetricParam(e.target.value as TargetMetric)}
            value={metricParam}
          >
            {TARGET_METRICS.map((v) => (
              <option key={v} value={v}>
                {NICE_METRIC_NAMES[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="projection-param-select">Projection = </label>
        </div>
        <div>
          <select
            id="projection-param-select"
            onChange={(e) => setProjectionParam(e.target.value)}
            value={projectionParam}
          >
            {PROJECTIONS.map((v) => (
              <option key={v} value={v}>
                {NICE_PROJ_NAMES[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dataset-param-select">Dataset = </label>
        </div>
        <div>
          <select
            id="dataset-param-select"
            onChange={(e) => setDatasetParam(e.target.value)}
            value={datasetParam}
          >
            {DATASETS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

const PostprocessMatrix = ({
  caseToShow,
  setPostprocessCase,
}: {
  caseToShow: VisParams;
  setPostprocessCase: (p: VisParams) => void;
}) => {
  caseToShow;
  const [postprocessData, setPostprocessData] =
    useState<Array<PostprocessDataRow> | null>(null);
  const [foolerData, setFoolerData] = useState<Array<FoolerDataRow> | null>(
    null
  );
  const ref = useRef<SVGSVGElement>(null);
  const svgWidth = 1600;

  useEffect(() => {
    d3.csv(csvFooler, d3.autoType<FoolerDataRow, string>).then((v) =>
      setFoolerData(v.filter((d) => d.epoch === 1000 || d.epoch === -1))
    );
    d3.csv(csvPostprocess, d3.autoType<PostprocessDataRow, string>).then((v) =>
      setPostprocessData(v)
    );
  }, []);

  useEffect(() => {
    const cellSize = 56;
    if (postprocessData === null || foolerData === null) {
      return;
    }
    const rootSvg = d3.select(ref.current!);
    rootSvg.selectChildren("g").remove();
    rootSvg.style("font", "12px sans-serif");
    if (caseToShow.metric === "all") {
      return;
    }
    const relevantTuples: (PostprocessDataRow | FoolerDataRow)[] = [
      ...foolerData.filter((d) => {
        const { k, projection, dataset, metric } = caseToShow;
        return (
          d.epoch === 1000 &&
          k === d.k &&
          projection === d.projection &&
          dataset === d.dataset &&
          metric === d.metric
        );
      }),
      ...postprocessData.filter((d) => {
        const { k, projection, dataset, metric } = caseToShow;
        return (
          POSTPROCESS_IDS.includes(d.method) &&
          k === d.k &&
          projection === d.projection &&
          dataset === d.dataset &&
          metric === d.metric
        );
      }),
    ];
    const refTuple = foolerData.find(
      (d) =>
        d.epoch === -1 &&
        caseToShow.k === d.k &&
        caseToShow.projection === d.projection &&
        caseToShow.dataset === d.dataset &&
        caseToShow.metric === d.metric
    )!;
    if (refTuple.metric === "all") {
      // TODO. needs special treatment.
      return;
    }

    {
      const g = rootSvg.append("g");
      const refVal = refTuple[refTuple.metric];
      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("fill", PER_METRIC_SCALES[refTuple.metric](refVal))
        .append("title")
        .text(refTuple.metric);
      g.insert("text", "#first + *")
        .classed("metric-delta-val", true)
        .attr("x", 10)
        .attr("y", 28)
        .attr("fill", "#000000")
        .style("font-weight", "bold")
        .text(Math.abs(refVal + 0.0001).toFixed(3));
    }

    function processRow(row: PostprocessDataRow, colIx: number) {
      const g = rootSvg.append("g");
      if (row.metric === "all") {
        return;
      }
      const diffToRef = row[row.metric] - refTuple[row.metric];
      g.append("rect")
        .attr("x", (1 + colIx) * (1600 / 5))
        .attr("y", 0)
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("fill", PER_METRIC_SCALES[row.metric](diffToRef))
        .append("title")
        .text(row.metric);
      g.insert("text", "#first + *")
        .classed("metric-delta-val", true)
        .attr("x", 10 + ((1 + colIx) * 1600) / 5)
        .attr("y", 28)
        .attr("fill", "#000000")
        .style("font-weight", "bold")
        .text(
          (diffToRef >= 0 ? "+" : "-") + Math.abs(diffToRef + 0.0001).toFixed(3)
        );
    }

    const row = relevantTuples[0] as PostprocessDataRow;
    processRow(row, 0);
    POSTPROCESS_IDS.forEach((iMethod, ix) => {
      const row = relevantTuples
        .filter(
          (row): row is PostprocessDataRow =>
            (row as PostprocessDataRow).method !== undefined
        )
        .find((row) => row.method === iMethod)!;

      processRow(row, ix + 1);
    });
  }, [postprocessData, foolerData, caseToShow]);
  return (
    <div id="postprocess-part">
      <div id="postprocmatrix-container">
        <svg id="postprocmatrix" viewBox={`0, 0, ${svgWidth}, 400`} ref={ref}>
          <image
            x={0}
            y={28}
            width={"100%"}
            href={
              new URL(
                "/src/data/compressed/" +
                  `p${caseToShow.projection.toLowerCase()}` +
                  `_d${caseToShow.dataset.toLowerCase()}` +
                  `_m${caseToShow.metric.toLowerCase()}` +
                  `_k${caseToShow.k}` +
                  ".jpg",
                import.meta.url
              ).href
            }
          />
        </svg>
      </div>
      <Controls updateMatrix={setPostprocessCase} params={caseToShow} />
    </div>
  );
};

export default PostprocessMatrix;
