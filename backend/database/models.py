SCHEMA = """
CREATE TABLE IF NOT EXISTS interventions (
    id INTEGER PRIMARY KEY, name TEXT, city TEXT, type TEXT,
    start_date TEXT, description TEXT, data_type TEXT
);
CREATE TABLE IF NOT EXISTS runs (
    run_id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, source_file TEXT,
    intervention_id INTEGER, preprocessing_report TEXT
);
CREATE TABLE IF NOT EXISTS zones (
    run_id INTEGER, zone_id TEXT, zone_name TEXT, grp TEXT,
    vulnerability_index REAL, population_density REAL, green_cover_pct REAL,
    roof_coverage_pct REAL, expected_reduction_c REAL, lat REAL, lon REAL
);
CREATE TABLE IF NOT EXISTS observations (
    run_id INTEGER, zone_id TEXT, grp TEXT, month TEXT, temp_c REAL,
    period TEXT, treated INTEGER, post INTEGER, months_since INTEGER
);
CREATE TABLE IF NOT EXISTS evaluation_results (
    run_id INTEGER, module TEXT, result_json TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS diagnosis_results (
    run_id INTEGER, result_json TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS recommendations (
    run_id INTEGER, decision TEXT, result_json TEXT, created_at TEXT
);
"""