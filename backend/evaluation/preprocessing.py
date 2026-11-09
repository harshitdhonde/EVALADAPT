"""Validates and cleans the raw dataset. Used by the upload endpoint too."""
import json
import numpy as np
import pandas as pd

from backend.config import (RAW_CSV, CLEAN_CSV, REPORT_JSON,
                            PROCESSED_DIR, INTERVENTION_DATE)

REQUIRED_COLUMNS = [
    "zone_id", "zone_name", "group", "month", "temp_c", "roof_coverage_pct",
    "vulnerability_index", "population_density", "green_cover_pct",
    "expected_reduction_c", "lat", "lon",
]
ZONE_LEVEL = ["vulnerability_index", "population_density", "green_cover_pct",
              "roof_coverage_pct", "expected_reduction_c", "lat", "lon"]


def validate_columns(df):
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")


def clean(df):
    validate_columns(df)
    df = df.copy()
    report = {"rows_in": int(len(df))}

    # 1. Standardise group labels ("Treated ", "CONTROL" -> "treated", "control")
    df["group"] = df["group"].astype(str).str.strip().str.lower()
    bad = ~df["group"].isin(["treated", "control"])
    if bad.any():
        raise ValueError(f"Invalid group labels: {df.loc[bad, 'group'].unique().tolist()}")

    # 2. Parse dates, drop unparseable rows
    df["month"] = pd.to_datetime(df["month"], errors="coerce")
    report["bad_dates_dropped"] = int(df["month"].isna().sum())
    df = df.dropna(subset=["month"])

    # 3. Remove duplicate zone-month records
    before = len(df)
    df = df.drop_duplicates(subset=["zone_id", "month"], keep="first")
    report["duplicates_removed"] = int(before - len(df))

    # 4. Physically implausible temperatures -> missing
    out = (df["temp_c"] < 10) | (df["temp_c"] > 50)
    report["temp_outliers_set_missing"] = int(out.sum())
    df.loc[out, "temp_c"] = np.nan

    # 5. Fill zone-level attributes with the zone's own median
    report["zone_attr_missing_filled"] = int(df[ZONE_LEVEL].isna().sum().sum())
    for col in ZONE_LEVEL:
        df[col] = df.groupby("zone_id")[col].transform(lambda s: s.fillna(s.median()))

    # 6. Fill missing temperatures by linear interpolation within each zone
    df = df.sort_values(["zone_id", "month"]).reset_index(drop=True)
    report["temp_missing_interpolated"] = int(df["temp_c"].isna().sum())
    df["temp_c"] = df.groupby("zone_id")["temp_c"].transform(
        lambda s: s.interpolate(limit_direction="both"))
    df = df.dropna(subset=["temp_c"])

    # 7. Derived columns used by later modules
    df["period"] = np.where(df["month"] < INTERVENTION_DATE, "before", "after")
    df["post"] = (df["period"] == "after").astype(int)
    df["treated"] = (df["group"] == "treated").astype(int)
    df["months_since"] = np.where(
        df["post"] == 1,
        (df["month"].dt.year - INTERVENTION_DATE.year) * 12
        + df["month"].dt.month - INTERVENTION_DATE.month, 0)
    df["vulnerability_group"] = np.where(df["vulnerability_index"] >= 0.5, "high", "low")

    report["rows_out"] = int(len(df))
    report["zones"] = int(df["zone_id"].nunique())
    return df, report


def run():
    df, report = clean(pd.read_csv(RAW_CSV))
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(CLEAN_CSV, index=False)
    REPORT_JSON.write_text(json.dumps(report, indent=2))
    return df, report


if __name__ == "__main__":
    df, report = run()
    print(json.dumps(report, indent=2))
    print(df.head(3).to_string())
    print(df.groupby(["group", "period"])["temp_c"].mean().round(2))