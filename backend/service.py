"""Glue: raw dataframe -> clean -> evaluate -> diagnose -> decide -> save to SQLite."""
import pandas as pd

from backend.config import RAW_CSV
from backend.database import db
from backend.evaluation.preprocessing import clean
from backend.evaluation.pipeline import run_evaluation
from backend.ai.diagnosis import run_diagnosis
from backend.decision.engine import decide


def validate_group_periods(df):
    counts = df.groupby(["group", "period"]).size()
    required = [
        ("treated", "before"),
        ("treated", "after"),
        ("control", "before"),
        ("control", "after"),
    ]
    missing = [key for key in required if counts.get(key, 0) == 0]
    if missing:
        raise ValueError(
            f"Insufficient group-period observations: {missing}"
        )


def run_pipeline(raw_df, source):
    df, report = clean(raw_df)
    validate_group_periods(df)
    ev = run_evaluation(df)
    dg = run_diagnosis(pd.DataFrame(ev["zone_effects"]))
    dec = decide(ev, dg)
    return db.save_run(df, report, ev, dg, dec, source)


def ensure_data():
    db.init_db()
    if db.latest_run() is None:
        if not RAW_CSV.exists():
            from backend.generate_data import main as generate
            generate()
        run_pipeline(pd.read_csv(RAW_CSV), RAW_CSV.name)