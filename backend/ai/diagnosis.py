"""Combines anomalies + drivers into zone-level, plain-language diagnostic notes."""
from backend.ai.anomaly import detect_anomalies
from backend.ai.drivers import find_drivers, FEATURES


def zone_notes(ze, flagged):
    notes = []
    for f in flagged:
        row = ze[ze.zone_id == f["zone_id"]].iloc[0]
        factors = []
        for col, label in FEATURES.items():
            pct = (ze[col] < row[col]).mean() * 100
            if pct >= 75:
                factors.append(f"{label} is high ({row[col]:.2f}, above {pct:.0f}% of treated zones)")
            elif pct <= 25:
                factors.append(f"{label} is low ({row[col]:.2f}, below {100 - pct:.0f}% of treated zones)")
        notes.append({
            "zone_id": f["zone_id"], "direction": f["direction"],
            "effectiveness_pct": f["effectiveness_pct"],
            "notable_characteristics": factors or ["No characteristic is extreme relative to other treated zones"],
        })
    return notes


def run_diagnosis(ze):
    an = detect_anomalies(ze)
    dr = find_drivers(ze)
    return {
        "anomalies": an,
        "drivers": dr,
        "zone_notes": zone_notes(ze, an["flagged"]),
        "underperforming_anomalies": [f["zone_id"] for f in an["flagged"] if f["direction"] == "under"],
        "disclaimer": "AI diagnosis is exploratory and separate from the DiD impact estimate. "
                      "It does not establish causality.",
    }