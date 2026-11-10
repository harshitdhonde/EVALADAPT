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
NUMERIC_COLUMNS = ["temp_c", *ZONE_LEVEL]


def validate_columns(df):
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")


def clean(df):
    validate_columns(df)
    df = df.copy()
    report = {"rows_in": int(len(df))}

    if df["zone_id"].isna().any():
        raise ValueError("Dataset contains missing zone_id values.")

    # Validate numeric fields before performing calculations.
    for col in NUMERIC_COLUMNS:
        original = df[col]
        converted = pd.to_numeric(original, errors="coerce")
        invalid = original.notna() & converted.isna()
        if invalid.any():
            raise ValueError(f"Invalid numerical values in column: {col}")
        if not np.isfinite(converted.dropna()).all():
            raise ValueError(f"Non-finite values found in column: {col}")
        df[col] = converted

    # 1. Standardise group labels ("Treated ", "CONTROL" -> "treated", "control")
    df["group"] = df["group"].astype(str).str.strip().str.lower()
    bad = ~df["group"].isin(["treated", "control"])
    if bad.any():
        raise ValueError(f"Invalid group labels: {df.loc[bad, 'group'].unique().tolist()}")

    # 2. Parse dates, drop unparseable rows
    df["month"] = pd.to_datetime(df["month"], errors="coerce")
    report["bad_dates_dropped"] = int(df["month"].isna().sum())
    df = df.dropna(subset=["month"])

    # 3. Remove exact duplicate rows; reject conflicting zone-month records.
    duplicate_keys = df.duplicated(subset=["zone_id", "month"], keep=False)
    if duplicate_keys.any():
        repeated = df.loc[duplicate_keys]
        conflicting = repeated.groupby(["zone_id", "month"], dropna=False).nunique(
            dropna=False
        ).gt(1).any(axis=1)
        if conflicting.any():
            examples = [str(key) for key in conflicting[conflicting].index.tolist()[:5]]
            raise ValueError(
                "Conflicting records found for the same zone_id and month: "
                f"{examples}"
            )

    before = len(df)
    df = df.drop_duplicates()
    report["duplicates_removed"] = int(before - len(df))

    # 4. Physically implausible temperatures -> missing
    out = (df["temp_c"] < 10) | (df["temp_c"] > 50)
    report["temp_outliers_set_missing"] = int(out.sum())
    df.loc[out, "temp_c"] = np.nan

    # 5. Fill zone-level attributes with the zone's own median
    report["zone_attr_missing_filled"] = int(df[ZONE_LEVEL].isna().sum().sum())
    for col in ZONE_LEVEL:
        df[col] = df.groupby("zone_id")[col].transform(lambda s: s.fillna(s.median()))

    unresolved = df[ZONE_LEVEL].isna().sum()
    unresolved = unresolved[unresolved > 0]
    if not unresolved.empty:
        raise ValueError(
            "Unable to fill missing zone attributes: "
            f"{unresolved.to_dict()}"
        )

    # 6. Fill missing temperatures by linear interpolation within each zone
    df = df.sort_values(["zone_id", "month"]).reset_index(drop=True)
    report["temp_missing_interpolated"] = int(df["temp_c"].isna().sum())
    df["temp_c"] = df.groupby("zone_id")["temp_c"].transform(
        lambda s: s.interpolate(limit_direction="both"))
    df = df.dropna(subset=["temp_c"])
    if df.empty:
        raise ValueError("No usable temperature observations remain after cleaning.")

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