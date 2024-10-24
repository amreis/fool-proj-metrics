import { useState } from "react";
import "./App.css";
import MetricMatrix from "./components/MetricMatrix";
import PostprocessMatrix from "./components/PostprocessMatrix";

function App() {
  const [postprocessCase, setPostprocessCase] = useState({
    k: 51,
    metric: "trustworthiness",
    dataset: "mnist",
    projection: "tsne",
  });

  return (
    <div className="App">
      <MetricMatrix setPostprocessCase={setPostprocessCase}/>
      <PostprocessMatrix caseToShow={postprocessCase} setPostprocessCase={setPostprocessCase} />
    </div>
  );
}

export default App;
