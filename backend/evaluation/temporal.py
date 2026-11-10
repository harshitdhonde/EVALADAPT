"""Temporal evaluation: is the programme's cooling improving or deteriorating?"""
import numpy as np
from scipy import stats

from backend.config import INTERVENTION_DATE
from backend.evaluation.impact import gap_series, r


def temporal_evaluation(df):
    gap, g = gap_series(df)
    pre_gap = gap[gap.index < INTERVENTION_DATE].mean()
    cooling = -(gap - pre_gap)  # positive = treated zones cooler than their own baseline gap

    series = [{
        "month": m.strftime("%Y-%m"),
        "treated_mean_c": r(g.loc[m, "treated"], 2),
        "control_mean_c": r(g.loc[m, "control"], 2),
        "adjusted_cooling_c": r(cooling[m]),
        "period": "after" if m >= INTERVENTION_DATE else "before",
    } for m in gap.index]

    post = cooling[cooling.index >= INTERVENTION_DATE].dropna()
    if len(post) < 2:
        raise ValueError(
            "At least two valid post-intervention monthly observations "
            "are required for temporal trend analysis."
        )
    quarters = {}
    for m, v in post.items():
        quarters.setdefault(f"{m.year}-Q{(m.month - 1) // 3 + 1}", []).append(v)
    quarterly = [{"quarter": k, "mean_cooling_c": r(np.mean(v))} for k, v in quarters.items()]

    lr = stats.linregress(np.arange(len(post)), post.values)
    if lr.pvalue < 0.05 and lr.slope < 0:
        trend = "DETERIORATING"
    elif lr.pvalue < 0.05 and lr.slope > 0:
        trend = "IMPROVING"
    else:
        trend = "STABLE"

    return {
        "series": series,
        "quarterly": quarterly,
        "trend": trend,
        "slope_c_per_month": r(lr.slope, 4),
        "p_value": r(lr.pvalue, 4),
                "note": "Adjusted cooling = change in treated-minus-control gap vs the pre-programme average gap. "
                "Trend uses only the post-programme months, so statistical power is limited; "
                "STABLE means no significant trend detected, not proof of no change.",
    }