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

    # Validate domain-specific ranges before imputing missing values.
    range_checks = {
        "vulnerability_index": (0, 1),
        "roof_coverage_pct": (0, 100),
        "green_cover_pct": (0, 100),
        "population_density": (0, None),
        "expected_reduction_c": (0, None),
        "lat": (-90, 90),
        "lon": (-180, 180),
    }
    for col, (lower, upper) in range_checks.items():
        values = df[col].dropna()
        invalid = pd.Series(False, index=values.index)
        if lower is not None:
            invalid |= values < lower
        if upper is not None:
            invalid |= values > upper
        if invalid.any():
            bounds = f"{lower} to {upper}" if upper is not None else f"at least {lower}"
            raise ValueError(
                f"Values in column '{col}' must be {bounds}; "
                f"found {values[invalid].iloc[0]}."
            )

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