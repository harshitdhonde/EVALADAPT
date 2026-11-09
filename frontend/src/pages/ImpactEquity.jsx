import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  Users, MapPinned, Scale, TrendingUp, AlertTriangle, Info
} from "lucide-react";
import { getImpactEquity } from "../services/api";

const chartLayout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#5b4657", family: "DM Sans" },
  margin: { t: 25, r: 25, b: 55, l: 65 },
  xaxis: { gridcolor: "#e9dfd6", linecolor: "#d9c7d5" },
  yaxis: { gridcolor: "#e9dfd6", linecolor: "#d9c7d5" }
};

const config = { responsive: true, displaylogo: false };

export default function ImpactEquity() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getImpactEquity()
      .then(response => setData(response.data))
      .catch(() => setError("Unable to load impact and equity data. Check that the backend is running."));
  }, []);

  if (error) {
    return <div className="module-page"><p>{error}</p></div>;
  }

  if (!data) {
    return <div className="module-page"><p>Loading impact and equity analysis...</p></div>;
  }

  const equity = data.equity;
  const high = equity.groups.high;
  const low = equity.groups.low;
  const zones = data.zone_effects || [];

  const highAverage = high.mean_estimated_reduction_c;
  const lowAverage = low.mean_estimated_reduction_c;
  const difference = lowAverage - highAverage;

  const zoneColor = zone =>
    String(zone.vulnerability_group).toLowerCase() === "high"
      ? "#a57d9a"
      : "#785b76";

  const sortedZones = [...zones].sort(
    (a, b) => a.effectiveness_pct - b.effectiveness_pct
  );

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
          SYNTHETIC DEMONSTRATION DATA — These values are illustrative,
          not verified Pune field measurements.
        </span>
      </div>

      <section className="equity-kpis">
        <div className="equity-kpi">
          <Users size={23} />
          <span>High Vulnerability Zones</span>
          <strong>{high.n_zones}</strong>
          <small>Of {high.n_zones + low.n_zones} treated zones</small>
        </div>

        <div className="equity-kpi">
          <Scale size={23} />
          <span>High Vulnerability Average</span>
          <strong>{highAverage.toFixed(3)}°C</strong>
          <small>Estimated cooling reduction</small>
        </div>

        <div className="equity-kpi">
          <TrendingUp size={23} />
          <span>Low Vulnerability Average</span>
          <strong>{lowAverage.toFixed(3)}°C</strong>
          <small>Estimated cooling reduction</small>
        </div>

        <div className="equity-kpi">
          <MapPinned size={23} />
          <span>Average Group Difference</span>
          <strong>{difference.toFixed(3)}°C</strong>
          <small>Low minus high vulnerability</small>
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DISTRIBUTION OF BENEFITS</div>
            <h2>Cooling Benefits by Vulnerability</h2>
            <p className="panel-description">
              Compare estimated average temperature reduction across
              vulnerability groups.
            </p>
          </div>
        </div>

        <div className="equity-chart">
          <Plot
            data={[{
              x: ["High Vulnerability", "Low Vulnerability"],
              y: [highAverage, lowAverage],
              type: "bar",
              marker: { color: ["#a57d9a", "#785b76"] },
              text: [`${highAverage.toFixed(3)}°C`, `${lowAverage.toFixed(3)}°C`],
              textposition: "outside",
              textfont: { color: "#f0f6f5", size: 15 },
              hovertemplate: "%{x}: %{y:.3f}°C<extra></extra>"
            }]}
            layout={{
              ...chartLayout,
              height: 340,
              showlegend: false,
              yaxis: {
                ...chartLayout.yaxis,
                title: "Average temperature reduction (°C)",
                rangemode: "tozero"
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
            <strong>
              {equity.verdict === "UNEQUAL"
                ? "Potential distribution gap identified"
                : "No major distribution gap identified"}
            </strong>
            <p>
              High-vulnerability zones receive approximately{" "}
              {equity.equity_ratio.toFixed(3)} times the cooling benefit
              received by low-vulnerability zones. The group comparison
              should be investigated alongside intervention coverage,
              baseline conditions and other relevant factors.
            </p>
            <small>
              Welch comparison p-value: {equity.welch_p_value.toFixed(4)}
            </small>
          </div>
        </div>
      </section>

      <section className="panel equity-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ZONE-LEVEL PERFORMANCE</div>
            <h2>Cooling Impact Across Evaluation Zones</h2>
            <p className="panel-description">
              Compare estimated cooling benefits across all treated zones.
            </p>
          </div>
        </div>

        <div className="equity-chart">
          <Plot
            data={[{
              x: sortedZones.map(zone => zone.effectiveness_pct),
              y: sortedZones.map(zone => zone.zone_name),
              type: "bar",
              orientation: "h",
              marker: { color: sortedZones.map(zoneColor) },
              text: sortedZones.map(zone => `${zone.effectiveness_pct.toFixed(1)}%`),
              textposition: "outside",
              textfont: { color: "#f0f6f5", size: 12 },
              hovertemplate:
                "%{y}: %{x:.1f}% effectiveness<extra></extra>"
            }]}
            layout={{
              ...chartLayout,
              height: Math.max(380, sortedZones.length *  thirtyFive()),
              margin: { t: 20, r: 75, b: 50, l: 115 },
              xaxis: {
                ...chartLayout.xaxis,
                title: "Effectiveness (%)",
                rangemode: "tozero"
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
            <h2>Intervention Coverage by Zone</h2>
            <p className="panel-description">
              Examine roof coverage across treated evaluation zones.
            </p>
          </div>
        </div>

        <div className="coverage-list">
          {sortedZones.map(zone => (
            <div className="coverage-item" key={zone.zone_id}>
              <div className="coverage-label">
                <strong>{zone.zone_name}</strong>
                <span>{zone.roof_coverage_pct.toFixed(1)}%</span>
              </div>
              <div className="coverage-track">
                <div
                  className={
                    String(zone.vulnerability_group).toLowerCase() === "high"
                      ? "coverage-fill high-fill"
                      : "coverage-fill"
                  }
                  style={{ width: `${zone.roof_coverage_pct}%` }}
                />
              </div>
              <small>
                {zone.vulnerability_group} vulnerability
              </small>
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
              Check whether high-vulnerability zones receive adequate
              intervention coverage.
            </p>
          </div>
          <div>
            <span className="diagnosis-number">02</span>
            <strong>Unequal outcomes</strong>
            <p>
              Investigate why estimated cooling benefits differ between
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
            or maladaptation. The reported association is not proof of cause.
          </p>
        </div>
      </section>
    </div>
  );
}

function thirtyFive() {
  return 35;
}
