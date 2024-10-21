import { useState, useEffect } from "react";

import "./styles/postprocessmatrix.css";

const K_VALS = [1, 7, 21, 51];
const TARGET_METRICS = ["trustworthiness", "continuity", "jaccard", "neighborhood_hit"].sort();
const PROJECTIONS = ["tsne", "umap", "mds", "isomap"].sort();
const DATASETS = ["mnist", "fashionmnist", "spambase", "har", "reuters", "usps"].sort();

const Controls = ({ updateMatrix, params }) => {
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
        updateMatrix({
            k: kParam,
            metric: metricParam,
            projection: projectionParam,
            dataset: datasetParam,
        });
    }, [updateMatrix, kParam, metricParam, projectionParam, datasetParam]);

    return (
        <>
            <div
                className="paramsPanel"
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gridAutoRows: "3vh",
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
                        value={kParamInit}
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
                        id="metric-param-select"
                        onChange={(e) => setMetricParam(e.target.value)}
                        value={metricParamInit}
                    >
                        {TARGET_METRICS.map((v) => (
                            <option key={v} value={v}>
                                {v}
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
                        value={projectionParamInit}
                    >
                        {PROJECTIONS.map((v) => (
                            <option key={v} value={v}>
                                {v}
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
                        value={datasetParamInit}
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

const PostprocessMatrix = ({ caseToShow, setPostprocessCase }) => {
    return (
        <>
            <Controls updateMatrix={setPostprocessCase} params={caseToShow} />
            <svg id="main" height={"500"} viewBox={[0, 0, 1600, 500]} style={{ width: "99vw" }}>
                <image
                    x={0}
                    y={0}
                    width={"100%"}
                    href={require("../data/compressed/" +
                        `p${caseToShow.projection.toLowerCase()}` +
                        `_d${caseToShow.dataset.toLowerCase()}` +
                        `_m${caseToShow.metric.toLowerCase()}` +
                        `_k${caseToShow.k}` +
                        ".jpg")}
                    // style={{
                    //     width: "100vw",
                    // }}
                    height={500}
                    alt="Original projection next to generated projections."
                />
            </svg>
        </>
    );
};

export default PostprocessMatrix;
