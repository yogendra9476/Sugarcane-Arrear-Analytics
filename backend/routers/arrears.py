"""Arrear tracker."""
from fastapi import APIRouter
from db import db

router = APIRouter(prefix="/arrears", tags=["arrears"])


@router.get("/summary")
async def summary():
    agg = await db.mills.aggregate([{"$group": {
        "_id": None,
        "total_pending_cr": {"$sum": "$pending_amount_cr"},
        "total_paid_cr": {"$sum": "$paid_amount_cr"},
        "avg_delay": {"$avg": "$avg_payment_delay_days"},
    }}]).to_list(1)
    a = agg[0] if agg else {}
    pending = a.get("total_pending_cr", 0) or 0
    paid = a.get("total_paid_cr", 0) or 0
    total = pending + paid
    return {
        "total_pending_cr": round(pending, 1),
        "total_paid_cr": round(paid, 1),
        "total_dues_cr": round(total, 1),
        "payment_pct": round(paid / max(1, total) * 100, 2),
        "avg_delay_days": round(a.get("avg_delay", 0) or 0, 1),
    }


@router.get("/worst-mills")
async def worst_mills(limit: int = 15):
    rows = await db.mills.find({}, {"_id": 0}).sort("pending_amount_cr", -1).limit(limit).to_list(limit)
    return rows


@router.get("/trend")
async def trend():
    """Statewide arrear trend from season_stats."""
    docs = await db.season_stats.find({}, {"_id": 0}).sort("season", 1).to_list(20)
    return docs


@router.get("/by-district")
async def by_district():
    pipeline = [
        {"$group": {"_id": "$district_name",
                    "pending_cr": {"$sum": "$pending_amount_cr"},
                    "paid_cr": {"$sum": "$paid_amount_cr"},
                    "mills": {"$sum": 1}}},
        {"$sort": {"pending_cr": -1}},
    ]
    rows = await db.mills.aggregate(pipeline).to_list(50)
    return [{"district": r["_id"], "pending_cr": round(r["pending_cr"], 2),
             "paid_cr": round(r["paid_cr"], 2), "mills": r["mills"]} for r in rows]
