import { useEffect, useState } from "react";
import {
  Building2, CalendarDays, MapPinned, Upload, FileSpreadsheet,
  CheckCircle2, AlertCircle, X, Database
} from "lucide-react";
import { getInterventions, uploadDataset } from "../services/api";

const requiredColumns = [
  "zone_id", "zone_name", "group", "month", "temp_c",
  "roof_coverage_pct", "vulnerability_index", "population_density",
  "green_cover_pct", "expected_reduction_c", "lat", "lon"
];

export default function Interventions() {
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [zones, setZones] = useState([]);
  const [dataNotice, setDataNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInterventions() {
    try {
      const response = await getInterventions();
      setIntervention(response.data.interventions?.[0] || null);
      setZones(response.data.zones || []);
      setDataNotice(response.data.data_notice || "");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load intervention data. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterventions();
  }, []);

  function handleFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setValidation(null);
    setUploadResult(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setValidation({
        success: false,
        message: "Please select a CSV file."
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const firstLine = String(e.target.result || "").split(/\r?\n/)[0];
      const headers = firstLine.split(",").map(h =>
        h.replace(/^\uFEFF/, "").trim().replace(/^"|"$/g, "")
      );
      const missing = requiredColumns.filter(col => !headers.includes(col));

      if (missing.length > 0) {
        setValidation({
          success: false,
          message: `Missing required columns: ${missing.join(", ")}`
        });
      } else {
        setValidation({
          success: true,
          message: "All 12 required columns found. Dataset is ready for upload."
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

  async function handleUpload() {
    if (!file || !validation?.success) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await uploadDataset(file);
      const result = response.data;

      setUploadResult({
        success: true,
        message: result.message || "Dataset uploaded and evaluated successfully.",
        runId: result.run_id,
        decision: result.decision,
        report: result.preprocessing_report
      });

      loadInterventions().catch(console.error);
    } catch (err) {
      console.error("Dataset upload error:", err);
      setUploadResult({
        success: false,
        message:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Dataset upload failed. Check the CSV format and backend."
      });
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setValidation(null);
    setUploadResult(null);
    const input = document.getElementById("dataset-upload");
    if (input) input.value = "";
  }

  const treatedCount = zones.filter(z => z.grp === "treated").length;
  const controlCount = zones.filter(z => z.grp === "control").length;

  const averageCoverage = zones.length
    ? zones
        .filter(z => z.grp === "treated")
        .reduce((sum, z, _, arr) =>
          sum + Number(z.roof_coverage_pct || 0) / (arr.length || 1), 0)
    : 0;

  const averageExpected = zones.length
    ? zones
        .filter(z => z.grp === "treated")
        .reduce((sum, z, _, arr) =>
          sum + Number(z.expected_reduction_c || 0) / (arr.length || 1), 0)
    : 0;

  if (loading) {
    return <div className="module-page"><h2>Loading intervention data...</h2></div>;
  }

  if (error) {
    return <div className="module-page"><h2>Unable to load data</h2><p>{error}</p></div>;
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

      {dataNotice && (
        <div className="synthetic-notice">
          <InfoIcon />
          <div>
            <strong>SYNTHETIC ILLUSTRATIVE DATA</strong>
            <p>{dataNotice}</p>
          </div>
        </div>
      )}

      <section className="intervention-banner">
        <div className="intervention-symbol"><Building2 size={34} /></div>
        <div className="intervention-banner-content">
          <div className="eyebrow">ACTIVE CASE STUDY · PHASE 1</div>
          <h2>{intervention?.name || "Urban Cool Roof Program"}</h2>
          <p>{intervention?.description}</p>
          <div className="banner-tags">
            <span><MapPinned size={15} /> {intervention?.city || "Pune, Maharashtra"}</span>
            <span><CalendarDays size={15} /> Started: {intervention?.start_date || "Not specified"}</span>
            <span><Database size={15} /> {intervention?.data_type || "Prototype Dataset"}</span>
          </div>
        </div>
        <span className="status-pill">Under Evaluation</span>
      </section>

      <section className="intervention-stats">
        <div className="module-stat">
          <span>Intervention Type</span>
          <strong>{intervention?.type || "Cool Roof Installation"}</strong>
          <small>Reflective rooftop intervention</small>
        </div>
        <div className="module-stat">
          <span>Evaluation Zones</span>
          <strong>{zones.length} Zones</strong>
          <small>{treatedCount} treated · {controlCount} control</small>
        </div>
        <div className="module-stat">
          <span>Average Roof Coverage</span>
          <strong>{averageCoverage.toFixed(1)}%</strong>
          <small>Across treated zones</small>
        </div>
        <div className="module-stat">
          <span>Expected Reduction</span>
          <strong>{averageExpected.toFixed(3)}°C</strong>
          <small>Average treated-zone target</small>
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
            <strong>{intervention?.name}</strong>
          </div>
          <div className="detail-item">
            <span>Climate challenge</span>
            <strong>Urban Heat Island Effect</strong>
          </div>
          <div className="detail-item">
            <span>Intervention type</span>
            <strong>{intervention?.type}</strong>
          </div>
          <div className="detail-item">
            <span>Average expected outcome</span>
            <strong>{averageExpected.toFixed(3)}°C reduction</strong>
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
              Actual zone records supplied by the backend.
            </p>
          </div>
          <span className="zone-count">{zones.length} ZONES</span>
        </div>

        <div className="table-scroll">
          <table className="zones-table">
            <thead>
              <tr>
                <th>Municipal Zone</th>
                <th>Evaluation Group</th>
                <th>Vulnerability</th>
                <th>Roof Coverage</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => {
                const treated = zone.grp === "treated";
                return (
                  <tr key={zone.zone_id}>
                    <td><strong>{zone.zone_name}</strong></td>
                    <td>
                      <span className={treated ? "group-tag treated" : "group-tag control"}>
                        {treated ? "Treated" : "Control"}
                      </span>
                    </td>
                    <td>{Number(zone.vulnerability_index) >= 0.5 ? "High" : "Low"}</td>
                    <td>{Number(zone.roof_coverage_pct).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          {dataNotice || "Zone records are supplied by the evaluation backend."}
        </p>
      </section>

      <section className="panel upload-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DATA MANAGEMENT</div>
            <h2>Upload Evaluation Dataset</h2>
            <p className="panel-description">
              Upload a CSV containing before-and-after observations for evaluation.
            </p>
          </div>
          <FileSpreadsheet size={30} className="upload-heading-icon" />
        </div>

        <label className="upload-dropzone" htmlFor="dataset-upload">
          <div className="upload-icon"><Upload size={30} /></div>
          <strong>Choose a CSV file to upload</strong>
          <span>CSV format · 12 required evaluation columns</span>
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

        {validation?.success && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              marginTop: "16px",
              padding: "12px 22px",
              border: "none",
              borderRadius: "8px",
              background: uploading ? "#52666b" : "#159b7d",
              color: "white",
              fontWeight: 600,
              cursor: uploading ? "wait" : "pointer"
            }}
          >
            {uploading ? "Uploading and evaluating..." : "Upload & Run Evaluation"}
          </button>
        )}

        {uploadResult && (
          <div className={uploadResult.success ? "validation-message success" : "validation-message error"}>
            {uploadResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>
              <strong>{uploadResult.message}</strong>
              {uploadResult.success && (
                <p>
                  Run ID: {uploadResult.runId} · Decision: {uploadResult.decision}
                  {uploadResult.report && ` · Rows processed: ${uploadResult.report.rows_out}`}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="required-fields">
          <h3>Required Dataset Columns</h3>
          <p>Use these exact column names in your CSV:</p>
          <div className="field-tags">
            {requiredColumns.map(col => <code key={col}>{col}</code>)}
          </div>
        </div>

        <div className="upload-info">
          <AlertCircle size={18} />
          <span>
            Uploading a valid CSV sends it to FastAPI, runs preprocessing,
            evaluation, AI diagnosis and decision generation, and saves the new results in SQLite.
          </span>
        </div>
      </section>
    </div>
  );
}

function InfoIcon() {
  return <AlertCircle size={23} />;
}
