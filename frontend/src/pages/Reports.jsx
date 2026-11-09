import {
  FileText, Download, CheckCircle2, AlertTriangle,
  Search, Target, TrendingDown, Users, ShieldCheck,
  ArrowRight, Info
} from "lucide-react";

const evidence = [
  {
    category: "Expected temperature reduction",
    result: "2.0°C",
    status: "Program target"
  },
  {
    category: "Observed temperature reduction",
    result: "1.4°C",
    status: "Below target"
  },
  {
    category: "Difference-in-Differences estimate",
    result: "0.9°C",
    status: "Illustrative estimate"
  },
  {
    category: "Intervention coverage",
    result: "68%",
    status: "Requires review"
  },
  {
    category: "Equity assessment",
    result: "Distribution gap",
    status: "Requires investigation"
  },
  {
    category: "AI-assisted diagnosis",
    result: "3 potential findings",
    status: "Illustrative output"
  }
];

export default function Reports() {
  const printReport = () => window.print();

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
          PROTOTYPE REPORT — All displayed results are simulated.
          They are not verified measurements or official Pune findings.
        </span>
      </div>

      <section className="decision-card">
        <div className="decision-top">
          <div>
            <div className="eyebrow">SYSTEM RECOMMENDATION</div>
            <h2>Recommended Action</h2>
          </div>
          <span className="decision-status">DECISION PREVIEW</span>
        </div>

        <div className="decision-main">
          <div className="decision-icon">
            <Search size={34} />
          </div>
          <div>
            <span className="decision-label">INVESTIGATE</span>
            <h3>Further evidence is required</h3>
            <p>
              The illustrative results indicate below-target performance
              and differences in benefit distribution. Investigate the
              underlying factors before deciding whether to continue or
              modify the program.
            </p>
          </div>
        </div>

        <div className="decision-reasons">
          <div>
            <TrendingDown size={20} />
            <span>Observed reduction is 0.6°C below target.</span>
          </div>
          <div>
            <Users size={20} />
            <span>Cooling benefits differ across vulnerability groups.</span>
          </div>
          <div>
            <ShieldCheck size={20} />
            <span>Results require validation with reliable field data.</span>
          </div>
        </div>
      </section>

      <section className="report-kpis">
        <div className="report-kpi">
          <Target size={22} />
          <span>Target Reduction</span>
          <strong>2.0°C</strong>
        </div>
        <div className="report-kpi">
          <TrendingDown size={22} />
          <span>Observed Reduction</span>
          <strong>1.4°C</strong>
        </div>
        <div className="report-kpi">
          <Users size={22} />
          <span>Coverage</span>
          <strong>68%</strong>
        </div>
        <div className="report-kpi">
          <AlertTriangle size={22} />
          <span>Overall Status</span>
          <strong className="report-warning">Under Review</strong>
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
          EVALADAPT supports three possible decisions based on the
          accumulated evaluation evidence.
        </p>

        <div className="decision-options">
          <div className="decision-option">
            <div className="option-icon continue-icon">
              <CheckCircle2 size={25} />
            </div>
            <strong>CONTINUE</strong>
            <p>
              Continue implementation when outcomes meet expectations
              and sufficient evidence supports performance.
            </p>
          </div>

          <div className="decision-option">
            <div className="option-icon modify-icon">
              <Target size={25} />
            </div>
            <strong>MODIFY</strong>
            <p>
              Adjust implementation, targeting or resource allocation
              when validated evidence identifies correctable gaps.
            </p>
          </div>

          <div className="decision-option selected-option">
            <div className="option-icon investigate-icon">
              <Search size={25} />
            </div>
            <strong>INVESTIGATE</strong>
            <span className="selected-label">CURRENT PREVIEW</span>
            <p>
              Collect more evidence and examine uncertain or unequal
              outcomes before making further decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="panel report-section">
        <div className="eyebrow">RECOMMENDED NEXT STEPS</div>
        <h2>From Evidence to Action</h2>

        <div className="action-list">
          <div>
            <span>01</span>
            <div>
              <strong>Validate field measurements</strong>
              <p>Collect reliable before-and-after temperature observations.</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>Review intervention coverage</strong>
              <p>Identify areas where implementation may be insufficient.</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>Investigate equity differences</strong>
              <p>Examine whether vulnerable communities receive comparable benefits.</p>
            </div>
          </div>
          <div>
            <span>04</span>
            <div>
              <strong>Re-evaluate intervention performance</strong>
              <p>Update the assessment after collecting additional evidence.</p>
            </div>
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
          This prototype demonstrates an evaluation and decision-support
          workflow. Final recommendations must be based on validated data,
          appropriate causal evaluation methods and expert review.
        </p>
      </div>
    </div>
  );
}
