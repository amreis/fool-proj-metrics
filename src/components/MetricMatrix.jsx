import * as d3 from "d3";
import { saveSvgAsPng } from "save-svg-as-png";
import { useEffect, useRef, useState } from "react";
import "./styles/metricmatrix.css";
import csvData from "../data/per_epoch_for_d3.csv";
import { PER_METRIC_SCALES } from "../common/scale";

const width = 1150;
const cellSize = 56;
const height = cellSize * 4;

/**
 * @param {SVGRectElement} rect
 */
function findParamsOfClickedRect(rect) {
    const k = parseInt(document.getElementById("k-param-select").value);

    let projName = undefined;
    let datasetName = undefined;
    let metricName = undefined;
    let elem = rect;

    const extractChildTextValue = (node) =>
        node.childNodes.entries().find(([_i, n]) => n.tagName === "text")[1].innerHTML;

    while (elem.parentNode) {
        let parent = elem.parentNode;
        if (!parent.classList) {
            elem = elem.parentNode;
            continue;
        }
        if (parent.classList.contains("per-dataset")) {
            datasetName = extractChildTextValue(parent).toLowerCase().replace("-", "");
        } else if (parent.classList.contains("per-metric")) {
            metricName = extractChildTextValue(parent).toLowerCase().replace("-", "");
        } else if (parent.classList.contains("per-projection")) {
            projName = extractChildTextValue(parent).toLowerCase().replace("-", "");
        }
        elem = elem.parentNode;
    }

    return { k, dataset: datasetName, metric: metricName, projection: projName };
}

const METRIC_NAMES = [
    "average_local_error",
    "class_aware_continuity",
    "class_aware_trustworthiness",
    "continuity",
    "distance_consistency",
    "false_neighbors",
    "jaccard",
    "mrre_data",
    "mrre_proj",
    "neighborhood_hit",
    "normalized_stress",
    "pearson_correlation",
    "procrustes",
    "scale_normalized_stress",
    "shepard_goodness",
    "true_neighbors",
    "trustworthiness",
];

const NICE_METRIC_NAMES = {
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
};
const NICE_PROJ_NAMES = {
    tsne: "t-SNE",
    mds: "MDS",
    isomap: "Isomap",
    umap: "UMAP",
};
/**
 * @param {Array<object>} arr
 */
function processDiffToOriginalProj(arr) {
    const learnedMetrics = arr.find((d) => d.epoch === 1000);
    const origMetrics = arr.find((d) => d.epoch === -1);

    const diffs = Object.fromEntries(
        Object.keys(learnedMetrics)
            .filter((k) => METRIC_NAMES.includes(k))
            .map((k) => [k, learnedMetrics[k] - origMetrics[k]])
    );
    return diffs;
}
const headerHeight = 2.5 * cellSize;

const MetricMatrix = ({ setPostprocessCase }) => {
    const headerRef = useRef();
    const contentRef = useRef();
    const [kParam, setKParam] = useState(1);

    useEffect(() => {
        d3.csv(csvData, d3.autoType).then((data2) => {
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

            const headerSvg = d3.select(headerRef.current);
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
                        `translate(${151.0 + (i + 0.5) * cellSize}, ${headerHeight}) rotate(-45)`
                );

            const svg = d3.select(contentRef.current);
            svg.selectChildren("*").remove();
            svg.attr("width", width)
                .attr("height", height * 30)
                .attr("viewBox", [0, 0, width, height * 30])
                .attr("style", "font: 12px sans-serif;");

            const perDataset = svg
                .selectChildren("g")
                .data(groups)
                .join("g")
                .classed("per-dataset", true)
                .attr(
                    "transform",
                    (_d, i) => `translate(50.5, ${4 * height * 1.2 * i + cellSize})`
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
                .attr("transform", (_d, i) => `translate(0.0, ${height * 1.1 * i})`);
            perMetric
                .append("text")
                .attr("text-anchor", "center")
                .attr("transform", `translate(0.0, ${height / 2 + cellSize}) rotate(270)`)
                .text(([key]) => key.toUpperCase());

            const perProj = perMetric
                .selectAll()
                .data(([, values]) => values)
                .join("g")
                .classed("per-projection", true)
                .attr("transform", (_d, i) => `translate(100.5, ${(height / 4) * 1.0 * i})`);

            const perProj2 = perProj
                .selectAll()
                .data(([, values]) => Object.entries(processDiffToOriginalProj(values)))
                .join("g");
            const rects = perProj2.append("rect");
            rects
                .attr("width", cellSize - 1)
                .attr("height", cellSize - 1)
                .attr("x", (_d, i) => i * (1.0 * cellSize))
                .attr("y", 15)
                .classed("metric-val-rect", true)
                .attr("fill", ([metricName, val]) => PER_METRIC_SCALES[metricName](val))
                .on("dblclick", function (e, d) {
                    d3.selectAll("rect.active").classed("active", false);
                })
                .on("click", function (e, d) {
                    d3.selectAll("rect.active").classed("active", false);
                    d3.select(this).classed("active", true);
                    setPostprocessCase(findParamsOfClickedRect(this));
                })
                .append("title")
                .text((d, _i) => d[0]);

            perProj2
                .insert("text", "#first + *")
                .classed("metric-delta-val", true)
                .attr("x", (_d, i) => 10 + i * (1.0 * cellSize))
                .attr("y", 35)
                .attr("fill", "#000")
                .style("font-weight", "bold")
                .text((d, _i) => (d[1] >= 0 ? "+" : "-") + Math.abs(d[1] + 0.0001).toFixed(3));
            perProj2
                .insert("text", "#first + *")
                .classed("metric-ref-val", true)
                .data(([, data]) =>
                    Object.entries(data.find((row) => row.epoch === -1)).filter(([metricName]) =>
                        METRIC_NAMES.includes(metricName)
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
                .append("rect")
                .classed("metric-callout", true)
                .attr("height", 4 * cellSize)
                .attr("x", ([key]) => cellSize * METRIC_NAMES.indexOf(key) + 100.5)
                .attr("y", 15)
                .attr("width", cellSize);
        });
    }, [kParam, setPostprocessCase]);

    return (
        <div id="main-container">
            <aside
                style={{
                    display: "grid",
                }}
            >
                <div>
                    <button
                        onClick={(e) => {
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
            </aside>
            <div id="matrix-container">
                <svg id="header-svg" ref={headerRef} />
                <svg id="content-svg" ref={contentRef} />
            </div>
        </div>
    );
};

export default MetricMatrix;
