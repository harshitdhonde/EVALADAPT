"""Runs all four evaluation modules on a cleaned dataframe."""
import json
import pandas as pd

from backend.config import CLEAN_CSV
from backend.evaluation.impact import impact_evaluation, zone_effects
from backend.evaluation.temporal import temporal_evaluation
from backend.evaluation.equity import equity_evaluation
from backend.evaluation.spatial import spatial_evaluation


def run_evaluation(df):
    ze = zone_effects(df)
    if ze.empty:
        raise ValueError(
            "No treated zones have observations in both intervention periods."
        )
    return {
        "impact": impact_evaluation(df),
        "temporal": temporal_evaluation(df),
        "equity": equity_evaluation(ze),
        "spatial": spatial_evaluation(ze),
        "zone_effects": ze.round(3).to_dict("records"),
    }


if __name__ == "__main__":
    res = run_evaluation(pd.read_csv(CLEAN_CSV, parse_dates=["month"]))
    print(json.dumps(res["impact"], indent=2))
    t = res["temporal"]
    print("TEMPORAL:", json.dumps({k: t[k] for k in ["quarterly", "trend", "slope_c_per_month", "p_value"]}))
    print("EQUITY:", json.dumps(res["equity"], indent=2))
    print("SPATIAL:", json.dumps(res["spatial"]["summary"], indent=2))