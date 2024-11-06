import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { higherIsBetterScale } from "./common/scale";
import style from "./styles/legend.module.css";

interface Props {
  showDiffs: boolean;
}

const Legend = ({ showDiffs }: Props) => {
  const ref = useRef<SVGSVGElement>(null);
  const [delta, setDelta] = useState(0.0);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectChildren("*").remove();
    svg
      .append("rect")
      .attr("width", 300)
      .attr("height", 300)
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", higherIsBetterScale()(delta));
    svg
      .append("text")
      .attr("fill", "#000000")
      .text("(reference value)")
      .attr("x", 150)
      .attr("y", 180)
      .attr("text-anchor", "middle")
      .style("font", "24px sans-serif");
    svg
      .append("text")
      .attr("fill", "#000000")
      .text(showDiffs ? "diff w.r.t. reference" : "absolute metric val.")
      .attr("x", 150)
      .attr("y", 150)
      .attr("text-anchor", "middle")
      .style("font", "24px sans-serif")
      .style("font-weight", "bold");
  }, [delta, showDiffs]);

  return (
    <div className={style.container}>
      <i className={style.legendLabel}>
        Legend:
        <br />
        (assumes higher values are better)
      </i>
      <div className={style.svgContainer}>
        <svg ref={ref} viewBox="0 0 300 300" className={style.graphics} />
        <div className={style.controls}>
          <label htmlFor="delta-val">
            Diff = {(delta >= 0 ? "+" : "-") + Math.abs(delta).toFixed(2)}
          </label>
          <input
            type="range"
            className={style.range}
            min={-5}
            max={5}
            step={0.2}
            name="delta-val"
            onChange={(e) => {
              setDelta(e.target.valueAsNumber);
            }}
            value={delta}
          />
        </div>
      </div>
    </div>
  );
};

export default Legend;
