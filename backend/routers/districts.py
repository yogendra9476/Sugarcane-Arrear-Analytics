"""District analytics."""
from fastapi import APIRouter, HTTPException
from db import db

router = APIRouter(prefix="/districts", tags=["districts"])


@router.get("")
async def list_districts():
    docs = await db.districts.find({}, {"_id": 0}).sort("total_farmers", -1).to_list(50)
    return docs


@router.get("/analytics")
async def district_analytics():
    pipeline = [
        {"$group": {
            "_id": "$district_name",
            "farmers": {"$sum": 1},
            "avg_distress": {"$avg": "$distress_score"},
            "total_pending": {"$sum": "$pending_amount"},
            "total_supply": {"$sum": "$supply_qtl"},
            "critical_count": {
                "$sum": {"$cond": [{"$in": ["$risk_level", ["High", "Critical"]]}, 1, 0]}
            },
        }},
        {"$sort": {"avg_distress": -1}},
    ]
    rows = await db.farmers.aggregate(pipeline).to_list(50)

    # merge mill counts
    mill_agg = await db.mills.aggregate([
        {"$group": {"_id": "$district_name",
                    "mills": {"$sum": 1},
                    "avg_health": {"$avg": "$health_score"},
                    "avg_recovery": {"$avg": "$recovery_pct"}}},
    ]).to_list(50)
    mmap = {m["_id"]: m for m in mill_agg}

    dist_docs = await db.districts.find({}, {"_id": 0, "name": 1, "latitude": 1, "longitude": 1}).to_list(50)
    coord_map = {d["name"]: d for d in dist_docs}

    out = []
    for r in rows:
        d = r["_id"]
        m = mmap.get(d, {})
        c = coord_map.get(d, {})
        out.append({
            "district": d,
            "farmers": r["farmers"],
            "mills": m.get("mills", 0),
            "avg_health_score": round(m.get("avg_health", 0) or 0, 1),
            "avg_recovery_pct": round(m.get("avg_recovery", 0) or 0, 2),
            "avg_distress_score": round(r["avg_distress"] or 0, 1),
            "total_pending_cr": round((r["total_pending"] or 0) / 1e7, 2),
            "total_supply_lakh_qtl": round((r["total_supply"] or 0) / 1e5, 2),
            "critical_farmers": r["critical_count"],
            "latitude": c.get("latitude"),
            "longitude": c.get("longitude"),
        })
    return out


@router.get("/{name}")
async def get_district(name: str):
    d = await db.districts.find_one({"name": name}, {"_id": 0})
    if not d:
        raise HTTPException(404, "District not found")
    mills = await db.mills.find({"district_name": name}, {"_id": 0}).to_list(50)
    return {"district": d, "mills": mills}
