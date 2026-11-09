from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"
RAW_CSV = RAW_DIR / "pune_coolroof_synthetic.csv"
ZONES_GEOJSON = RAW_DIR / "zones.geojson"
CLEAN_CSV = PROCESSED_DIR / "clean.csv"
REPORT_JSON = PROCESSED_DIR / "preprocessing_report.json"
DB_PATH = ROOT / "evaladapt.db"

INTERVENTION_DATE = pd.Timestamp("2025-01-01")
SEED = 42
DATA_DISCLAIMER = "SYNTHETIC DEMONSTRATION DATA - not actual Pune field measurements."