import Plot from "react-plotly.js";
import {
  Thermometer, Target, ShieldCheck, BrainCircuit,
  Info, ArrowRight
} from "lucide-react";

const wards = [
  { name: "Aundh Ward", value: 1.65 },
  { name: "Baner Ward", value: 1.50 },
  { name: "Kothrud Ward", value: 1.40 },
  { name: "Hadapsar Ward", value: 1.25 },
  { name: "Pimpri Ward", value: 1.10 }
];

const chartLayout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "DM Sans, sans-serif", color: "#d5e4e5", size: 13 },
  margin: { l: 55, r: 25, t: 22, b: 45 },
  showlegend: false
};

function KpiCard({ icon: Icon, label, value, description, color }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${color}`}>
        <Icon size={30} strokeWidth={2} />
      </div>
      <div className="kpi-content">
        <p className="kpi-label">{label}</p>
        <h2 className={`kpi-value ${color}`}>{value}</h2>
        <p className="kpi-description">{description}</p>
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <div className="dashboard">
      <section className="hero-section">
        <div className="eyebrow">CLIMATE ADAPTATION MONITORING</div>
        <h1>Evaluate. Understand. Adapt.</h1>
        <p className="hero-description">
          Monitor intervention performance, understand impact distribution,
          and make evidence-informed adaptation decisions across urban microclimates.
        </p>
      </section>

      <div className="synthetic-notice">
        <Info size={23} />
        <div>
          <strong>SYNTHETIC ILLUSTRATIVE DATA</strong>
          <p>
            The figures presented in this dashboard are simulated prototype
            values for algorithmic demonstration and model validation,
            not field telemetry measurements from Pune municipal stations.
          </p>
        </div>
      </div>

      <section className="kpi-grid">
        <KpiCard
          icon={Thermometer}
          label="Expected Temp Reduction"
          value={<>2.0<small>°C</small></>}
          description="Baseline Target Model (Simulated)"
          color="teal"
        />
        <KpiCard
          icon={Thermometer}
          label="Observed Temp Reduction"
          value={<>1.4<small>°C</small></>}
          description="-0.6°C Variance (Illustrative)"
          color="green"
        />
        <KpiCard
          icon={Target}
          label="Intervention Coverage"
          value={<>68<small>%</small></>}
          description="Target Municipal Roof Areas"
          color="blue"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Evaluation Status"
          value="Under Review"
          description="In Progress — QA"
          color="purple"
        />
      </section>

      <section className="charts-grid">
        <div className="panel chart-panel">
          <div className="eyebrow">COMPARATIVE TELEMETRY</div>
          <h2>Expected vs Observed Impact</h2>
          <p className="panel-description">
            Comparison of simulated baseline cooling target against estimated observed reduction.
          </p>

          <div className="chart-container">
            <Plot
              data={[
                {
                  type: "bar",
                  x: ["Expected", "Observed"],
                  y: [2.0, 1.4],
                  marker: { color: ["#159b7d", "#2878aa"] },
                  text: ["2.0°C", "1.4°C"],
                  textposition: "outside",
                  textfont: { color: "#ffffff", size: 15 },
                  hovertemplate: "%{x}: %{y}°C<extra></extra>"
                }
              ]}
              layout={{
                ...chartLayout,
                height: 285,
                bargap: 0.25,
                xaxis: {
                  color: "#d5e4e5",
                  gridcolor: "#263e45",
                  linecolor: "#29434a",
                  tickfont: { size: 13 }
                },
                yaxis: {
                  title: { text: "Temperature Reduction (°C)", font: { size: 12 } },
                  range: [0, 2.5],
                  dtick: 0.5,
                  color: "#b8cbce",
                  gridcolor: "#294047",
                  zerolinecolor: "#40555b"
                },
                annotations: [
                  {
                    x: "Observed",
                    y: 2.18,
                    text: "-0.6°C<br>Deficit",
                    showarrow: true,
                    arrowhead: 2,
                    ax: 0,
                    ay: 35,
                    font: { color: "#ff6969", size: 13 }
                  }
                ]
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: "100%" }}
            />
          </div>

          <div className="chart-footer">
            <span>Simulation Index: P-HEAT-04</span>
            <span>Illustrative confidence indicator: 94.2%</span>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="eyebrow">SPATIAL VARIANCE</div>
          <h2>Zone-wise Performance</h2>
          <p className="panel-description">
            Simulated microclimate cooling delta across targeted Pune municipal administrative wards.
          </p>

          <div className="ward-list">
            {wards.map((ward) => (
              <div className="ward-item" key={ward.name}>
                <div className="ward-heading">
                  <span>{ward.name}</span>
                  <strong>{ward.value.toFixed(2)}°C</strong>
                </div>
                <div className="ward-track">
                  <div
                    className="ward-fill"
                    style={{ width: `${(ward.value / 2) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="ward-axis">
            <span>0.0°C (Min)</span>
            <span>1.0°C</span>
            <span>2.0°C (Baseline Goal)</span>
          </div>
        </div>
      </section>

      <section className="diagnosis-panel">
        <div className="diagnosis-icon">
          <BrainCircuit size={32} />
        </div>
        <div className="diagnosis-content">
          <div className="diagnosis-top">
            <div>
              <div className="eyebrow">AI DIAGNOSTIC ENGINE</div>
              <h2>Observed impact is below the expected target.</h2>
            </div>
            <span className="sample-badge">SAMPLE INSIGHT</span>
          </div>

          <p>
            The illustrative figures indicate a gap between expected (2.0°C)
            and observed (1.4°C) reduction. Intervention coverage (68%) and
            zone-level microclimate variation (Aundh at 1.65°C vs Pimpri at
            1.10°C) are potential contributing factors to investigate.
          </p>

          <div className="diagnosis-notice">
            <Info size={17} />
            <span>
              AI diagnosis identifies statistical associations, spatial patterns,
              and potential systemic drivers; it does not establish deterministic causal proof.
            </span>
          </div>

          <button
            className="diagnosis-action"
            onClick={() => window.location.href = "/diagnosis"}
          >
            Inspect Diagnostic Drivers & Covariates
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      <footer className="dashboard-footer">
        <strong>🌿 EVALADAPT</strong>
        <span>AI-assisted climate adaptation evaluation & diagnosis system.</span>
        <span>Prototype v1.0 • Built for academic & scientific research demonstration</span>
      </footer>
    </div>
  );
}
