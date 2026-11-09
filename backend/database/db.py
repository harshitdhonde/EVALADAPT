import json
import sqlite3
from datetime import datetime, timezone

from backend.config import DB_PATH, INTERVENTION_DATE
from backend.database.models import SCHEMA


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _j(obj):
    return json.dumps(obj, default=lambda x: x.item() if hasattr(x, "item") else str(x))


def init_db():
    with get_conn() as c:
        c.executescript(SCHEMA)
        if c.execute("SELECT COUNT(*) FROM interventions").fetchone()[0] == 0:
            c.execute(
                "INSERT INTO interventions (name, city, type, start_date, description, data_type) "
                "VALUES (?,?,?,?,?,?)",
                ("Pune Cool Roof Program", "Pune, Maharashtra", "Cool roofs (reflective roofing)",
                 INTERVENTION_DATE.strftime("%Y-%m-%d"),
                 "Reflective roof coating programme aimed at reducing urban surface temperatures "
                 "(demonstration scenario).",
                 "synthetic"))


def save_run(df, report, ev, dg, dec, source):
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with get_conn() as c:
        run_id = c.execute(
            "INSERT INTO runs (created_at, source_file, intervention_id, preprocessing_report) "
            "VALUES (?,?,1,?)", (now, source, _j(report))).lastrowid

        zones = df.drop_duplicates("zone_id")[
            ["zone_id", "zone_name", "group", "vulnerability_index", "population_density",
             "green_cover_pct", "roof_coverage_pct", "expected_reduction_c", "lat", "lon"]
        ].rename(columns={"group": "grp"})
        zones.insert(0, "run_id", run_id)
        zones.to_sql("zones", c, if_exists="append", index=False)

        obs = df[["zone_id", "group", "month", "temp_c", "period", "treated", "post",
                  "months_since"]].rename(columns={"group": "grp"}).copy()
        obs["month"] = obs["month"].dt.strftime("%Y-%m-%d")
        obs.insert(0, "run_id", run_id)
        obs.to_sql("observations", c, if_exists="append", index=False)

        for module in ["impact", "temporal", "equity", "spatial", "zone_effects"]:
            c.execute("INSERT INTO evaluation_results VALUES (?,?,?,?)",
                      (run_id, module, _j(ev[module]), now))
        c.execute("INSERT INTO diagnosis_results VALUES (?,?,?)", (run_id, _j(dg), now))
        c.execute("INSERT INTO recommendations VALUES (?,?,?,?)",
                  (run_id, dec["decision"], _j(dec), now))
    return run_id


def latest_run():
    with get_conn() as c:
        row = c.execute("SELECT * FROM runs ORDER BY run_id DESC LIMIT 1").fetchone()
    return dict(row) if row else None


def load_result(table, module=None):
    run = latest_run()
    if not run:
        return None
    with get_conn() as c:
        if table == "evaluation_results":
            row = c.execute("SELECT result_json FROM evaluation_results WHERE run_id=? AND module=?",
                            (run["run_id"], module)).fetchone()
        else:  # table name is always a constant from routes.py
            row = c.execute(f"SELECT result_json FROM {table} WHERE run_id=?",
                            (run["run_id"],)).fetchone()
    return json.loads(row["result_json"]) if row else None


def load_intervention():
    with get_conn() as c:
        return dict(c.execute("SELECT * FROM interventions WHERE id=1").fetchone())


def load_zones():
    run = latest_run()
    with get_conn() as c:
        rows = c.execute("SELECT * FROM zones WHERE run_id=? ORDER BY zone_id", (run["run_id"],)).fetchall()
    return [dict(r) for r in rows]