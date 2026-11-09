"""Impact evaluation: expected vs observed vs estimated (DiD) cooling.
Sign convention everywhere: positive number = cooling (temperature reduction, deg C)."""
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from scipy import stats

from backend.config import DATA_DISCLAIMER


def r(x, n=3):
    """Round safely; NaN/None -> None so JSON stays valid."""
    try:
        x = float(x)
    except (TypeError, ValueError):
        return None
    return None if np.isnan(x) else round(x, n)


def gap_series(df):
    """Monthly treated-minus-control mean temperature."""
    g = df.groupby(["month", "group"])["temp_c"].mean().unstack()
    if "treated" not in g or "control" not in g:
        raise ValueError("Dataset needs both 'treated' and 'control' zones.")
    return (g["treated"] - g["control"]).sort_index(), g


def zone_effects(df):
    """Per-treated-zone DiD: zone change minus control-group change."""
    ctrl = df[df.treated == 0].groupby("period")["temp_c"].mean()
    ctrl_change = ctrl["after"] - ctrl["before"]
    rows = []
    for zid, g in df[df.treated == 1].groupby("zone_id"):
        p = g.groupby("period")["temp_c"].mean()
        if not {"before", "after"} <= set(p.index):
            continue
        est = -((p["after"] - p["before"]) - ctrl_change)
        f = g.iloc[0]
        exp = float(f.expected_reduction_c)
        rows.append({
            "zone_id": zid, "zone_name": f.zone_name,
            "vulnerability_index": float(f.vulnerability_index),
            "vulnerability_group": f.vulnerability_group,
            "population_density": float(f.population_density),
            "green_cover_pct": float(f.green_cover_pct),
            "roof_coverage_pct": float(f.roof_coverage_pct),
            "baseline_temp_c": float(p["before"]),
            "expected_reduction_c": exp,
            "estimated_reduction_c": float(est),
            "effectiveness_pct": float(est / exp * 100) if exp > 0 else np.nan,
            "lat": float(f.lat), "lon": float(f.lon),
        })
    return pd.DataFrame(rows)


def impact_evaluation(df):
    gap, g = gap_series(df)

    # Two-way fixed effects DiD (zone + month effects), zone-clustered SEs
    d = df.copy()
    d["month_str"] = d["month"].dt.strftime("%Y-%m")
    model = smf.ols("temp_c ~ treated:post + C(zone_id) + C(month_str)", data=d).fit(
        cov_type="cluster", cov_kwds={"groups": pd.factorize(d["zone_id"])[0]})
    key = "treated:post"
    coef, se, p = model.params[key], model.bse[key], model.pvalues[key]
    lo, hi = model.conf_int().loc[key]
    estimated = -coef  # cooling

    # Raw before/after in treated zones only (NOT adjusted for trend)
    tm = d[d.treated == 1].groupby("period")["temp_c"].mean()
    observed_raw = -(tm["after"] - tm["before"])

    expected = df[df.treated == 1].groupby("zone_id")["expected_reduction_c"].first().mean()
    eff = estimated / expected * 100 if expected > 0 else np.nan

    # Parallel-trends check on pre-period gap
    pre = gap[gap.index < d[d.post == 1]["month"].min()]
    lr = stats.linregress(np.arange(len(pre)), pre.values)
    pt_ok = bool(lr.pvalue > 0.05)

    if p >= 0.05:
        status = "NOT_SIGNIFICANT"
    elif eff >= 80:
        status = "MEETING_EXPECTATION"
    elif eff >= 50:
        status = "PARTIALLY_MEETING"
    else:
        status = "UNDERPERFORMING"

    return {
        "data_notice": DATA_DISCLAIMER,
        "metric_definitions": {
            "expected_reduction_c": "Planned cooling (deg C) from roof coverage (design assumption).",
            "observed_raw_reduction_c": "Raw before/after drop in treated zones; not adjusted for regional warming trend.",
            "estimated_reduction_c": "DiD estimate of cooling attributable to the programme (deg C).",
            "effectiveness_pct": "estimated / expected x 100.",
        },
        "expected_reduction_c": r(expected),
        "observed_raw_reduction_c": r(observed_raw),
        "estimated_reduction_c": r(estimated),
        "std_error_c": r(se),
        "ci_95_c": [r(-hi), r(-lo)],
        "p_value": r(p, 4),
        "effectiveness_pct": r(eff, 1),
        "status": status,
        "parallel_trends": {
            "pre_gap_slope_c_per_month": r(lr.slope, 4),
            "p_value": r(lr.pvalue, 4),
            "supported": pt_ok,
        },
        "n_treated_zones": int(df[df.treated == 1].zone_id.nunique()),
        "n_control_zones": int(df[df.treated == 0].zone_id.nunique()),
        "assumptions": [
            "Parallel trends: without the programme, treated and control zones would have moved together.",
            "No spillover from treated to control zones; no other concurrent interventions.",
        ],
        "limitations": [
            "Synthetic data: results illustrate the method, not real Pune outcomes.",
            "Expected reduction is a planning assumption, not a measured benchmark.",
        ],
    }