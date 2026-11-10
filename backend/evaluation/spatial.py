"""Spatial evaluation with GeoPandas: zone map, strong/weak zones, weak clusters."""
import json
import geopandas as gpd

from backend.config import ZONES_GEOJSON
from backend.evaluation.impact import r


def match_zone_boundaries(zones, dataset_zone_ids):
    """Keep only uploaded zones and reject IDs without a map boundary."""
    if "zone_id" not in zones.columns:
        raise ValueError("Zone boundary file is missing the zone_id column.")

    if zones["zone_id"].duplicated().any():
        duplicates = zones.loc[zones["zone_id"].duplicated(), "zone_id"].unique().tolist()
        raise ValueError(f"Zone boundary file contains duplicate zone_id values: {duplicates[:5]}")

    dataset_ids = set(dataset_zone_ids)
    boundary_ids = set(zones["zone_id"])
    unmatched = sorted(dataset_ids - boundary_ids, key=str)
    if unmatched:
        raise ValueError(
            "Uploaded dataset contains zone_id values with no matching map boundary: "
            f"{unmatched[:10]}"
        )

    return zones[zones["zone_id"].isin(dataset_ids)].copy()


def category(eff):
    if eff != eff:  # NaN -> control zone
        return "control"
    if eff >= 80:
        return "strong"
    if eff >= 50:
        return "moderate"
    return "weak"


def spatial_evaluation(ze, dataset_zone_ids):
    zones = gpd.read_file(ZONES_GEOJSON)
    zones = match_zone_boundaries(zones, dataset_zone_ids)
    zones["area_km2"] = zones.to_crs(epsg=32643).area / 1e6  # UTM 43N (Pune)
    cols = ["zone_id", "estimated_reduction_c", "effectiveness_pct"]
    g = zones.merge(ze[cols], on="zone_id", how="left")
    g["category"] = g.effectiveness_pct.apply(category)

    # Weak clusters: weak zones that touch another weak zone
    weak = g[g.category == "weak"]
    cluster = []
    for i, row in weak.iterrows():
        if weak.drop(i).geometry.touches(row.geometry).any():
            cluster.append(row.zone_id)

    t = g[g.category != "control"].sort_values("effectiveness_pct")
    brief = lambda d: [{"zone_id": a, "effectiveness_pct": r(b, 1)}
                       for a, b in zip(d.zone_id, d.effectiveness_pct)]
    keep = ["zone_id", "zone_name", "group", "vulnerability_index", "roof_coverage_pct",
            "area_km2", "estimated_reduction_c", "effectiveness_pct", "category", "geometry"]
    return {
        "summary": {
            "category_counts": g.category.value_counts().to_dict(),
            "weakest_zones": brief(t.head(3)),
            "strongest_zones": brief(t.tail(3).iloc[::-1]),
            "weak_clusters": cluster,
        },
        "geojson": json.loads(g[keep].round(3).to_json()),
    }
