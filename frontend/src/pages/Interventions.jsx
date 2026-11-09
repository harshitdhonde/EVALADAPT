import { useState } from "react";
import {
  Building2, CalendarDays, MapPinned, Upload, FileSpreadsheet,
  CheckCircle2, AlertCircle, X, Database
} from "lucide-react";

const requiredColumns = [
  "zone_id",
  "zone_name",
  "period",
  "group",
  "roof_type",
  "avg_temperature",
  "vulnerability",
  "intervention_coverage",
  "expected_reduction",
  "latitude",
  "longitude"
];

const zones = [
  { name: "Aundh Ward", type: "Treated", vulnerability: "Low", coverage: "78%" },
  { name: "Baner Ward", type: "Treated", vulnerability: "Low", coverage: "72%" },
  { name: "Kothrud Ward", type: "Treated", vulnerability: "High", coverage: "68%" },
  { name: "Hadapsar Ward", type: "Control", vulnerability: "High", coverage: "0%" },
  { name: "Pimpri Ward", type: "Control", vulnerability: "High", coverage: "0%" }
];

export default function Interventions() {
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);

  function handleFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setValidation(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setValidation({
        success: false,
        message: "Please upload a CSV file."
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const firstLine = String(e.target.result || "").split(/\r?\n/)[0];
      const headers = firstLine.split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const missing = requiredColumns.filter(col => !headers.includes(col));

      if (missing.length > 0) {
        setValidation({
          success: false,
          message: `Missing required columns: ${missing.join(", ")}`
        });
      } else {
        setValidation({
          success: true,
          message: "All required columns are present. File is ready for backend processing."
        });
      }
    };

    reader.onerror = () => {
      setValidation({
        success: false,
        message: "Unable to read this file. Please try again."
      });
    };

    reader.readAsText(selected.slice(0, 10000));
  }

  function clearFile() {
    setFile(null);
    setValidation(null);
    const input = document.getElementById("dataset-upload");
    if (input) input.value = "";
  }

  return (
    <div className="module-page">
      <section className="module-hero">
        <div className="eyebrow">INTERVENTION MANAGEMENT</div>
        <h1>Interventions & Data</h1>
        <p>
          Define climate adaptation interventions, identify evaluation zones,
          and manage the datasets used to measure their outcomes.
        </p>
      </section>

      <section className="intervention-banner">
        <div className="intervention-symbol"><Building2 size={34} /></div>
        <div className="intervention-banner-content">
          <div className="eyebrow">ACTIVE CASE STUDY · PHASE 1</div>
          <h2>Urban Cool Roof Program</h2>
          <p>
            Evaluating the effectiveness and distribution of cool roof
            interventions across selected Pune municipal wards.
          </p>
          <div className="banner-tags">
            <span><MapPinned size={15} /> Pune, Maharashtra</span>
            <span><CalendarDays size={15} /> Before / After Evaluation</span>
            <span><Database size={15} /> Prototype Dataset</span>
          </div>
        </div>
        <span className="status-pill">Under Evaluation</span>
      </section>

      <section className="intervention-stats">
        <div className="module-stat">
          <span>Intervention Type</span>
          <strong>Cool Roof Installation</strong>
          <small>Reflective rooftop coating</small>
        </div>
        <div className="module-stat">
          <span>Evaluation Zones</span>
          <strong>5 Wards</strong>
          <small>Treated and control groups</small>
        </div>
        <div className="module-stat">
          <span>Target Coverage</span>
          <strong>68%</strong>
          <small>Illustrative program coverage</small>
        </div>
        <div className="module-stat">
          <span>Evaluation Period</span>
          <strong>Before / After</strong>
          <small>Two observation periods</small>
        </div>
      </section>

      <section className="panel intervention-details">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PROGRAM CONFIGURATION</div>
            <h2>Intervention Details</h2>
            <p className="panel-description">The intervention being evaluated in this prototype.</p>
          </div>
          <span className="sample-badge">SAMPLE CONFIGURATION</span>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span>Intervention name</span>
            <strong>Urban Cool Roof Program</strong>
          </div>
          <div className="detail-item">
            <span>Climate challenge</span>
            <strong>Urban Heat Island Effect</strong>
          </div>
          <div className="detail-item">
            <span>Primary objective</span>
            <strong>Reduce rooftop heat absorption</strong>
          </div>
          <div className="detail-item">
            <span>Expected outcome</span>
            <strong>2.0°C temperature reduction</strong>
          </div>
          <div className="detail-item">
            <span>Evaluation approach</span>
            <strong>Before / After + Difference-in-Differences</strong>
          </div>
          <div className="detail-item">
            <span>Current status</span>
            <strong className="text-teal">Under evaluation</strong>
          </div>
        </div>
      </section>

      <section className="panel zones-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">SPATIAL EVALUATION DESIGN</div>
            <h2>Treated & Control Zones</h2>
            <p className="panel-description">
              Comparison groups used to evaluate changes in temperature.
            </p>
          </div>
          <span className="zone-count">5 ZONES</span>
        </div>

        <div className="table-scroll">
          <table className="zones-table">
            <thead>
              <tr>
                <th>Municipal Ward</th>
                <th>Evaluation Group</th>
                <th>Vulnerability</th>
                <th>Intervention Coverage</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone.name}>
                  <td><strong>{zone.name}</strong></td>
                  <td>
                    <span className={zone.type === "Treated" ? "group-tag treated" : "group-tag control"}>
                      {zone.type}
                    </span>
                  </td>
                  <td>{zone.vulnerability}</td>
                  <td>{zone.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          All zone assignments and coverage values are illustrative prototype data.
        </p>
      </section>

      <section className="panel upload-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DATA MANAGEMENT</div>
            <h2>Upload Evaluation Dataset</h2>
            <p className="panel-description">
              Import a CSV file containing before-and-after observations for the evaluation engine.
            </p>
          </div>
          <FileSpreadsheet size={30} className="upload-heading-icon" />
        </div>

        <label className="upload-dropzone" htmlFor="dataset-upload">
          <div className="upload-icon"><Upload size={30} /></div>
          <strong>Choose a CSV file to upload</strong>
          <span>CSV format · Required evaluation columns</span>
          <span className="upload-browse">Browse Files</span>
          <input
            id="dataset-upload"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            hidden
          />
        </label>

        {file && (
          <div className="selected-file">
            <FileSpreadsheet size={23} />
            <div>
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <button onClick={clearFile} aria-label="Remove selected file">
              <X size={20} />
            </button>
          </div>
        )}

        {validation && (
          <div className={validation.success ? "validation-message success" : "validation-message error"}>
            {validation.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{validation.message}</span>
          </div>
        )}

        <div className="required-fields">
          <h3>Required Dataset Columns</h3>
          <p>Make sure your CSV contains these exact column names:</p>
          <div className="field-tags">
            {requiredColumns.map(col => <code key={col}>{col}</code>)}
          </div>
        </div>

        <div className="upload-info">
          <AlertCircle size={18} />
          <span>
            Frontend validation only: the selected file has not yet been saved
            to the evaluation database. Backend upload will be enabled when the API is connected.
          </span>
        </div>
      </section>
    </div>
  );
}
