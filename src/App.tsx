import { useState } from "react";
import "./App.css";
import PostprocessMatrix from "./PostprocessMatrix.js";
import MetricMatrix from "./MetricMatrix.js";
import { TargetMetric, VisParams } from "./common/schema.js";
import Description from "./description.tsx";

function App() {
  const [postprocessCase, setPostprocessCase] = useState<VisParams>({
    k: 51,
    metric: "trustworthiness" as TargetMetric,
    dataset: "mnist",
    projection: "tsne",
  });

  return (
    <>
      <Description />
      <div className="App">
        <MetricMatrix setPostprocessCase={setPostprocessCase} />
        <PostprocessMatrix caseToShow={postprocessCase} setPostprocessCase={setPostprocessCase} />
      </div>
    </>
  );
}

export default App;
