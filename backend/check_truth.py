"""Sanity check on SYNTHETIC data: do DiD estimates recover the hidden true effects?"""
import numpy as np
import pandas as pd

from backend.config import SEED, CLEAN_CSV
from backend.generate_data import build_zones
from backend.evaluation.impact import zone_effects

# Rebuild the same zones (same seed) to get the hidden efficiency
z = build_zones(np.random.default_rng(SEED))
t = z[z.group == "treated"].copy()
# 0.9175 = average ageing factor over the 12 post months
t["true_reduction_c"] = t["expected_reduction_c"] * t["_efficiency"] * 0.9175

ze = zone_effects(pd.read_csv(CLEAN_CSV, parse_dates=["month"]))
m = ze.merge(t[["zone_id", "true_reduction_c"]], on="zone_id")
m["error_c"] = m["estimated_reduction_c"] - m["true_reduction_c"]

cols = ["zone_id", "vulnerability_group", "expected_reduction_c",
        "true_reduction_c", "estimated_reduction_c", "error_c"]
print(m[cols].round(3).to_string(index=False))
print("\nmean true:", round(m.true_reduction_c.mean(), 3),
      "| mean estimated:", round(m.estimated_reduction_c.mean(), 3))
print("corr(true, estimated):", round(m.true_reduction_c.corr(m.estimated_reduction_c), 2))
print("std of zone error (C):", round(m.error_c.std(), 3))
print(m.groupby("vulnerability_group")[["true_reduction_c", "estimated_reduction_c"]].mean().round(3))