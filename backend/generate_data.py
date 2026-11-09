"""Generates SYNTHETIC data for the Pune Cool Roof demo. Not real measurements."""
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box

from backend.config import (RAW_DIR, RAW_CSV, ZONES_GEOJSON,
                            INTERVENTION_DATE, SEED)


def build_zones(rng):
    n_cols, n_rows, step = 6, 4, 0.025
    lon0, lat0 = 73.78, 18.46
    recs = []
    for i in range(n_cols * n_rows):
        r, c = divmod(i, n_cols)
        recs.append({
            "zone_id": f"Z{i+1:02d}",
            "zone_name": f"Zone {i+1:02d}",
            "lon": round(lon0 + (c + 0.5) * step, 5),
            "lat": round(lat0 + (r + 0.5) * step, 5),
            "geometry": box(lon0 + c * step, lat0 + r * step,
                            lon0 + (c + 1) * step, lat0 + (r + 1) * step),
        })
    z = gpd.GeoDataFrame(recs, crs="EPSG:4326")
    n = len(z)

    treated = np.zeros(n, bool)
    treated[rng.choice(n, 16, replace=False)] = True
    z["group"] = np.where(treated, "treated", "control")

    z["vulnerability_index"] = rng.beta(2, 2, n).round(3)
    z["population_density"] = (6000 + 14000 * z.vulnerability_index
                               + rng.normal(0, 1200, n)).clip(3000).round(0)
    z["green_cover_pct"] = (25 - 18 * z.vulnerability_index
                            + rng.normal(0, 3, n)).clip(3, 40).round(1)

    cov = 62 - 25 * z.vulnerability_index + rng.normal(0, 6, n)
    z["roof_coverage_pct"] = np.where(treated, cov.clip(15, 85), 0).round(1)
    # Planning assumption: 0.012 C cooling per 1% roof coverage
    z["expected_reduction_c"] = (0.012 * z.roof_coverage_pct).round(3)
    z["baseline_temp_c"] = (31 + 4 * (z.population_density - 3000) / 17000
                            - 0.05 * z.green_cover_pct + rng.normal(0, 0.4, n))

    # HIDDEN ground truth (never written to the CSV): how well roofs really perform
    eff = (1.0 - 0.45 * z.vulnerability_index + rng.normal(0, 0.08, n)).clip(0.1, 1.1)
    z["_efficiency"] = eff
    weak = z.loc[z.group == "treated", "population_density"].nlargest(2).index
    z.loc[weak, "_efficiency"] = 0.2
    print("Hidden underperforming zones (for your reference only):",
          list(z.loc[weak, "zone_id"]))
    return z


def build_observations(z, rng):
    months = pd.date_range("2024-01-01", "2025-12-01", freq="MS")
    rows = []
    for _, zr in z.iterrows():
        for k, m in enumerate(months):
            seasonal = 5 * np.cos(2 * np.pi * (m.month - 5) / 12)  # peaks in May
            trend = 0.02 * k                                       # slow warming
            effect = 0.0
            if zr.group == "treated" and m >= INTERVENTION_DATE:
                since = ((m.year - INTERVENTION_DATE.year) * 12
                         + m.month - INTERVENTION_DATE.month)
                decay = 1 - 0.015 * since   # slight ageing/dust deterioration
                effect = -zr.expected_reduction_c * zr._efficiency * decay
            temp = zr.baseline_temp_c + seasonal + trend + effect + rng.normal(0, 0.35)
            rows.append({
                "zone_id": zr.zone_id, "zone_name": zr.zone_name,
                "group": zr.group, "month": m, "temp_c": round(temp, 2),
                "roof_coverage_pct": zr.roof_coverage_pct,
                "vulnerability_index": zr.vulnerability_index,
                "population_density": zr.population_density,
                "green_cover_pct": zr.green_cover_pct,
                "expected_reduction_c": zr.expected_reduction_c,
                "lat": zr.lat, "lon": zr.lon,
            })
    return pd.DataFrame(rows)


def add_messiness(df, rng):
    """Inject realistic data errors so preprocessing has real work to do."""
    n = len(df)
    df.loc[rng.choice(n, int(0.02 * n), replace=False), "temp_c"] = np.nan
    df.loc[rng.choice(n, 2, replace=False), "temp_c"] = [99.9, -5.0]
    df.loc[rng.choice(n, int(0.01 * n), replace=False), "vulnerability_index"] = np.nan
    idx = rng.choice(n, int(0.05 * n), replace=False)
    df.loc[idx, "group"] = df.loc[idx, "group"].map(
        {"treated": "Treated ", "control": "CONTROL"})
    df = pd.concat([df, df.sample(3, random_state=SEED)], ignore_index=True)
    df["month"] = pd.to_datetime(df["month"]).dt.strftime("%Y-%m-%d")
    return df


def main():
    rng = np.random.default_rng(SEED)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    zones = build_zones(rng)
    df = add_messiness(build_observations(zones, rng), rng)
    df.to_csv(RAW_CSV, index=False)
    zones.drop(columns=["_efficiency"]).to_file(ZONES_GEOJSON, driver="GeoJSON")
    print(f"Saved {len(df)} rows -> {RAW_CSV}")
    print(f"Saved zone polygons -> {ZONES_GEOJSON}")


if __name__ == "__main__":
    main()