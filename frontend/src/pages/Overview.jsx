import Plot from "react-plotly.js";
import { useEffect, useState } from "react";
import {
  getHealth,
  getOverview,
  getImpactEquity,
  getDecision
} from "../services/api";

import {
  Thermometer, Target, ShieldCheck, BrainCircuit,
  Info, ArrowRight
} from "lucide-react";

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
  const [backendStatus, setBackendStatus] = useState("checking");
  const [overview, setOverview] = useState(null);
  const [impactEquity, setImpactEquity] = useState(null);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getHealth(),
      getOverview(),
      getImpactEquity(),
      getDecision()
    ])
      .then(([healthRes, overviewRes, equityRes, decisionRes]) => {
        if (!active) return;

        setBackendStatus(
          healthRes.data?.status === "ok" ? "connected" : "disconnected"
        );
        setOverview(overviewRes.data);
        setImpactEquity(equityRes.data);
        setDecision(decisionRes.data);
      })
      .catch((err) => {
        if (!active) return;
        setBackendStatus("disconnected");
        setError(
          err.response?.data?.detail ||
          "Unable to load dashboard data. Check whether the backend is running."
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const statusColor = {
    checking: "#e5b85c",
    connected: "#39c98a",
    disconnected: "#ff6969"
  };

  const statusLabel = {
    checking: "Checking backend...",
    connected: "Backend connected",
    disconnected: "Backend disconnected"
  };

  if (error) {
    return (
      <div className="dashboard">
        <section className="hero-section">
          <div className="eyebrow">CLIMATE ADAPTATION MONITORING</div>
          <h1>Evaluate. Understand. Adapt.</h1>
          <p className="hero-description">{error}</p>
        </section>
        <div className="synthetic-notice">
          <Info size={23} />
          <div>
            <strong>BACKEND CONNECTION REQUIRED</strong>
            <p>Start the FastAPI backend and refresh this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!overview || !impactEquity || !decision) {
    return (
      <div className="dashboard">
        <section className="hero-section">
          <div className="eyebrow">CLIMATE ADAPTATION MONITORING</div>
          <h1>Evaluate. Understand. Adapt.</h1>
          <p className="hero-description">Loading evaluation results...</p>
        </section>
      </div>
    );
  }

  const kpis = overview.kpis;
  const zones = [...(impactEquity.zone_effects || [])]
    .sort((a, b) => b.effectiveness_pct - a.effectiveness_pct)
    .slice(0, 5);

  const status = kpis.impact_status?.replaceAll("_", " ") || "UNDER REVIEW";

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
            {overview.data_notice}
            {" "}These values demonstrate the evaluation workflow and are not
            actual Pune field measurements.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          marginBottom: "20px",
          background: "#14282d",
          border: "1px solid #294047",
          borderRadius: "10px",
          width: "fit-content",
          color: "#d5e4e5",
          fontSize: "14px"
        }}
      >
        <span
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: statusColor[backendStatus]
          }}
        />
        {statusLabel[backendStatus]}
      </div>

      <section className="kpi-grid">
        <KpiCard
          icon={Thermometer}
          label="Expected Temp Reduction"
          value={<>{Number(kpis.expected_reduction_c).toFixed(3)}<small>°C</small></>}
          description="Modelled intervention target"
          color="teal"
        />

        <KpiCard
          icon={Thermometer}
          label="Estimated Temp Reduction"
          value={<>{Number(kpis.estimated_reduction_c).toFixed(3)}<small>°C</small></>}
          description="Difference-in-Differences estimate"
          color="green"
        />

        <KpiCard
          icon={Target}
          label="Effectiveness"
          value={<>{Number(kpis.effectiveness_pct).toFixed(1)}<small>%</small></>}
          description="Estimated impact vs expected target"
          color="blue"
        />

        <KpiCard
          icon={ShieldCheck}
          label="Evaluation Status"
          value={status}
          description={`Programme decision: ${overview.decision}`}
          color="purple"
        />
      </section>

      <section className="charts-grid">
        <div className="panel chart-panel">
          <div className="eyebrow">COMPARATIVE EVALUATION</div>
          <h2>Expected vs Observed Impact</h2>
          <p className="panel-description">
            Modelled target compared with raw and estimated temperature reduction.
          </p>

          <div className="chart-container">
            <Plot
              data={[
                {
                  type: "bar",
                  x: ["Expected", "Raw Observed", "Estimated"],
                  y: [
                    kpis.expected_reduction_c,
                    kpis.observed_raw_reduction_c,
                    kpis.estimated_reduction_c
                  ],
                  marker: { color: ["#159b7d", "#2878aa", "#39c98a"] },
                  text: [
                    `${Number(kpis.expected_reduction_c).toFixed(3)}°C`,
                    `${Number(kpis.observed_raw_reduction_c).toFixed(3)}°C`,
                    `${Number(kpis.estimated_reduction_c).toFixed(3)}°C`
                  ],
                  textposition: "outside",
                  textfont: { color: "#ffffff", size: 13 },
                  hovertemplate: "%{x}: %{y:.3f}°C<extra></extra>"
                }
              ]}
              layout={{
                ...chartLayout,
                height: 285,
                bargap: 0.3,
                xaxis: {
                  color: "#d5e4e5",
                  gridcolor: "#263e45",
                  linecolor: "#29434a",
                  tickfont: { size: 12 }
                },
                yaxis: {
                  title: {
                    text: "Temperature Reduction (°C)",
                    font: { size: 12 }
                  },
                  rangemode: "tozero",
                  color: "#b8cbce",
                  gridcolor: "#294047",
                  zerolinecolor: "#40555b"
                }
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: "100%" }}
            />
          </div>

          <div className="chart-footer">
            <span>Run ID: {overview.run_id}</span>
            <span>p-value: {Number(kpis.p_value).toFixed(4)}</span>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="eyebrow">SPATIAL VARIANCE</div>
          <h2>Zone-wise Performance</h2>
          <p className="panel-description">
            Top five treated zones ranked by estimated intervention effectiveness.
          </p>

          <div className="ward-list">
            {zones.map((zone) => (
              <div className="ward-item" key={zone.zone_id}>
                <div className="ward-heading">
                  <span>{zone.zone_name}</span>
                  <strong>{Number(zone.effectiveness_pct).toFixed(1)}%</strong>
                </div>
                <div className="ward-track">
                  <div
                    className="ward-fill"
                    style={{
                      width: `${Math.min(Math.max(zone.effectiveness_pct, 0), 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="ward-axis">
            <span>0% (Min)</span>
            <span>50%</span>
            <span>100% (Target)</span>
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
              <h2>
                {decision.decision === "MODIFY"
                  ? "The programme needs targeted improvements."
                  : `Current programme decision: ${decision.decision}.`}
              </h2>
            </div>
            <span className="sample-badge">AI-ASSISTED INSIGHT</span>
          </div>

          <p>{decision.rationale}</p>

          <div className="diagnosis-notice">
            <Info size={17} />
            <span>
              AI diagnosis identifies statistical associations, spatial patterns,
              and potential systemic drivers. It does not establish causal proof.
              All displayed results use synthetic demonstration data.
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
