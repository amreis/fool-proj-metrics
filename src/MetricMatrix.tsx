import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { saveSvgAsPng } from "save-svg-as-png";
import {
  METRIC_NAMES,
  NICE_METRIC_NAMES,
  NICE_PROJ_NAMES,
} from "./common/names";
import { PER_METRIC_SCALES } from "./common/scale";
import {
  FoolerDataRow,
  Metrics,
  TargetMetric,
  VisParams,
} from "./common/schema";
import csvData from "./data/per_epoch_for_d3.csv?url";
import "./metricmatrix.css";

const width = 1150;
const cellSize = 56;
const perMetricHeight = cellSize * 4;

function validateAndSetPostprocessCase(
  params: VisParams,
  callbackOnSuccess: (p: VisParams) => void
) {
  const { k, metric, projection, dataset } = params;

  const fURL = new URL(
    "/src/data/compressed/" +
      `p${projection.toLowerCase()}_d${dataset.toLowerCase()}_m${metric.toLowerCase()}_k${k}` +
      ".jpg",
    import.meta.url
  );

  fetch(fURL)
    .then((response) => {
      if (response.ok) {
        callbackOnSuccess(params);
      }
    })
    .catch(() => {
      console.warn(fURL, " not found");
    });
}

function findParamsOfClickedRect(rect: SVGRectElement): VisParams {
  const k = parseInt(
    (document.getElementById("k-param-select") as HTMLSelectElement).value
  );

  let projName = undefined;
  let datasetName = undefined;
  let metricName = undefined;
  let elem: SVGElement | HTMLElement = rect;

  const extractChildTextValue = (node: HTMLElement) =>
    Array.from(node.children).find((n) => n.tagName === "text")!.innerHTML;

  const normalize = (text: string) => text.toLowerCase().replace("-", "");
  while (elem.parentElement) {
    const parent = elem.parentElement as HTMLElement;
    if (!parent.classList) {
      elem = elem.parentElement;
      continue;
    }
    if (parent.classList.contains("per-dataset")) {
      datasetName = normalize(extractChildTextValue(parent));
    } else if (parent.classList.contains("per-metric")) {
      metricName = normalize(extractChildTextValue(parent));
    } else if (parent.classList.contains("per-projection")) {
      projName = normalize(extractChildTextValue(parent));
    }
    elem = elem.parentElement;
  }

  return {
    k,
    dataset: datasetName!,
    metric: metricName! as TargetMetric,
    projection: projName!,
  };
}

function processDiffToOriginalProj(arr: FoolerDataRow[]) {
  const learnedMetrics = arr.find((d) => d.epoch === 1000)!;
  const origMetrics = arr.find((d) => d.epoch === -1)!;

  const diffs = Object.fromEntries(
    Object.keys(learnedMetrics)
      .filter((k): k is keyof Metrics => METRIC_NAMES.includes(k))
      .map((k) => [k, learnedMetrics[k] - origMetrics[k]])
  );
  return diffs;
}

function getLearnedProjMetrics(arr: FoolerDataRow[]) {
  const learnedMetrics = arr.find((d) => d.epoch === 1000)!;
  return Object.fromEntries(
    Object.entries(learnedMetrics).filter(([k]) => METRIC_NAMES.includes(k))
  );
}

const headerHeight = 2.5 * cellSize;

