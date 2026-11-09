import Plot from "react-plotly.js";
import {
  Users, MapPinned, Scale, TrendingUp, AlertTriangle, Info
} from "lucide-react";

const wards = [
  { name: "Aundh Ward", vulnerability: "Low", reduction: 1.65, coverage: 78 },
  { name: "Baner Ward", vulnerability: "Low", reduction: 1.50, coverage: 72 },
  { name: "Kothrud Ward", vulnerability: "High", reduction: 1.40, coverage: 68 },
  { name: "Hadapsar Ward", vulnerability: "High", reduction: 1.25, coverage: 54 },
  { name: "Pimpri Ward", vulnerability: "High", reduction: 1.10, coverage: 48 }
];

const high = wards.filter(w => w.vulnerability === "High");
const low = wards.filter(w => w.vulnerability === "Low");

const average = items =>
  items.reduce((sum, item) => sum + item.reduction, 0) / items.length;

const highAverage = average(high);
const lowAverage = average(low);

const chartLayout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#c3d4d6", family: "DM Sans" },
  margin: { t: 25, r: 25, b: 55, l: 65 },
  xaxis: { gridcolor: "#263e45", linecolor: "#40565c" },
  yaxis: { gridcolor: "#263e45", linecolor: "#40565c" }
};

const config = { responsive: true, displaylogo: false };

export default function ImpactEquity() {
  return (
    <div className="module-page">
      <section className="module-hero">
        <div className="eyebrow">DISTRIBUTION & EQUITY ANALYSIS</div>
        <h1>Impact & Equity</h1>
        <p>
          Understand who benefits from climate adaptation interventions,
          identify unequal outcomes, and examine differences between vulnerable
          and less-vulnerable communities.
        </p>
      </section>

      <div className="equity-notice">
        <Info size={19} />
        <span>
          SIMULATED PROTOTYPE DATA — Ward-level values and vulnerability
          classifications are illustrative, not verified field measurements.
        </span>
      </div>

      <section className="equity-kpis">
        <div className="equity-kpi">
          <Users size={23} />
          <span>High Vulnerability Zones</span>
          <strong>3</strong>
          <small>Of 5 evaluation wards</small>
        </div>
        <div className="equity-kpi">
          <Scale size={23} />
          <span>High Vulnerability Average</span>
          <strong>{highAverage.toFixed(2)}°C</strong>
          <small>Illustrative cooling reduction</small>
        </div>
        <div className="equity-kpi">
          <TrendingUp size={23} />
          <span>Low Vulnerability Average</span>
          <strong>{lowAverage.toFixed(2)}°C</strong>
          <small>Illustrative cooling reduction</small>
        </div>
        <div className="equity-kpi">
          <MapPinned size={23} />
          <span>Average Group Difference</span>
          <strong>{(lowAverage - highAverage).toFixed(2)}°C</strong>
          <small>Low minus high vulnerability</small>
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DISTRIBUTION OF BENEFITS</div>
            <h2>Cooling Benefits by Vulnerability</h2>
            <p className="panel-description">
              Compare the average illustrative temperature reduction
              across vulnerability groups.
            </p>
          </div>
        </div>

        <div className="equity-chart">
          <Plot
            data={[{
              x: ["High Vulnerability", "Low Vulnerability"],
              y: [highAverage, lowAverage],
              type: "bar",
              marker: { color: ["#d49a43", "#10a981"] },
              text: [`${highAverage.toFixed(2)}°C`, `${lowAverage.toFixed(2)}°C`],
              textposition: "outside",
              textfont: { color: "#f0f6f5", size: 15 },
              hovertemplate: "%{x}: %{y:.2f}°C<extra></extra>"
            }]}
            layout={{
              ...chartLayout,
              height: 340,
              showlegend: false,
              yaxis: {
                ...chartLayout.yaxis,
                title: "Average temperature reduction (°C)",
                range: [0, 2]
              }
            }}
            config={config}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>

        <div className="equity-insight">
          <AlertTriangle size={22} />
          <div>
            <strong>Potential distribution gap identified</strong>
            <p>
              In this simulated dataset, high-vulnerability wards show a
              lower average cooling reduction than low-vulnerability wards.
              This difference should be investigated alongside coverage,
              baseline conditions and other relevant factors.
            </p>
          </div>
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">WARD-LEVEL PERFORMANCE</div>
            <h2>Cooling Impact Across Evaluation Zones</h2>
            <p className="panel-description">
              Examine how the simulated cooling benefit varies across wards.
            </p>
          </div>
        </div>

        <div className="equity-chart">
          <Plot
            data={[{
              x: wards.map(w => w.reduction),
              y: wards.map(w => w.name),
              type: "bar",
              orientation: "h",
              marker: {
                color: wards.map(w =>
                  w.vulnerability === "High" ? "#d49a43" : "#10a981"
                )
              },
              text: wards.map(w => `${w.reduction.toFixed(2)}°C`),
              textposition: "outside",
              textfont: { color: "#f0f6f5", size: 13 },
              hovertemplate: "%{y}: %{x:.2f}°C<extra></extra>"
            }]}
            layout={{
              ...chartLayout,
              height: 340,
              margin: { t: 20, r: 70, b: 50, l: 115 },
              xaxis: {
                ...chartLayout.xaxis,
                title: "Temperature reduction (°C)",
                range: [0, 2]
              }
            }}
            config={config}
            style={{ width: "100%" }}
            useResizeHandler
          />
        </div>

        <div className="equity-legend">
          <span><i className="legend-dot high"></i> High vulnerability</span>
          <span><i className="legend-dot low"></i> Low vulnerability</span>
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">COVERAGE & ACCESS</div>
            <h2>Intervention Coverage by Ward</h2>
            <p className="panel-description">
              Examine whether the intervention reaches all evaluation zones.
            </p>
          </div>
        </div>

        <div className="coverage-list">
          {wards.map(ward => (
            <div className="coverage-item" key={ward.name}>
              <div className="coverage-label">
                <strong>{ward.name}</strong>
                <span>{ward.coverage}%</span>
              </div>
              <div className="coverage-track">
                <div
                  className={ward.vulnerability === "High" ? "coverage-fill high-fill" : "coverage-fill"}
                  style={{ width: `${ward.coverage}%` }}
                />
              </div>
              <small>{ward.vulnerability} vulnerability</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="eyebrow">EQUITY DIAGNOSIS</div>
        <h2>What Should Be Investigated?</h2>

        <div className="equity-diagnosis-grid">
          <div>
            <span className="diagnosis-number">01</span>
            <strong>Unequal coverage</strong>
            <p>
              Check whether high-vulnerability wards receive adequate
              intervention coverage.
            </p>
          </div>
          <div>
            <span className="diagnosis-number">02</span>
            <strong>Unequal outcomes</strong>
            <p>
              Investigate why cooling benefits may differ between
              vulnerability groups.
            </p>
          </div>
          <div>
            <span className="diagnosis-number">03</span>
            <strong>Spatial differences</strong>
            <p>
              Examine location-specific conditions, surrounding land cover
              and potential spillover effects.
            </p>
          </div>
        </div>

        <div className="equity-method-note">
          <Info size={19} />
          <p>
            Vulnerability comparisons identify differences in outcomes;
            they do not independently establish discrimination, causality
            or maladaptation. More detailed demographic and spatial data
            are required for stronger conclusions.
          </p>
        </div>
      </section>
    </div>
  );
}
