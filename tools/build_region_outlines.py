"""
Build data/region-outlines.json from geoBoundaries (https://www.geoboundaries.org).

Each catchment is matched to the admin region that contains its point in
data/geo-locations.json (Kenya counties, Malawi districts, Zambia provinces,
Ethiopia zones). Country outlines come from the same source so they line up.

Usage:  py tools/build_region_outlines.py <folder with downloaded geojson>
Expected files: KEN-ADM0/ADM1, MWI-ADM0/ADM2, ZMB-ADM0/ADM1, ETH-ADM0/ADM2 (.geojson)
"""

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
    "ken": ("KEN", "ADM1", "county"),
    "mw": ("MWI", "ADM2", "district"),
    "zm": ("ZMB", "ADM1", "province"),
    "et": ("ETH", "ADM2", "zone"),
}
NAME_FIXES = {"KT": "Kembata Tembaro"}
TOL_REGION = 0.008
TOL_COUNTRY = 0.012


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def polygons(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []


def point_in_ring(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi:
            inside = not inside
        j = i
    return inside


def contains(geom, x, y):
    for poly in polygons(geom):
        if point_in_ring(x, y, poly[0]) and not any(point_in_ring(x, y, h) for h in poly[1:]):
            return True
    return False


def centroid(geom):
    pts = [p for poly in polygons(geom) for p in poly[0]]
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)


def ring_area(ring):
    return abs(sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))) / 2


def perp(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop()
        dmax, idx = 0, -1
        for i in range(s + 1, e):
            d = perp(pts[i], pts[s], pts[e])
            if d > dmax:
                dmax, idx = d, i
        if dmax > tol and idx > 0:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [p for p, k in zip(pts, keep) if k]


def rings_of(geom, tol, min_area):
    out = []
    for poly in polygons(geom):
        outer = poly[0]
        if ring_area(outer) < min_area:
            continue
        ring = simplify(outer, tol)
        if len(ring) >= 4:
            out.append([[round(p[0], 3), round(p[1], 3)] for p in ring])
    return out


def main(src):
    src = Path(src)
    catchments = load(ROOT / "data" / "catchments.json")["catchments"]
    locs = load(ROOT / "data" / "geo-locations.json")["catchments"]

    result = {
        "source": "geoBoundaries gbOpen (www.geoboundaries.org), simplified",
        "countries": {},
        "regions": {},
        "catchments": {},
    }

    for cid, (iso, level, kind) in SOURCES.items():
        adm0 = load(src / f"{iso}-ADM0.geojson")["features"][0]["geometry"]
        result["countries"][cid] = rings_of(adm0, TOL_COUNTRY, 0.01)

        feats = load(src / f"{iso}-{level}.geojson")["features"]
        for ct in (c for c in catchments if c["countryId"] == cid):
            loc = locs.get(ct["id"])
            if not loc:
                continue
            x, y = loc["lng"], loc["lat"]
            hit = next((f for f in feats if contains(f["geometry"], x, y)), None)
            if hit is None:
                hit = min(feats, key=lambda f: math.dist(centroid(f["geometry"]), (x, y)))
            name = hit["properties"].get("shapeName", "Region")
            name = NAME_FIXES.get(name, name)
            key = f"{cid}:{name}"
            if key not in result["regions"]:
                result["regions"][key] = {
                    "name": name,
                    "kind": kind,
                    "rings": rings_of(hit["geometry"], TOL_REGION, 0.0005),
                }
            result["catchments"][ct["id"]] = key
            print(f"{ct['name']:<22} -> {name} ({kind})")

    out = ROOT / "data" / "region-outlines.json"
    out.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
