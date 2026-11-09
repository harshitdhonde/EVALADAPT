import { useEffect, useState } from "react";
import {
  FileText, Download, CheckCircle2, AlertTriangle,
  Search, Target, TrendingDown, Users, ShieldCheck,
  Info, ArrowRight
} from "lucide-react";
import {
  getDecision, getOverview, getEvaluation,
  getImpactEquity, getDiagnosis
} from "../services/api";

const format = (value, digits = 3) =>
  typeof value === "number" ? value.toFixed(digits) : value ?? "—";

const decisionDescriptions = {
  CONTINUE: "Continue implementation while monitoring outcomes and maintaining evaluation.",
  MODIFY: "Adjust implementation, targeting or resource allocation to address identified gaps.",
  INVESTIGATE: "Collect additional evidence and examine uncertain outcomes before making further decisions."
};

const decisionIcons = {
  CONTINUE: CheckCircle2,
  MODIFY: Target,
  INVESTIGATE: Search
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getDecision(),
      getOverview(),
      getEvaluation(),
      getImpactEquity(),
      getDiagnosis()
    ])
      .then(([decision, overview, evaluation, equity, diagnosis]) => {
        setData({
          decision: decision.data,
          overview: overview.data,
          evaluation: evaluation.data,
          equity: equity.data,
          diagnosis: diagnosis.data
        });
      })
      .catch(() => {
        setError("Unable to load the report. Check that the backend is running.");
      });
  }, []);

  const printReport = () => window.print();

  if (error) {
    return <div className="module-page"><p>{error}</p></div>;
  }

  if (!data) {
    return <div className="module-page"><p>Loading evaluation report...</p></div>;
  }

  const { decision, overview, evaluation, equity, diagnosis } = data;
  const kpis = overview.kpis;
  const impact = evaluation.impact;
  const equityData = equity.equity;
  const actions = decision.recommended_actions || [];
  const selectedDecision = decision.decision || "INVESTIGATE";
  const DecisionIcon = decisionIcons[selectedDecision] || Search;

  const evidence = [
    {
      category: "Expected temperature reduction",
      result: `${format(kpis.expected_reduction_c)}°C`,
      status: "Intervention target"
    },
    {
      category: "Observed raw temperature reduction",
      result: `${format(kpis.observed_raw_reduction_c)}°C`,
      status: "Observed change"
    },
    {
      category: "Estimated Difference-in-Differences impact",
      result: `${format(impact.estimated_reduction_c)}°C`,
      status: `95% CI: ${format(impact.ci_95_c?.[0])}–${format(impact.ci_95_c?.[1])}°C`
    },
    {
      category: "Intervention effectiveness",
      result: `${format(kpis.effectiveness_pct, 1)}%`,
      status: impact.status
    },
    {
      category: "Equity assessment",
      result: equityData.verdict,
      status: `Equity ratio: ${format(equityData.equity_ratio, 3)}`
    },
    {
      category: "AI-assisted diagnosis",
      result: `${diagnosis.anomalies.flagged.length} anomalies`,
      status: `Model reliability: ${diagnosis.drivers.reliability}`
    }
  ];

  const decisionOptions = [
    {
      name: "CONTINUE",
      icon: CheckCircle2,
      description: decisionDescriptions.CONTINUE
    },
    {
      name: "MODIFY",
      icon: Target,
      description: decisionDescriptions.MODIFY
    },
    {
      name: "INVESTIGATE",
      icon: Search,
      description: decisionDescriptions.INVESTIGATE
    }
  ];

  return (
    <div className="module-page report-page">
      <section className="module-hero">
        <div className="eyebrow">EVIDENCE SYNTHESIS & DECISION SUPPORT</div>
        <h1>Reports & Decisions</h1>
        <p>
          Consolidate evaluation results, review supporting evidence,
          and determine the next course of action for the climate
          adaptation intervention.
        </p>
      </section>

      <div className="report-notice">
        <Info size={19} />
        <span>
          {overview.data_notice}
        </span>
      </div>

      <section className="decision-card">
        <div className="decision-top">
          <div>
            <div className="eyebrow">SYSTEM RECOMMENDATION</div>
            <h2>Recommended Action</h2>
          </div>
          <span className="decision-status">BACKEND DECISION</span>
        </div>

        <div className="decision-main">
          <div className="decision-icon">
            <DecisionIcon size={34} />
          </div>
          <div>
            <span className="decision-label">{selectedDecision}</span>
            <h3>{decisionDescriptions[selectedDecision]}</h3>
            <p>{decision.rationale}</p>
          </div>
        </div>

        <div className="decision-reasons">
          {Object.entries(decision.supporting_evidence || {}).map(([key, value]) => (
            <div key={key}>
              <ShieldCheck size={20} />
              <span>
                <strong>{key.replaceAll("_", " ")}: </strong>
                {Array.isArray(value)
                  ? value.map(item =>
                      typeof item === "object"
                        ? `${item.zone_id || ""} (${item.effectiveness_pct ?? ""}%)`
                        : String(item)
                    ).join(", ")
                  : typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="report-kpis">
        <div className="report-kpi">
          <Target size={22} />
          <span>Target Reduction</span>
          <strong>{format(kpis.expected_reduction_c)}°C</strong>
        </div>
        <div className="report-kpi">
          <TrendingDown size={22} />
          <span>Estimated Impact</span>
          <strong>{format(kpis.estimated_reduction_c)}°C</strong>
        </div>
        <div className="report-kpi">
          <Users size={22} />
          <span>Effectiveness</span>
          <strong>{format(kpis.effectiveness_pct, 1)}%</strong>
        </div>
        <div className="report-kpi">
          <AlertTriangle size={22} />
          <span>Overall Status</span>
          <strong className="report-warning">{selectedDecision}</strong>
        </div>
      </section>

      <section className="panel report-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CONSOLIDATED EVIDENCE</div>
            <h2>Evaluation Summary</h2>
            <p className="panel-description">
              Key findings collected from the EVALADAPT evaluation modules.
            </p>
          </div>
        </div>

        <div className="evidence-table-wrapper">
          <table className="evidence-table">
            <thead>
              <tr>
                <th>Evaluation Indicator</th>
                <th>Result</th>
                <th>Assessment</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map(item => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td className="evidence-result">{item.result}</td>
                  <td>
                    <span className="evidence-status">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel report-section">
        <div className="eyebrow">DECISION FRAMEWORK</div>
        <h2>Possible Intervention Decisions</h2>
        <p className="panel-description">
          EVALADAPT supports three possible decisions based on accumulated evidence.
        </p>

        <div className="decision-options">
          {decisionOptions.map(option => {
            const Icon = option.icon;
            const isSelected = option.name === selectedDecision;

            return (
              <div
                className={`decision-option ${isSelected ? "selected-option" : ""}`}
                key={option.name}
              >
                <div className="option-icon">
                  <Icon size={25} />
                </div>
                <strong>{option.name}</strong>
                {isSelected && (
                  <span className="selected-label">CURRENT DECISION</span>
                )}
                <p>{option.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel report-section">
        <div className="eyebrow">RECOMMENDED NEXT STEPS</div>
        <h2>From Evidence to Action</h2>

        <div className="action-list">
          {actions.map((action, index) => (
            <div key={index}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>
                  {typeof action === "string"
                    ? action
                    : action.title || action.action || JSON.stringify(action)}
                </strong>
                {typeof action === "object" && action.description && (
                  <p>{action.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel report-section">
        <div className="eyebrow">DECISION TRANSPARENCY</div>
        <h2>Rules & Evaluation Caveats</h2>

        <div className="ai-limitations">
          <Info size={20} />
          <div>
            <strong>Decision thresholds</strong>
            <p>{JSON.stringify(decision.thresholds)}</p>
            <p>{JSON.stringify(decision.rules_evaluated)}</p>
          </div>
        </div>

        <div className="ai-limitations">
          <ShieldCheck size={20} />
          <div>
            <strong>Important limitations</strong>
            {(decision.caveats || []).map((item, index) => (
              <p key={index}>
                {typeof item === "string" ? item : JSON.stringify(item)}
              </p>
            ))}
            <p>{diagnosis.disclaimer}</p>
          </div>
        </div>
      </section>

      <section className="report-footer">
        <div>
          <FileText size={23} />
          <div>
            <strong>Evaluation Report</strong>
            <span>EVALADAPT · Urban Heat Adaptation · Pune</span>
          </div>
        </div>

        <button className="report-print-button" onClick={printReport}>
          <Download size={18} />
          Print / Save Report
        </button>
      </section>

      <div className="report-disclaimer">
        <Info size={18} />
        <p>
          This prototype uses synthetic demonstration data, not verified Pune
          field measurements. Final recommendations require validated data,
          appropriate causal evaluation methods and expert review.
        </p>
      </div>
    </div>
  );
}
