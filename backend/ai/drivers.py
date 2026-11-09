"""Which zone characteristics are associated with weaker outcomes? Association only."""
from scipy import stats
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import r2_score
from sklearn.model_selection import LeaveOneOut, cross_val_predict

from backend.evaluation.impact import r

FEATURES = {
    "vulnerability_index": "Vulnerability index",
    "population_density": "Population density",
    "green_cover_pct": "Green cover (%)",
    "roof_coverage_pct": "Roof coverage (%)",
    "baseline_temp_c": "Baseline temperature (C)",
}


def find_drivers(ze, seed=42):
    cols = list(FEATURES)
    X, y = ze[cols], ze.effectiveness_pct
    rf = RandomForestRegressor(n_estimators=300, max_depth=3, min_samples_leaf=2,
                               random_state=seed)
    cv_r2 = r2_score(y, cross_val_predict(rf, X, y, cv=LeaveOneOut()))
    rf.fit(X, y)
    imp = permutation_importance(rf, X, y, n_repeats=30, random_state=seed).importances_mean
    imp = imp.clip(min=0)
    total = imp.sum() or 1.0

    drivers = []
    for i, c in enumerate(cols):
        rho = stats.spearmanr(X[c], y)
        drivers.append({
            "feature": c, "label": FEATURES[c],
            "importance_share": r(imp[i] / total),
            "spearman_rho": r(rho.statistic),
            "spearman_p": r(rho.pvalue, 4),
            "association": ("higher values go with LOWER effectiveness" if rho.statistic < 0
                            else "higher values go with HIGHER effectiveness"),
        })
    drivers.sort(key=lambda d: d["importance_share"], reverse=True)

    reliability = "LOW" if cv_r2 < 0.2 else ("MODERATE" if cv_r2 < 0.5 else "REASONABLE")
    return {
        "method": "RandomForest + permutation importance + Spearman correlation",
        "n_zones": int(len(ze)),
        "leave_one_out_r2": r(cv_r2),
        "reliability": reliability,
        "drivers": drivers,
        "caveat": "Small sample (treated zones only). These are associations that suggest "
                  "hypotheses to investigate, not proof of cause.",
    }