import json
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.config import DATA_DISCLAIMER
from backend.database import db
from backend.service import run_pipeline

router = APIRouter(prefix="/api")


def need(table, module=None):
    res = db.load_result(table, module)
    if res is None:
        raise HTTPException(404, "No results yet. Upload a dataset via POST /api/data/upload.")
    return res


@router.get("/health")
def health():
    return {"status": "ok", "service": "EVALADAPT", "data_type": "synthetic",
            "database": "connected", "has_results": db.latest_run() is not None}


@router.get("/overview")
def overview():
    imp = need("evaluation_results", "impact")
    eq = need("evaluation_results", "equity")
    tmp = need("evaluation_results", "temporal")
    sp = need("evaluation_results", "spatial")
    dec = need("recommendations")
    run = db.latest_run()
    return {
        "data_notice": DATA_DISCLAIMER,
        "run_id": run["run_id"], "last_run_at": run["created_at"], "source_file": run["source_file"],
        "intervention_name": db.load_intervention()["name"],
        "kpis": {
            "expected_reduction_c": imp["expected_reduction_c"],
            "observed_raw_reduction_c": imp["observed_raw_reduction_c"],
            "estimated_reduction_c": imp["estimated_reduction_c"],
            "effectiveness_pct": imp["effectiveness_pct"],
            "p_value": imp["p_value"],
            "impact_status": imp["status"],
        },
        "equity_verdict": eq["verdict"], "equity_ratio": eq["equity_ratio"],
        "temporal_trend": tmp["trend"],
        "n_treated_zones": imp["n_treated_zones"], "n_control_zones": imp["n_control_zones"],
        "weak_zone_count": sp["summary"]["category_counts"].get("weak", 0),
        "decision": dec["decision"],
    }


@router.get("/interventions")
def interventions():
    need("recommendations")
    return {"data_notice": DATA_DISCLAIMER,
            "interventions": [db.load_intervention()],
            "zones": db.load_zones()}


@router.post("/data/upload")
def upload(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file.")
    try:
        df = pd.read_csv(file.file)
    except Exception:
        raise HTTPException(400, "Could not read the file as CSV.")
    if df.empty:
        raise HTTPException(400, "The CSV file is empty.")
    try:
        run_id = run_pipeline(df, file.filename)
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(422, f"Dataset could not be evaluated: {e}")
    run = db.latest_run()
    return {"message": "Dataset processed", "run_id": run_id, "source_file": file.filename,
            "preprocessing_report": json.loads(run["preprocessing_report"]),
            "decision": need("recommendations")["decision"]}


@router.get("/evaluation")
def evaluation():
    return {"data_notice": DATA_DISCLAIMER,
            "impact": need("evaluation_results", "impact"),
            "temporal": need("evaluation_results", "temporal")}


@router.get("/impact-equity")
def impact_equity():
    return {"data_notice": DATA_DISCLAIMER,
            "impact": need("evaluation_results", "impact"),
            "equity": need("evaluation_results", "equity"),
            "zone_effects": need("evaluation_results", "zone_effects")}


@router.get("/spatial")  # extra endpoint: GeoJSON for the map
def spatial():
    return {"data_notice": DATA_DISCLAIMER, **need("evaluation_results", "spatial")}


@router.get("/diagnosis")
def diagnosis():
    return {"data_notice": DATA_DISCLAIMER, **need("diagnosis_results")}


@router.get("/decision")
def decision():
    return need("recommendations")