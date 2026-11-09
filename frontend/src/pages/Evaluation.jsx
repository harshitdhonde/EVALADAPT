import Plot from "react-plotly.js";
import {
  ChartNoAxesCombined, TrendingDown, Target,
  Activity, Info, ArrowDownRight
} from "lucide-react";

const treated = [34.2, 32.8];
const control = [34.0, 33.5];

const did = (treated[1] - treated[0]) - (control[1] - control[0]);

const chartLayout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#c3d4d6", family: "DM Sans" },
  margin: { t: 25, r: 20, b: 55, l: 55 },
  xaxis: {
    gridcolor: "#263e45",
    linecolor: "#40565c",
    zerolinecolor: "#40565c"
  },
  yaxis: {
    gridcolor: "#263e45",
    linecolor: "#40565c",
    zerolinecolor: "#40565c",
    title: "Temperature (°C)"
  },
  legend: { orientation: "h", y: -0.25 },
  showlegend: true
};

const config = { responsive: true, displaylogo: false };

export default function Evaluation() {
  return (
    <div className="module-page">
      <section className="module-hero">
        <div className="eyebrow">IMPACT MEASUREMENT ENGINE</div>
        <h1>Impact Evaluation</h1>
        <p>
          Measure intervention performance by comparing expected outcomes
          with observed changes across treated and control zones.
        </p>
      </section>

      <div className="evaluation-notice">
        <Info size={19} />
        <span>
          SIMULATED PROTOTYPE RESULTS — All figures are illustrative and are
          not actual temperature measurements from Pune.
        </span>
      </div>

      <section className="evaluation-kpis">
        <div className="evaluation-kpi">
          <div className="kpi-icon"><Target size={23} /></div>
          <span>Expected Reduction</span>
          <strong>2.0°C</strong>
          <small>Program target</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><TrendingDown size={23} /></div>
          <span>Observed Reduction</span>
          <strong className="green-value">1.4°C</strong>
          <small>Illustrative treated-zone change</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><Activity size={23} /></div>
          <span>Control Group Reduction</span>
          <strong>0.5°C</strong>
          <small>Illustrative comparison change</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><ChartNoAxesCombined size={23} /></div>
          <span>DiD Estimate</span>
          <strong className="green-value">{Math.abs(did).toFixed(1)}°C</strong>
          <small>Additional estimated reduction</small>
        </div>
      </section>

      <section className="panel evaluation-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TARGET VS PERFORMANCE</div>
            <h2>Expected vs Observed Impact</h2>
            <p className="panel-description">
              Comparison of the program target and observed temperature reduction.
            </p>
          </div>
        </div>

        <div className="evaluation-chart">
          <Plot
            data={[
              {
                x: ["Expected Target", "Observed Reduction"],
                y: [2.0, 1.4],
                type: "bar",
                marker: { color: ["#247d79", "#10a981"] },
                text: ["2.0°C", "1.4°C"],
                textposition: "outside",
                textfont: { color: "#f0f6f5", size: 15 },
                hovertemplate: "%{x}: %{y}°C<extra></extra>"
              }
            ]}
            layout={{
              ...chartLayout,
              height: 350,
              showlegend: false,
              yaxis: {
                ...chartLayout.yaxis,
                range: [0, 2.6],
                dtick: 0.5
              },
              margin: { t: 40, r: 30, b: 60, l: 60 }
            }}
            config={config}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>

        <div className="evaluation-insight">
          <ArrowDownRight size={22} />
          <div>
            <strong>0.6°C below the expected target</strong>
            <span>
              The illustrative observed reduction is lower than the
              program's target. Further investigation is needed.
            </span>
          </div>
        </div>
      </section>

      <section className="panel evaluation-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">COMPARATIVE EVALUATION</div>
            <h2>Before & After Analysis</h2>
            <p className="panel-description">
              Compare temperature changes in treated and control groups.
            </p>
          </div>
        </div>

        <div className="evaluation-chart">
          <Plot
            data={[
              {
                x: ["Before Intervention", "After Intervention"],
                y: treated,
                type: "scatter",
                mode: "lines+markers",
                name: "Treated Zones",
                line: { color: "#10b98c", width: 4 },
                marker: { size: 11 }
              },
              {
                x: ["Before Intervention", "After Intervention"],
                y: control,
                type: "scatter",
                mode: "lines+markers",
                name: "Control Zones",
                line: { color: "#5ba9dc", width: 4 },
                marker: { size: 11 }
              }
            ]}
            layout={{
              ...chartLayout,
              height: 370,
              yaxis: {
                ...chartLayout.yaxis,
                range: [31.5, 35]
              }
            }}
            config={config}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>

        <div className="comparison-grid">
          <div>
            <span>Treated Group</span>
            <strong>34.2°C → 32.8°C</strong>
            <small>Reduction: 1.4°C</small>
          </div>
          <div>
            <span>Control Group</span>
            <strong>34.0°C → 33.5°C</strong>
            <small>Reduction: 0.5°C</small>
          </div>
        </div>
      </section>

      <section className="panel did-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CAUSAL EFFECT ESTIMATION</div>
            <h2>Difference-in-Differences Analysis</h2>
            <p className="panel-description">
              Estimate the additional change associated with the intervention
              by accounting for the change in the control group.
            </p>
          </div>
          <span className="sample-badge">ILLUSTRATIVE</span>
        </div>

        <div className="did-formula">
          <div>
            <span>Treated Group Change</span>
            <strong>−1.4°C</strong>
          </div>
          <span className="formula-minus">−</span>
          <div>
            <span>Control Group Change</span>
            <strong>−0.5°C</strong>
          </div>
          <span className="formula-equal">=</span>
          <div className="did-result">
            <span>DiD Estimate</span>
            <strong>−0.9°C</strong>
          </div>
        </div>

        <div className="did-explanation">
          <Info size={20} />
          <p>
            The illustrative estimate suggests an additional 0.9°C reduction
            in treated zones relative to control zones. Interpreting this as
            a causal effect requires a valid evaluation design, including
            appropriate parallel-trends assumptions and consideration of
            confounding factors.
          </p>
        </div>
      </section>

      <section className="panel evaluation-method">
        <div className="eyebrow">METHODOLOGY</div>
        <h2>How the Evaluation Works</h2>
        <div className="method-steps">
          <div><span>01</span><strong>Establish Baseline</strong><p>Measure conditions before intervention.</p></div>
          <div><span>02</span><strong>Observe Changes</strong><p>Measure outcomes after intervention.</p></div>
          <div><span>03</span><strong>Compare Groups</strong><p>Compare treated and control changes.</p></div>
          <div><span>04</span><strong>Estimate Impact</strong><p>Calculate the Difference-in-Differences estimate.</p></div>
        </div>
      </section>
    </div>
  );
}
