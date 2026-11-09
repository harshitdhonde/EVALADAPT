import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  ChartNoAxesCombined, TrendingDown, Target,
  Activity, Info, ArrowDownRight
} from "lucide-react";
import { getEvaluation } from "../services/api";

const chartLayout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#c3d4d6", family: "DM Sans" },
  margin: { t: 25, r: 20, b: 55, l: 55 },
  xaxis: { gridcolor: "#263e45", linecolor: "#40565c" },
  yaxis: {
    gridcolor: "#263e45",
    linecolor: "#40565c",
    title: "Temperature (°C)"
  },
  legend: { orientation: "h", y: -0.25 },
  showlegend: true
};

const config = { responsive: true, displaylogo: false };

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatTemp(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(3)}°C` : "—";
}

export default function Evaluation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvaluation()
      .then(response => setResult(response.data))
      .catch(() => setError("Unable to load evaluation results. Check that the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="module-page"><p>Loading evaluation results...</p></div>;
  if (error) return <div className="module-page"><p>{error}</p></div>;

  const impact = result?.impact || {};
  const temporal = result?.temporal || {};
  const series = temporal.series || [];

  const expected = impact.expected_reduction_c;
  const observed = impact.observed_raw_reduction_c;
  const estimated = impact.estimated_reduction_c;
  const effectiveness = impact.effectiveness_pct;
  const pValue = impact.p_value;
  const confidence = impact.ci_95_c || [];

  const pre = series.filter(item => item.month < "2025-01");
  const post = series.filter(item => item.month >= "2025-01");

  const treatedBefore = average(pre.map(item => item.treated_mean_c));
  const treatedAfter = average(post.map(item => item.treated_mean_c));
  const controlBefore = average(pre.map(item => item.control_mean_c));
  const controlAfter = average(post.map(item => item.control_mean_c));

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
          SYNTHETIC DEMONSTRATION DATA — These results are illustrative
          and are not actual temperature measurements from Pune.
        </span>
      </div>

      <section className="evaluation-kpis">
        <div className="evaluation-kpi">
          <div className="kpi-icon"><Target size={23} /></div>
          <span>Expected Reduction</span>
          <strong>{formatTemp(expected)}</strong>
          <small>Program target</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><TrendingDown size={23} /></div>
          <span>Observed Raw Reduction</span>
          <strong className="green-value">{formatTemp(observed)}</strong>
          <small>Raw treated-zone change</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><Activity size={23} /></div>
          <span>Estimated DiD Reduction</span>
          <strong className="green-value">{formatTemp(estimated)}</strong>
          <small>Adjusted for control-group change</small>
        </div>

        <div className="evaluation-kpi">
          <div className="kpi-icon"><ChartNoAxesCombined size={23} /></div>
          <span>Effectiveness</span>
          <strong>{Number(effectiveness).toFixed(1)}%</strong>
          <small>{impact.status?.replaceAll("_", " ") || "Evaluation result"}</small>
        </div>
      </section>

      <section className="panel evaluation-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TARGET VS PERFORMANCE</div>
            <h2>Expected vs Observed Impact</h2>
            <p className="panel-description">
              Comparison of the expected target, raw observed change and estimated intervention effect.
            </p>
          </div>
        </div>

        <div className="evaluation-chart">
          <Plot
            data={[{
              x: ["Expected Target", "Raw Observed", "Estimated DiD"],
              y: [expected, observed, estimated],
              type: "bar",
              marker: { color: ["#247d79", "#5ba9dc", "#10a981"] },
              text: [expected, observed, estimated].map(value => `${Number(value).toFixed(3)}°C`),
              textposition: "outside",
              textfont: { color: "#f0f6f5", size: 14 },
              hovertemplate: "%{x}: %{y:.3f}°C<extra></extra>"
            }]}
            layout={{
              ...chartLayout,
              height: 350,
              showlegend: false,
              yaxis: { ...chartLayout.yaxis, rangemode: "tozero" },
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
            <strong>
              {Number.isFinite(Number(expected)) && Number.isFinite(Number(estimated))
                ? `${(expected - estimated).toFixed(3)}°C below the expected target`
                : "Evaluation comparison"}
            </strong>
            <span>
              The estimated effect is compared with the program target.
              The result helps identify where further adaptation may be needed.
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
              Monthly average temperatures in treated and control zones.
            </p>
          </div>
        </div>

        <div className="evaluation-chart">
          <Plot
            data={[
              {
                x: series.map(item => item.month),
                y: series.map(item => item.treated_mean_c),
                type: "scatter",
                mode: "lines+markers",
                name: "Treated Zones",
                line: { color: "#10b98c", width: 3 },
                marker: { size: 7 }
              },
              {
                x: series.map(item => item.month),
                y: series.map(item => item.control_mean_c),
                type: "scatter",
                mode: "lines+markers",
                name: "Control Zones",
                line: { color: "#5ba9dc", width: 3 },
                marker: { size: 7 }
              }
            ]}
            layout={{
              ...chartLayout,
              height: 370,
              xaxis: {
                ...chartLayout.xaxis,
                tickangle: -35
              }
            }}
            config={config}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>

        <div className="comparison-grid">
          <div>
            <span>Treated Group — Before</span>
            <strong>{formatTemp(treatedBefore)}</strong>
            <small>Average monthly temperature</small>
          </div>
          <div>
            <span>Treated Group — After</span>
            <strong>{formatTemp(treatedAfter)}</strong>
            <small>Average monthly temperature</small>
          </div>
          <div>
            <span>Control Group — Before</span>
            <strong>{formatTemp(controlBefore)}</strong>
            <small>Average monthly temperature</small>
          </div>
          <div>
            <span>Control Group — After</span>
            <strong>{formatTemp(controlAfter)}</strong>
            <small>Average monthly temperature</small>
          </div>
        </div>
      </section>

      <section className="panel did-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CAUSAL EFFECT ESTIMATION</div>
            <h2>Difference-in-Differences Analysis</h2>
            <p className="panel-description">
              Estimate the additional temperature reduction associated with
              the intervention by accounting for control-group changes.
            </p>
          </div>
          <span className="sample-badge">SYNTHETIC RESULTS</span>
        </div>

        <div className="did-formula">
          <div>
            <span>Raw Observed Reduction</span>
            <strong>{formatTemp(observed)}</strong>
          </div>
          <span className="formula-minus">→</span>
          <div>
            <span>Adjusted DiD Estimate</span>
            <strong>{formatTemp(estimated)}</strong>
          </div>
          <span className="formula-equal">±</span>
          <div className="did-result">
            <span>95% Confidence Interval</span>
            <strong>
              {confidence.length === 2
                ? `${Number(confidence[0]).toFixed(3)}–${Number(confidence[1]).toFixed(3)}°C`
                : "—"}
            </strong>
          </div>
        </div>

        <div className="did-explanation">
          <Info size={20} />
          <p>
            Estimated reduction: {formatTemp(estimated)}.
            Statistical p-value: {Number.isFinite(Number(pValue)) ? Number(pValue).toFixed(4) : "—"}.
            Parallel-trends assessment: {impact.parallel_trends?.supported ? "supported by the available pre-intervention test" : "not established"}.
            A causal interpretation still depends on the validity of the evaluation design
            and its assumptions. These synthetic results do not prove causality.
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
