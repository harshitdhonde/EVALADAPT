import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  BrainCircuit, AlertTriangle, Search, Activity,
  Info, CheckCircle2, Microscope
} from "lucide-react";
import { getDiagnosis, getOverview } from "../services/api";

const layout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "DM Sans", color: "#c3d4d6" },
  margin: { t: 20, r: 25, b: 50, l: 55 },
  xaxis: { gridcolor: "#263e45", linecolor: "#40565c" },
  yaxis: { gridcolor: "#263e45", linecolor: "#40565c" }
};

const config = { responsive: true, displaylogo: false };

export default function Diagnosis() {
  const [diagnosis, setDiagnosis] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDiagnosis(), getOverview()])
      .then(([diagnosisResponse, overviewResponse]) => {
        setDiagnosis(diagnosisResponse.data);
        setOverview(overviewResponse.data);
      })
      .catch(() => {
        setError("Unable to load diagnosis results. Check that the backend is running.");
      });
  }, []);

  if (error) {
    return <div className="module-page"><p>{error}</p></div>;
  }

  if (!diagnosis || !overview) {
    return <div className="module-page"><p>Loading AI diagnosis...</p></div>;
  }

  const anomalies = diagnosis.anomalies;
  const driversData = diagnosis.drivers;
  const findings = anomalies.flagged || [];
  const drivers = driversData.drivers || [];
  const notes = diagnosis.zone_notes || [];
  const kpis = overview.kpis;

  const expected = kpis.expected_reduction_c;
  const estimated = kpis.estimated_reduction_c;
  const gap = expected - estimated;

  const noteForZone = zoneId =>
    notes.find(note => note.zone_id === zoneId);

  return (
    <div className="module-page">
      <section className="module-hero">
        <div className="eyebrow">EXPLAINABLE AI & PATTERN ANALYSIS</div>
        <h1>AI Diagnosis</h1>
        <p>
          Identify unusual outcomes, examine potential contributing factors,
          and translate evaluation results into actionable investigation priorities.
        </p>
      </section>

      <div className="diagnosis-data-notice">
        <Info size={19} />
        <span>
          {diagnosis.data_notice || "SYNTHETIC DEMONSTRATION DATA — These findings are illustrative, not verified field measurements."}
        </span>
      </div>

      <section className="diagnosis-summary-grid">
        <div className="diagnosis-summary-card">
          <BrainCircuit size={25} />
          <span>Diagnostic Engine</span>
          <strong>AI-Assisted</strong>
          <small>Pattern interpretation</small>
        </div>

        <div className="diagnosis-summary-card">
          <AlertTriangle size={25} />
          <span>Potential Anomalies</span>
          <strong>{findings.length}</strong>
          <small>Flagged treated zones</small>
        </div>

        <div className="diagnosis-summary-card">
          <Search size={25} />
          <span>Potential Drivers</span>
          <strong>{drivers.length}</strong>
          <small>Factors examined</small>
        </div>

        <div className="diagnosis-summary-card">
          <Activity size={25} />
          <span>Model Reliability</span>
          <strong>{driversData.reliability}</strong>
          <small>Leave-one-out validation</small>
        </div>
      </section>

      <section className="panel ai-main-panel">
        <div className="ai-heading">
          <div className="ai-heading-icon">
            <BrainCircuit size={31} />
          </div>
          <div>
            <div className="eyebrow">SYSTEM DIAGNOSTIC SUMMARY</div>
            <h2>
              {findings.some(f => f.direction === "under")
                ? "Potential underperformance detected"
                : "Unusual zone-level patterns identified"}
            </h2>
            <p>
              The evaluation indicates that estimated cooling is below
              the expected intervention target.
            </p>
          </div>
          <span className="severity-tag">Needs Investigation</span>
        </div>

        <div className="ai-summary-content">
          <div>
            <span>Expected reduction</span>
            <strong>{expected.toFixed(3)}°C</strong>
          </div>
          <div>
            <span>Estimated reduction</span>
            <strong>{estimated.toFixed(3)}°C</strong>
          </div>
          <div>
            <span>Performance gap</span>
            <strong className="warning-value">{gap.toFixed(3)}°C</strong>
          </div>
        </div>

        <div className="ai-recommendation">
          <Microscope size={23} />
          <div>
            <strong>Suggested investigation</strong>
            <p>
              {findings.length} unusual zone-level outcomes were flagged.
              Review their local characteristics and intervention coverage
              before deciding on corrective action.
            </p>
          </div>
        </div>
      </section>

      <section className="panel diagnosis-panel-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ANOMALY & OUTLIER REVIEW</div>
            <h2>Zone-level Diagnostic Findings</h2>
            <p className="panel-description">
              Unusual outcomes identified using Isolation Forest.
            </p>
          </div>
          <span className="sample-badge">MODEL FINDINGS</span>
        </div>

        <div className="finding-list">
          {findings.map((item, index) => {
            const note = noteForZone(item.zone_id);
            const isUnder = item.direction === "under";

            return (
              <div className="finding-card" key={item.zone_id}>
                <div className="finding-index">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="finding-content">
                  <div className="finding-title-row">
                    <strong>{item.zone_name} ({item.zone_id})</strong>
                    <span className={isUnder ? "severity-high" : "severity-medium"}>
                      {isUnder ? "Underperforming" : "Unusually Strong"}
                    </span>
                  </div>

                  <h3>{item.reading}</h3>

                  <p>
                    Effectiveness: {item.effectiveness_pct.toFixed(1)}%
                    {" · "}Robust z-score: {item.robust_z.toFixed(2)}
                  </p>

                  <div className="finding-action">
                    <Search size={16} />
                    {note?.notable_characteristics?.join("; ") ||
                      "Investigate local conditions and intervention implementation."}
                  </div>
                </div>
              </div>
            );
          })}

          {findings.length === 0 && <p>No anomalies were flagged.</p>}
        </div>

        <p className="panel-description">
          Detection method: {anomalies.method}. Zones scored: {anomalies.n_zones_scored}.
          Median effectiveness: {anomalies.median_effectiveness_pct.toFixed(1)}%.
        </p>
      </section>

      <section className="panel diagnosis-panel-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLAINABLE DIAGNOSIS</div>
            <h2>Potential Contributing Factors</h2>
            <p className="panel-description">
              Random Forest permutation importance and Spearman association.
              Importance is not a causal effect.
            </p>
          </div>
        </div>

        <div className="driver-layout">
          <div className="driver-chart">
            <Plot
              data={[{
                x: drivers.map(d => d.importance_share * 100),
                y: drivers.map(d => d.label),
                type: "bar",
                orientation: "h",
                marker: { color: "#20a98a" },
                text: drivers.map(d => `${(d.importance_share * 100).toFixed(1)}%`),
                textposition: "outside",
                textfont: { color: "#f0f6f5", size: 13 },
                hovertemplate: "%{y}: %{x:.1f}%<extra></extra>"
              }]}
              layout={{
                ...layout,
                height: 350,
                margin: { t: 15, r: 65, b: 45, l: 175 },
                showlegend: false,
                xaxis: {
                  ...layout.xaxis,
                  title: "Permutation importance share (%)",
                  rangemode: "tozero"
                }
              }}
              config={config}
              style={{ width: "100%" }}
              useResizeHandler
            />
          </div>

          <div className="driver-list">
            {drivers.map(driver => (
              <div className="driver-item" key={driver.feature}>
                <div className="driver-name">{driver.label}</div>
                <p>
                  Importance: {(driver.importance_share * 100).toFixed(1)}%
                  {" · "}Spearman correlation: {driver.spearman_rho.toFixed(3)}
                </p>
                <p>{driver.association}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-limitations">
          <Info size={20} />
          <div>
            <strong>Model reliability: {driversData.reliability}</strong>
            <p>{driversData.caveat}</p>
            <p>
              Leave-one-out R²: {driversData.leave_one_out_r2.toFixed(3)}
              {" · "}Treated zones analysed: {driversData.n_zones}
            </p>
          </div>
        </div>
      </section>

      <section className="panel diagnosis-panel-section">
        <div className="eyebrow">INVESTIGATION WORKFLOW</div>
        <h2>From Diagnosis to Action</h2>

        <div className="diagnosis-workflow">
          <div>
            <span>01</span>
            <strong>Detect</strong>
            <p>Identify unusual patterns and underperforming zones.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Explain</strong>
            <p>Examine potential contributing factors.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Investigate</strong>
            <p>Validate findings using additional evidence.</p>
          </div>
          <div>
            <span>04</span>
            <strong>Recommend</strong>
            <p>Suggest areas for intervention improvement.</p>
          </div>
        </div>

        <div className="ai-limitations">
          <Info size={20} />
          <div>
            <strong>Scientific limitation</strong>
            <p>{diagnosis.disclaimer}</p>
            <p>
              Anomaly detection identifies unusual observations, while
              explainable models help interpret patterns. Causal attribution
              requires an appropriate evaluation design and supporting evidence.
            </p>
          </div>
        </div>
      </section>

      <section className="diagnosis-footer-status">
        <CheckCircle2 size={20} />
        <span>AI diagnosis loaded successfully from the evaluation backend.</span>
      </section>
    </div>
  );
}
