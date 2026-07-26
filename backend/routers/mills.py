"""Mill CRUD + search + analytics."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from db import db

router = APIRouter(prefix="/mills", tags=["mills"])


@router.get("")
async def list_mills(
    q: Optional[str] = None,
    district: Optional[str] = None,
    type: Optional[str] = None,
    min_capacity: Optional[int] = None,
    min_recovery: Optional[float] = None,
    min_health: Optional[float] = None,
    sort_by: str = "health_score",
    sort_dir: int = -1,
    page: int = 1,
    limit: int = 20,
):
    query: dict = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"code": {"$regex": q, "$options": "i"}},
            {"district_name": {"$regex": q, "$options": "i"}},
        ]
    if district: query["district_name"] = district
    if type: query["type"] = type
    if min_capacity: query["capacity_tcd"] = {"$gte": min_capacity}
    if min_recovery: query["recovery_pct"] = {"$gte": min_recovery}
    if min_health: query["health_score"] = {"$gte": min_health}

    total = await db.mills.count_documents(query)
    cursor = db.mills.find(query, {"_id": 0}).sort(sort_by, sort_dir) \
        .skip((page - 1) * limit).limit(limit)
    items = await cursor.to_list(limit)
    return {"total": total, "page": page, "limit": limit, "items": items}


@router.get("/autocomplete")
async def autocomplete(q: str = Query(..., min_length=1), limit: int = 8):
    rows = await db.mills.find(
        {"name": {"$regex": q, "$options": "i"}}, {"_id": 0, "id": 1, "name": 1, "district_name": 1}
    ).limit(limit).to_list(limit)
    return rows


@router.get("/{mill_id}")
async def get_mill(mill_id: str):
    m = await db.mills.find_one({"id": mill_id}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Mill not found")

    farmer_count = await db.farmers.count_documents({"mill_id": mill_id})
    payment_split = await db.farmers.aggregate([
        {"$match": {"mill_id": mill_id}},
        {"$group": {"_id": "$payment_status", "count": {"$sum": 1}}},
    ]).to_list(10)
    risk_split = await db.farmers.aggregate([
        {"$match": {"mill_id": mill_id}},
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}},
    ]).to_list(10)
    complaints = await db.complaints.count_documents({"mill_id": mill_id})

    return {
        "mill": m,
        "stats": {
            "farmer_count": farmer_count,
            "payment_split": [{"status": r["_id"], "count": r["count"]} for r in payment_split],
            "risk_split": [{"level": r["_id"], "count": r["count"]} for r in risk_split],
            "complaints_total": complaints,
        },
    }


@router.get("/analytics/comparison")
async def mill_comparison(limit: int = 15):
    """Top mills by capacity with key metrics for comparison chart."""
    rows = await db.mills.find({}, {"_id": 0, "name": 1, "capacity_tcd": 1,
                                    "recovery_pct": 1, "payment_efficiency": 1,
                                    "health_score": 1, "avg_payment_delay_days": 1}) \
        .sort("capacity_tcd", -1).limit(limit).to_list(limit)
    return rows


@router.get("/analytics/health-distribution")
async def health_distribution():
    """Health score buckets."""
    buckets = [(0, 40, "Critical"), (40, 60, "Poor"), (60, 75, "Fair"),
               (75, 90, "Good"), (90, 100.1, "Excellent")]
    result = []
    for lo, hi, label in buckets:
        c = await db.mills.count_documents({"health_score": {"$gte": lo, "$lt": hi}})
        result.append({"bucket": label, "count": c, "range": f"{lo}-{int(hi)}"})
    return result
