"""Farmer search + detail + analytics."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from db import db

router = APIRouter(prefix="/farmers", tags=["farmers"])


@router.get("")
async def search_farmers(
    q: Optional[str] = None,
    district: Optional[str] = None,
    mill: Optional[str] = None,
    village: Optional[str] = None,
    payment_status: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_supply: Optional[float] = None,
    min_pending: Optional[float] = None,
    season: Optional[str] = None,
    sort_by: str = "distress_score",
    sort_dir: int = -1,
    page: int = 1,
    limit: int = 25,
):
    query: dict = {}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"farmer_code": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
            {"village_name": {"$regex": q, "$options": "i"}},
        ]
    if district: query["district_name"] = district
    if mill: query["mill_name"] = mill
    if village: query["village_name"] = village
    if payment_status: query["payment_status"] = payment_status
    if risk_level: query["risk_level"] = risk_level
    if season: query["season"] = season
    if min_supply is not None: query["supply_qtl"] = {"$gte": min_supply}
    if min_pending is not None: query["pending_amount"] = {"$gte": min_pending}

    total = await db.farmers.count_documents(query)
    limit = min(limit, 200)
    cursor = db.farmers.find(query, {"_id": 0}).sort(sort_by, sort_dir) \
        .skip((page - 1) * limit).limit(limit)
    items = await cursor.to_list(limit)
    return {"total": total, "page": page, "limit": limit, "items": items}


@router.get("/autocomplete")
async def autocomplete(q: str = Query(..., min_length=2), limit: int = 8):
    rows = await db.farmers.find(
        {"name": {"$regex": f"^{q}", "$options": "i"}},
        {"_id": 0, "id": 1, "name": 1, "farmer_code": 1, "village_name": 1, "mill_name": 1},
    ).limit(limit).to_list(limit)
    return rows


@router.get("/{farmer_id}")
async def get_farmer(farmer_id: str):
    f = await db.farmers.find_one({"id": farmer_id}, {"_id": 0})
    if not f:
        raise HTTPException(404, "Farmer not found")
    complaints = await db.complaints.find({"farmer_id": farmer_id}, {"_id": 0}).to_list(50)
    return {"farmer": f, "complaints": complaints}


@router.get("/analytics/segmentation")
async def segmentation():
    """Farmer segmentation by supply qty & payment status for scatter/matrix."""
    rows = await db.farmers.aggregate([
        {"$bucket": {
            "groupBy": "$supply_qtl",
            "boundaries": [0, 150, 300, 500, 800, 10000],
            "default": "Other",
            "output": {"count": {"$sum": 1},
                       "avg_pending": {"$avg": "$pending_amount"},
                       "avg_distress": {"$avg": "$distress_score"}},
        }},
    ]).to_list(20)
    labels = ["0-150 qtl", "150-300 qtl", "300-500 qtl", "500-800 qtl", "800+ qtl"]
    out = []
    for i, r in enumerate(rows):
        out.append({
            "segment": labels[i] if i < len(labels) else str(r["_id"]),
            "count": r["count"],
            "avg_pending": round(r["avg_pending"] or 0, 0),
            "avg_distress": round(r["avg_distress"] or 0, 1),
        })
    return out