const MetricMatrix = ({
  setPostprocessCase,
}: {
  setPostprocessCase: (p: VisParams) => void;
}) => {
  const headerRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGSVGElement>(null);
  const [kParam, setKParam] = useState(51);
  const [showDiffs, setShowDiffs] = useState(true);

  useEffect(() => {
    d3.csv(csvData, d3.autoType<FoolerDataRow, string>).then((data2) => {
      const data = d3.filter(
        data2,
        (d) => d.k === kParam && (d.epoch === -1 || d.epoch === 1000)
      );
      const groups = d3.groups(
        d3.sort(
          data,
          (d) => d.dataset,
          (d) => d.metric,
          (d) => d.projection
        ),
        (d) => d.dataset,
        (d) => d.metric,
        (d) => d.projection
      );
      const uniqueMetricsInData = ((d) =>
        [...new Set(d.map((row) => row.metric))].length)(data);

      const headerSvg = d3.select(headerRef.current!);
      headerSvg.selectChildren("*").remove();
      headerSvg
        .attr("width", width)
        .attr("height", headerHeight)
        .attr("viewBox", [0, 0, width, headerHeight])
        .classed("metric-matrix-header", true)
        .style("margin-bottom", `-${cellSize / 2}px`);
      headerSvg
        .append("rect")
        .classed("bg", true)
        .attr("width", width - 121.0)
        .attr("transform", "translate(151.0, 0.0)");
      headerSvg
        .selectAll("text")
        .data(METRIC_NAMES)
        .join("text")
        .text((d) => NICE_METRIC_NAMES[d])
        .attr(
          "transform",
          (_d, i) =>
            `translate(${
              151.0 + (i + 0.5) * cellSize
            }, ${headerHeight}) rotate(-45)`
        );

      const svg = d3.select(contentRef.current!);
      svg.selectChildren("*").remove();
      svg
        .attr("width", width)
        .attr("height", perMetricHeight * 30)
        .attr("viewBox", [0, 0, width, perMetricHeight * 30])
        .attr("style", "font: 12px sans-serif;");

      const perDataset = svg
        .selectChildren("g")
        .data(groups)
        .join("g")
        .classed("per-dataset", true)
        .attr(
          "transform",
          (_d, i) =>
            `translate(50.5, ${
              uniqueMetricsInData * perMetricHeight * 1.2 * i + cellSize
            })`
        );
      perDataset
        .append("text")
        .attr("x", -50)
        .attr("y", -5)
        .text(([key]) => key.toUpperCase());

      const perMetric = perDataset
        .selectAll()
        .data(([, values]) => values)
        .join("g")
        .classed("per-metric", true)
        .attr(
          "transform",
          (_d, i) => `translate(0.0, ${perMetricHeight * 1.1 * i})`
        );
      perMetric
        .append("text")
        .attr("text-anchor", "center")
        .attr(
          "transform",
          `translate(0.0, ${perMetricHeight / 2 + cellSize}) rotate(270)`
        )
        .text(([key]) => key.toUpperCase());

      const perProj = perMetric
        .selectAll()
        .data(([, values]) => values)
        .join("g")
        .classed("per-projection", true)
        .attr(
          "transform",
          (_d, i) => `translate(100.5, ${(perMetricHeight / 4) * 1.0 * i})`
        );

      const perProj2 = perProj
        .selectAll()
        .data(([, values]) => {
          const diffs = processDiffToOriginalProj(values);
          const absolutes = getLearnedProjMetrics(values);

          const zipped = d3.zip(
            Object.entries(diffs),
            Object.entries(absolutes)
          );
          return zipped;
        })
        .join("g");
      const rects = perProj2.append("rect");
      rects
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", (_d, i) => i * (1.0 * cellSize))
        .attr("y", 15)
        .classed("metric-val-rect", true)
        .attr("fill", ([[metricName, diff]]) =>
          PER_METRIC_SCALES[metricName](diff)
        )
        .on("dblclick", function () {
          d3.selectAll(".selection-callout").remove();
        })
        .on("click", function () {
          d3.selectAll(".selection-callout").remove();
          const rect = d3.select(this);
          const transform = d3
            .select(this.parentElement!.parentElement!)
            .attr("transform");
          d3.select(this.parentElement!.parentElement!.parentElement)
            .insert("rect", "#last + *")
            .classed("selection-callout", true)
            .attr("fill", "transparent")
            .attr("stroke", "red")
            .attr("stroke-width", "2px")
            .attr("stroke-dasharray", [10])
            .style("pointer-events", "none")
            .attr("x", -cellSize)
            .attr("y", rect.attr("y"))
            .attr("transform", transform)
            .attr("width", 18 * cellSize)
            .attr("height", cellSize);
          validateAndSetPostprocessCase(
            findParamsOfClickedRect(this),
            setPostprocessCase
          );
        })
        .append("title")
        .text((d, _i) => d[0][0]);

      perProj2
        .insert("text", "#first + *")
        .classed("metric-delta-val", true)
        .attr("x", (_d, i) => 10 + i * (1.0 * cellSize))
        .attr("y", 35)
        .attr("fill", "#000")
        .style("font-weight", "bold")
        .style("text-align", "center")
        .text(([[, diff], [, abs]], _i) => {
          const val = showDiffs ? diff : abs;
          return (
            (showDiffs ? (val >= 0 ? "+" : "-") : "") +
            Math.abs(val + 0.0001).toFixed(3)
          );
        });
      perProj2
        .insert("text", "#first + *")
        .classed("metric-ref-val", true)
        .data(([, data]) =>
          Object.entries(data.find((row) => row.epoch === -1)!).filter(
            ([metricName]) => METRIC_NAMES.includes(metricName)
          )
        )
        .attr("x", (_d, i) => 10 + i * (1.0 * cellSize))
        .attr("y", 50)
        .attr("fill", "#000")
        .text((d, _i) => `(${(+d[1]).toFixed(3)})`);
      perProj
        .selectAll()
        .data(([proj]) => [NICE_PROJ_NAMES[proj]])
        .join("text")
        .text((d) => d)
        .attr("transform", "translate(-50.0, 50)");

      perMetric
        .selectAll("rect.metric-callout")
        .data((d) => {
          if (d[0] === "all") {
            return [];
          }
          return [d];
        })
        .enter()
        .append("rect")
        .classed("metric-callout", true)
        .attr("height", perMetricHeight)
        .attr("x", (d) => {
          return cellSize * METRIC_NAMES.indexOf(d[0]) + 100.5;
        })
        .attr("y", 15)
        .attr("width", cellSize);

      d3.selectAll(".per-dataset")
        .selectChild(".per-metric")
        .call((selection) => {
          selection
            .append("rect")
            .classed("metric-callout", true)
            .attr("height", perMetricHeight)
            .attr("x", cellSize * METRIC_NAMES.indexOf("continuity") + 100.5)
            .attr("y", 15)
            .attr("width", cellSize);
        })
        .call((selection) => {
          selection
            .append("rect")
            .classed("metric-callout", true)
            .attr("height", perMetricHeight)
            .attr(
              "x",
              cellSize * METRIC_NAMES.indexOf("trustworthiness") + 100.5
            )
            .attr("y", 15)
            .attr("width", cellSize);
        })
        .call((selection) => {
          selection
            .append("rect")
            .classed("metric-callout", true)
            .attr("height", perMetricHeight)
            .attr("x", cellSize * METRIC_NAMES.indexOf("jaccard") + 100.5)
            .attr("y", 15)
            .attr("width", cellSize);
        })
        .call((selection) => {
          selection
            .append("rect")
            .classed("metric-callout", true)
            .attr("height", perMetricHeight)
            .attr(
              "x",
              cellSize * METRIC_NAMES.indexOf("neighborhood_hit") + 100.5
            )
            .attr("y", 15)
            .attr("width", cellSize);
        });
    });
  }, [kParam, setPostprocessCase, showDiffs]);

  return (
    <div id="main-container">
      <aside
        style={{
          display: "grid",
        }}
      >
        <div>
          <button
            onClick={() => {
              saveSvgAsPng(d3.select("#content-svg").node(), "out.png", {
                backgroundColor: "#FFFFFF",
              });
            }}
          >
            Save as PNG
          </button>
        </div>
        <div>
          <label htmlFor="k-param-select">K = </label>
          <select
            id="k-param-select"
            value={kParam}
            onChange={(e) => setKParam(parseInt(e.target.value))}
          >
            {[1, 7, 21, 51].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          Show:
          <input
            type="radio"
            name="metric-vals-mode"
            checked={showDiffs}
            onChange={() => setShowDiffs(true)}
          />
          Deltas
          <input
            type="radio"
            name="metric-vals-mode"
            checked={!showDiffs}
            onChange={() => setShowDiffs(false)}
          />
          Absolutes
        </div>
      </aside>
      <div id="matrix-container">
        <svg id="header-svg" ref={headerRef} />
        <svg id="content-svg" ref={contentRef} />
      </div>
    </div>
  );
};

export default MetricMatrix;
