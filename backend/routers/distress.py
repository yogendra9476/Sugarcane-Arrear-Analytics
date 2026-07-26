"""Farmer distress index."""
from fastapi import APIRouter
from db import db

router = APIRouter(prefix="/distress", tags=["distress"])


@router.get("/summary")
async def summary():
    pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1},
                    "avg_score": {"$avg": "$distress_score"}}},
    ]
    rows = await db.farmers.aggregate(pipeline).to_list(10)
    total = sum(r["count"] for r in rows)
    total_pending = await db.farmers.aggregate([
        {"$match": {"risk_level": {"$in": ["High", "Critical"]}}},
        {"$group": {"_id": None, "sum": {"$sum": "$pending_amount"}}},
    ]).to_list(1)
    return {
        "levels": [{"level": r["_id"], "count": r["count"],
                    "share_pct": round(r["count"] / max(1, total) * 100, 1),
                    "avg_score": round(r["avg_score"], 1)} for r in rows],
        "total_farmers": total,
        "at_risk_pending_cr": round((total_pending[0]["sum"] if total_pending else 0) / 1e7, 2),
        "methodology": {
            "components": [
                {"name": "Payment Delay", "weight": 0.30},
                {"name": "Arrear Severity", "weight": 0.25},
                {"name": "Low Supply", "weight": 0.15},
                {"name": "Complaints", "weight": 0.15},
                {"name": "Transport Distance", "weight": 0.15},
            ],
            "thresholds": {"Low": "<35", "Medium": "35-55", "High": "55-75", "Critical": ">=75"},
        },
    }


@router.get("/by-district")
async def by_district():
    rows = await db.farmers.aggregate([
        {"$group": {"_id": "$district_name",
                    "avg_score": {"$avg": "$distress_score"},
                    "critical": {"$sum": {"$cond": [{"$eq": ["$risk_level", "Critical"]}, 1, 0]}},
                    "high": {"$sum": {"$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]}},
                    "medium": {"$sum": {"$cond": [{"$eq": ["$risk_level", "Medium"]}, 1, 0]}},
                    "low": {"$sum": {"$cond": [{"$eq": ["$risk_level", "Low"]}, 1, 0]}},
                    "total": {"$sum": 1}}},
        {"$sort": {"avg_score": -1}},
    ]).to_list(50)
    return [{"district": r["_id"], "avg_score": round(r["avg_score"], 1),
             "critical": r["critical"], "high": r["high"],
             "medium": r["medium"], "low": r["low"], "total": r["total"]} for r in rows]


@router.get("/radar")
async def radar(districts: str = "Shamli,Muzaffarnagar,Meerut"):
    """Component breakdown per district for radar chart."""
    names = [d.strip() for d in districts.split(",") if d.strip()]
    out = []
    for name in names:
        pipeline = [
            {"$match": {"district_name": name}},
            {"$group": {
                "_id": None,
                "delay": {"$avg": "$avg_delay_days"},
                "pending": {"$avg": "$pending_amount"},
                "supply": {"$avg": "$supply_qtl"},
                "complaints": {"$avg": "$complaints_count"},
                "transport": {"$avg": "$transport_distance_km"},
            }},
        ]
        r = await db.farmers.aggregate(pipeline).to_list(1)
        if not r:
            continue
        r = r[0]
        out.append({
            "district": name,
            "Payment Delay": round(min(100, (r["delay"] or 0) * 1.5), 1),
            "Arrear Severity": round(min(100, (r["pending"] or 0) / 500), 1),
            "Low Supply": round(100 - min(100, (r["supply"] or 0) / 5), 1),
            "Complaints": round(min(100, (r["complaints"] or 0) * 40), 1),
            "Transport": round(min(100, (r["transport"] or 0) * 2), 1),
        })
    return out
