"""Transparent rule-based decision engine: CONTINUE / MODIFY / INVESTIGATE."""
from backend.config import DATA_DISCLAIMER

# Policy thresholds (editable, shown in output)
T = {"min_effectiveness_pct": 80, "max_p_value": 0.05, "weak_share": 0.15}

ACTIONS = {
    "M1": "Review roof specifications and installation quality to close the gap between expected and estimated cooling.",
    "M2": "Prioritise additional roof coverage and maintenance in high-vulnerability zones.",
    "M3": "Introduce roof cleaning/re-coating cycles; cooling is fading over time.",
    "M4": "Field-inspect the weakest zones and any weak clusters (roof condition, coverage, local context).",
}


def decide(ev, dg):
    imp, tmp, eq, sp = ev["impact"], ev["temporal"], ev["equity"], ev["spatial"]["summary"]
    n_treated = imp["n_treated_zones"]
    n_weak = sp["category_counts"].get("weak", 0)
    weak_share = n_weak / n_treated if n_treated else 0

    rules = [
        {"id": "I1", "outcome": "INVESTIGATE",
         "text": f"Impact estimate not statistically significant (p >= {T['max_p_value']})",
         "observed": imp["p_value"], "fired": imp["p_value"] is None or imp["p_value"] >= T["max_p_value"]},
        {"id": "I2", "outcome": "INVESTIGATE",
         "text": "Parallel-trends check failed, so DiD may be unreliable",
         "observed": imp["parallel_trends"]["p_value"], "fired": not imp["parallel_trends"]["supported"]},
        {"id": "M1", "outcome": "MODIFY",
         "text": f"Effectiveness below {T['min_effectiveness_pct']}% of expected",
         "observed": imp["effectiveness_pct"], "fired": (imp["effectiveness_pct"] or 0) < T["min_effectiveness_pct"]},
        {"id": "M2", "outcome": "MODIFY",
         "text": "Benefits unequal: high-vulnerability zones get < 0.8x the cooling of low-vulnerability zones",
         "observed": eq["equity_ratio"], "fired": eq["verdict"] == "UNEQUAL"},
        {"id": "M3", "outcome": "MODIFY",
         "text": "Cooling is deteriorating over time",
         "observed": tmp["trend"], "fired": tmp["trend"] == "DETERIORATING"},
        {"id": "M4", "outcome": "MODIFY",
         "text": f"Weak zones (<50% effectiveness) are >= {int(T['weak_share']*100)}% of treated zones, or form a cluster",
         "observed": f"{n_weak}/{n_treated} weak; clusters: {sp['weak_clusters']}",
         "fired": weak_share >= T["weak_share"] or bool(sp["weak_clusters"])},
    ]

    investigate = [x for x in rules if x["outcome"] == "INVESTIGATE" and x["fired"]]
    modify = [x for x in rules if x["outcome"] == "MODIFY" and x["fired"]]
    if investigate:
        decision = "INVESTIGATE"
        why = "The evidence is not reliable enough to judge the programme: " + "; ".join(x["text"] for x in investigate)
        actions = ["Collect more data or longer observation, and re-check control-zone selection."]
    elif modify:
        decision = "MODIFY"
        why = "Impact is reliable but the programme needs adjustment: " + "; ".join(x["text"] for x in modify)
        actions = [ACTIONS[x["id"]] for x in modify]
    else:
        decision = "CONTINUE"
        why = "Impact is significant, meets expectations, and no equity, temporal or spatial concerns were found."
        actions = ["Continue and keep monitoring."]

    return {
        "data_notice": DATA_DISCLAIMER,
        "decision": decision,
        "rationale": why,
        "recommended_actions": actions,
        "rules_evaluated": rules,
        "thresholds": T,
        "supporting_evidence": {
            "estimated_reduction_c": imp["estimated_reduction_c"],
            "expected_reduction_c": imp["expected_reduction_c"],
            "effectiveness_pct": imp["effectiveness_pct"],
            "p_value": imp["p_value"],
            "equity_ratio": eq["equity_ratio"],
            "temporal_trend": tmp["trend"],
            "weakest_zones": sp["weakest_zones"],
            "underperforming_anomalies": dg["underperforming_anomalies"],
        },
        "caveats": ["Rules and thresholds are policy choices, shown above so they can be challenged.",
                    "Diagnostic findings are associations, not causal proof."],
    }


if __name__ == "__main__":
    import json
    import pandas as pd
    from backend.config import CLEAN_CSV
    from backend.evaluation.pipeline import run_evaluation
    from backend.ai.diagnosis import run_diagnosis

    ev = run_evaluation(pd.read_csv(CLEAN_CSV, parse_dates=["month"]))
    dg = run_diagnosis(pd.DataFrame(ev["zone_effects"]))
    print(json.dumps(dg, indent=2))
    print(json.dumps(decide(ev, dg), indent=2))