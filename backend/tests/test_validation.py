"""Regression tests for dataset validation and evaluation edge cases."""
import unittest

import pandas as pd

from backend.evaluation.preprocessing import clean
from backend.evaluation.spatial import match_zone_boundaries
from backend.service import validate_group_periods


def sample_data():
    rows = []
    for zone_id, group, base in [
        ("T1", "treated", 30.0),
        ("C1", "control", 31.0),
    ]:
        for month, offset in [
            ("2024-11-01", 0.0),
            ("2024-12-01", -0.2),
            ("2025-01-01", -0.5),
            ("2025-02-01", -0.7),
        ]:
            rows.append({
                "zone_id": zone_id,
                "zone_name": zone_id,
                "group": group,
                "month": month,
                "temp_c": base + offset,
                "roof_coverage_pct": 40.0,
                "vulnerability_index": 0.6,
                "population_density": 1000.0,
                "green_cover_pct": 20.0,
                "expected_reduction_c": 1.0,
                "lat": 18.6,
                "lon": 73.8,
            })
    return pd.DataFrame(rows)


class PreprocessingValidationTests(unittest.TestCase):
    def test_valid_dataset_is_cleaned(self):
        cleaned, report = clean(sample_data())
        self.assertEqual(len(cleaned), 8)
        self.assertEqual(report["rows_out"], 8)

    def test_non_numeric_measurement_is_rejected(self):
        data = sample_data()
        data["population_density"] = data["population_density"].astype(object)
        data.loc[0, "population_density"] = "not-a-number"
        with self.assertRaisesRegex(ValueError, "population_density"):
            clean(data)

    def test_non_finite_measurement_is_rejected(self):
        data = sample_data()
        data.loc[0, "lat"] = float("inf")
        with self.assertRaisesRegex(ValueError, "Non-finite"):
            clean(data)

    def test_out_of_range_values_are_rejected(self):
        invalid_values = {
            "vulnerability_index": 1.1,
            "roof_coverage_pct": 100.1,
            "green_cover_pct": -0.1,
            "population_density": -1,
            "expected_reduction_c": -0.1,
            "lat": 90.1,
            "lon": -180.1,
        }
        for column, value in invalid_values.items():
            with self.subTest(column=column):
                data = sample_data()
                data.loc[0, column] = value
                with self.assertRaisesRegex(ValueError, column):
                    clean(data)

    def test_range_boundary_values_are_accepted(self):
        data = sample_data()
        data.loc[:, "vulnerability_index"] = 0
        data.loc[:, "roof_coverage_pct"] = 100
        data.loc[:, "green_cover_pct"] = 0
        data.loc[:, "population_density"] = 0
        data.loc[:, "expected_reduction_c"] = 0
        data.loc[:, "lat"] = 90
        data.loc[:, "lon"] = -180
        cleaned, _ = clean(data)
        self.assertEqual(len(cleaned), 8)

    def test_all_missing_zone_attribute_is_rejected(self):
        data = sample_data()
        data.loc[data["zone_id"] == "T1", "green_cover_pct"] = None
        with self.assertRaisesRegex(ValueError, "Unable to fill missing zone attributes"):
            clean(data)

    def test_conflicting_duplicate_zone_month_is_rejected(self):
        data = sample_data()
        duplicate = data.iloc[[0]].copy()
        duplicate["temp_c"] = duplicate["temp_c"] + 2
        data = pd.concat([data, duplicate], ignore_index=True)
        with self.assertRaisesRegex(ValueError, "Conflicting records"):
            clean(data)

    def test_exact_duplicate_rows_are_removed(self):
        data = sample_data()
        data = pd.concat([data, data.iloc[[0]]], ignore_index=True)
        cleaned, report = clean(data)
        self.assertEqual(report["duplicates_removed"], 1)
        self.assertEqual(len(cleaned), 8)

    def test_missing_zone_identifier_is_rejected(self):
        data = sample_data()
        data.loc[0, "zone_id"] = None
        with self.assertRaisesRegex(ValueError, "missing zone_id"):
            clean(data)


class GroupPeriodValidationTests(unittest.TestCase):
    def test_all_four_group_period_combinations_are_required(self):
        data = sample_data()
        validate_group_periods(clean(data)[0])

    def test_missing_group_period_combination_is_rejected(self):
        data = sample_data()
        data = data[~((data["zone_id"] == "T1") &
                      (data["month"] == "2025-02-01"))]
        cleaned, _ = clean(data)
        # Remove the remaining treated post-period record as well.
        cleaned = cleaned[~((cleaned["zone_id"] == "T1") &
                            (cleaned["period"] == "after"))]
        with self.assertRaisesRegex(ValueError, "Insufficient group-period"):
            validate_group_periods(cleaned)


class SpatialBoundaryValidationTests(unittest.TestCase):
    def test_uploaded_zone_without_boundary_is_rejected(self):
        zones = pd.DataFrame({"zone_id": ["Z01", "Z02"]})
        with self.assertRaisesRegex(ValueError, "no matching map boundary"):
            match_zone_boundaries(zones, ["Z01", "UNKNOWN"])

    def test_only_uploaded_zones_are_returned(self):
        zones = pd.DataFrame({"zone_id": ["Z01", "Z02", "Z03"]})
        matched = match_zone_boundaries(zones, ["Z01", "Z03"])
        self.assertEqual(matched["zone_id"].tolist(), ["Z01", "Z03"])

    def test_duplicate_boundary_ids_are_rejected(self):
        zones = pd.DataFrame({"zone_id": ["Z01", "Z01"]})
        with self.assertRaisesRegex(ValueError, "duplicate zone_id"):
            match_zone_boundaries(zones, ["Z01"])


if __name__ == "__main__":
    unittest.main()
