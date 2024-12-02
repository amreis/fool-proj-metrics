import { useEffect, useRef } from "react";
import styles from "./styles/description.module.css";
import * as d3 from "d3";
import { higherIsBetterScale } from "./common/scale";

function Description() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const CELL_SIZE = 12;

    if (svg === null) return;

    d3.select(svg).selectChildren("*").remove();
    const svgSelection = d3.select(svg);

    svgSelection
      .append("text")
      .text("DATASET1")
      .attr("x", 20)
      .attr("y", 20)
      .attr("font-size", 15)
      .attr("font-weight", "bold");

    function addMiniRectsToGroup(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
      for (let i = 0; i < 4; ++i) {
        g.append("text")
          .text(`Proj${i + 1}`)
          .attr("x", -2 *CELL_SIZE)
          .attr("y", CELL_SIZE * i + 0.8 * CELL_SIZE)
          .attr("font-size", 10);

        for (let j = 0; j < 17; ++j) {
          g.append("rect")
            .attr("x", CELL_SIZE * j)
            .attr("y", CELL_SIZE * i)
            .attr("height", CELL_SIZE)
            .attr("width", CELL_SIZE)
            .attr("fill", higherIsBetterScale()(1 - 2 * Math.random()));
        }
      }
    }
    for (let i = 0; i < 3; ++i) {
      const miniRectsG = svgSelection
        .append("g")
        .attr("transform", `translate(80, ${30 + CELL_SIZE * 4 * i + i * (i > 0 ? 10 : 0)})`);
      addMiniRectsToGroup(miniRectsG);
      miniRectsG
        .append("text")
        .text(`Target ${i + 1}`)
        .attr("text-anchor", "center")
        .attr("transform", `translate(-30.0, ${3.5 * CELL_SIZE}) rotate(270)`)
        .attr("font-size", 10);
      miniRectsG
        .append("rect")
        .attr("height", 4 * CELL_SIZE)
        .attr("width", CELL_SIZE)
        .attr("x", [2 * CELL_SIZE, 5 * CELL_SIZE, 12 * CELL_SIZE][i])
        .attr("y", 0)
        .attr("stroke", "black")
        .attr("fill", "#FFFFFF00");
    }

    svgSelection
      .append("g")
      .selectAll("circle")
      .data([0, 1, 2])
      .join("circle")
      .attr("cx", (d) => 140 + d * 10)
      .attr("cy", 210)
      .attr("r", 2);
    svgSelection
      .append("text")
      .text("DATASET2")
      .attr("x", 20)
      .attr("y", 230)
      .attr("font-size", 15)
      .attr("font-weight", "bold");
    svgSelection
      .append("g")
      .selectAll("circle")
      .data([0, 1, 2])
      .join("circle")
      .attr("cx", (d) => 140 + d * 10)
      .attr("cy", 250)
      .attr("r", 2);
  }, []);

  return (
    <div className={styles.descriptionContainer}>
      <h1>Fooling Projection Quality Metrics</h1>
      <p>
        This is the companion website to the work titled "Necessary but not Sufficient: Limitations
        of Projection Quality Metrics", due to Machado et al.
        <br />
        The code used to run the experiments whose data is visualized below is available on{" "}
        <a href="https://github.com/amreis/fooling-projection-metrics">Github</a>.
      </p>
      <details>
        <summary>Reading the visualizations below</summary>
        <div className={styles.tutorialContainer}>
          <div className={styles.explanationsContainer}>
            <p>
              In our work, each experiment requires:
              <ul>
                <li>a dataset</li>
                <li>a reference projection</li>
                <li>a target metric to be fooled</li>
                <li>
                  the hyperparameters for that metric (in our study, all metrics require only a K
                  parameter)
                </li>
              </ul>
              Below, you see one row of{" "}
              <span>
                <svg id="tutorial-rect-svg" height="1em" width="3em" viewBox="0 0 94 30">
                  <rect x={0} y={0} height={30} width={30} fill="#CC0000"></rect>
                  <rect x={32} y={0} height={30} width={30} fill="rgb(85, 167, 207)"></rect>
                  <rect x={64} y={0} height={30} width={30} fill="rgb(246, 231, 224)"></rect>
                </svg>
              </span>{" "}
              rectangles for each experiment setting. You can change the value of K on the right
              side of the webpage. <br />
              Rows are grouped by dataset (for example, FashionMNIST below), then by target fooling
              metric (continuity, Jaccard, ...). The last level of grouping is the method used to
              generate the reference projection. Each row then contains 17 cells showing the delta
              in the quality metric value after fooling. The metric used as fooling target is
              additionally outlined. Displaying metric values instead of deltas w.r.t. pre-fooling
              metrics is possible with a toggle on the right side of the web page.
              <br />
              Colors encode quality, such that blue shades are always gains and red shades are
              always losses in quality.
            </p>
            <p>
              Clicking on a given row visualizes &mdash; see bottom of the page &mdash; all projections produced in that specific
              experiment, together with the difference in value of the target quality metric for
              that experiment with respect to the reference projection.
            </p>
          </div>
          <svg className={styles.miniVisual} viewBox="0 0 300 300" ref={ref}></svg>
        </div>
      </details>
    </div>
  );
}

export default Description;
