"""Equity evaluation: do high-vulnerability zones receive comparable cooling?"""
from scipy import stats

from backend.evaluation.impact import r


def equity_evaluation(ze):
    out = {"groups": {}}
    for name in ["high", "low"]:
        s = ze[ze.vulnerability_group == name]
        out["groups"][name] = {
            "n_zones": int(len(s)),
            "mean_estimated_reduction_c": r(s.estimated_reduction_c.mean()),
            "mean_effectiveness_pct": r(s.effectiveness_pct.mean(), 1),
            "mean_roof_coverage_pct": r(s.roof_coverage_pct.mean(), 1),
        }
    hi = ze[ze.vulnerability_group == "high"].estimated_reduction_c
    lo = ze[ze.vulnerability_group == "low"].estimated_reduction_c

    ratio = p = None
    if len(hi) >= 2 and len(lo) >= 2:
        p = stats.ttest_ind(hi, lo, equal_var=False).pvalue
        if lo.mean() > 0:
            ratio = hi.mean() / lo.mean()
    rho = stats.spearmanr(ze.vulnerability_index, ze.estimated_reduction_c)

    if ratio is None:
        verdict = "INSUFFICIENT_DATA"
    elif ratio < 0.8:
        verdict = "UNEQUAL"
    else:
        verdict = "EQUITABLE"

    out.update({
        "equity_ratio": r(ratio),
        "welch_p_value": r(p, 4),
        "spearman_vulnerability_vs_cooling": r(rho.statistic),
        "spearman_p_value": r(rho.pvalue, 4),
        "verdict": verdict,
        "note": "Equity ratio = mean cooling in high-vulnerability zones / low-vulnerability zones. "
                "Below 0.8 is flagged UNEQUAL. Association only, not causation.",
    })
    return out