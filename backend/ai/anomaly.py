"""Anomaly detection (IsolationForest) on per-zone DiD results. Descriptive, not causal."""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from backend.evaluation.impact import r


def detect_anomalies(ze, contamination=0.15, seed=42):
    d = ze.copy()
    d["shortfall_c"] = d.expected_reduction_c - d.estimated_reduction_c
    X = StandardScaler().fit_transform(d[["effectiveness_pct", "shortfall_c"]])
    iso = IsolationForest(n_estimators=300, contamination=contamination,
                          random_state=seed).fit(X)
    d["anomaly_score"] = -iso.score_samples(X)      # higher = more unusual
    d["is_anomaly"] = iso.predict(X) == -1

    # Robust z-score of effectiveness (median/MAD) gives a human-readable reason
    med = d.effectiveness_pct.median()
    mad = (d.effectiveness_pct - med).abs().median() * 1.4826
    d["robust_z"] = (d.effectiveness_pct - med) / mad if mad > 0 else 0.0
    d["direction"] = np.where(d.effectiveness_pct < med, "under", "over")

    flagged = d[d.is_anomaly].sort_values("anomaly_score", ascending=False)
    return {
        "method": "IsolationForest on [effectiveness_pct, shortfall_c], standardised",
        "median_effectiveness_pct": r(med, 1),
        "flagged": [{
            "zone_id": x.zone_id, "zone_name": x.zone_name,
            "effectiveness_pct": r(x.effectiveness_pct, 1),
            "robust_z": r(x.robust_z, 2),
            "anomaly_score": r(x.anomaly_score),
            "direction": x.direction,
            "reading": ("Unusually weak outcome vs other treated zones" if x.direction == "under"
                        else "Unusually strong outcome vs other treated zones"),
        } for x in flagged.itertuples()],
        "n_zones_scored": int(len(d)),
    }