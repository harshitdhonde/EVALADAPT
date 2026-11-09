import numpy as np
import pandas as pd
from backend.config import SEED, CLEAN_CSV
from backend.generate_data import build_zones
from backend.evaluation.temporal import temporal_evaluation

t = build_zones(np.random.default_rng(SEED))
t = t[t.group == "treated"]
base = (t.expected_reduction_c * t._efficiency).mean()
res = temporal_evaluation(pd.read_csv(CLEAN_CSV, parse_dates=["month"]))
for s in res["series"]:
    if s["period"] == "after":
        m = pd.Timestamp(s["month"] + "-01")
        true = base * (1 - 0.015 * ((m.year - 2025) * 12 + m.month - 1))
        print(s["month"], "true", round(true, 3), "est", s["adjusted_cooling_c"],
              "diff", round(s["adjusted_cooling_c"] - true, 3))
pre = [s["adjusted_cooling_c"] for s in res["series"] if s["period"] == "before"]
print("pre-period adjusted cooling (should hover near 0):", np.round(pre, 3))