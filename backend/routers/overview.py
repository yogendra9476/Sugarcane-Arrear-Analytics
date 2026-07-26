"""Overview + KPI + Ecosystem endpoints."""
from fastapi import APIRouter
from db import db

router = APIRouter(prefix="/overview", tags=["overview"])


@router.get("/kpis")
async def kpis():
    mills = await db.mills.count_documents({})
    farmers = await db.farmers.count_documents({})
    villages = await db.villages.count_documents({})
    districts = await db.districts.count_documents({})
    active_farmers = await db.farmers.count_documents({"payment_status": {"$in": ["Paid", "Partial", "Delayed"]}})

    agg = await db.mills.aggregate([{"$group": {
        "_id": None,
        "total_cane_qtl": {"$sum": "$total_cane_procured_qtl"},
        "total_paid_cr": {"$sum": "$paid_amount_cr"},
        "total_pending_cr": {"$sum": "$pending_amount_cr"},
        "avg_recovery": {"$avg": "$recovery_pct"},
        "avg_delay": {"$avg": "$avg_payment_delay_days"},
        "avg_util": {"$avg": "$capacity_utilization"},
        "avg_health": {"$avg": "$health_score"},
        "avg_pay_eff": {"$avg": "$payment_efficiency"},
    }}]).to_list(1)
    a = agg[0] if agg else {}

    complaints = await db.complaints.count_documents({})
    high_risk_mills = await db.mills.count_documents({"health_score": {"$lt": 60}})
    critical_farmers = await db.farmers.count_documents({"risk_level": {"$in": ["High", "Critical"]}})

    total_cane_qtl = a.get("total_cane_qtl", 0) or 0
    avg_cane_per_farmer = round(total_cane_qtl / max(1, farmers), 1)

    return {
        "total_mills": mills,
        "total_farmers": farmers,
        "active_farmers": active_farmers,
        "registered_villages": villages,
        "districts_covered": districts,
        "total_cane_procured_lakh_qtl": round(total_cane_qtl / 1e5, 1),
        "avg_cane_per_farmer_qtl": avg_cane_per_farmer,
        "avg_recovery_pct": round(a.get("avg_recovery", 0) or 0, 2),
        "avg_payment_delay_days": round(a.get("avg_delay", 0) or 0, 1),
        "payment_efficiency": round(a.get("avg_pay_eff", 0) or 0, 1),
        "pending_arrears_cr": round(a.get("total_pending_cr", 0) or 0, 1),
        "paid_amount_cr": round(a.get("total_paid_cr", 0) or 0, 1),
        "complaints": complaints,
        "capacity_utilization_pct": round(a.get("avg_util", 0) or 0, 1),
        "avg_health_score": round(a.get("avg_health", 0) or 0, 1),
        "high_risk_mills": high_risk_mills,
        "critical_farmers": critical_farmers,
        "farmer_satisfaction_pct": round(100 - (critical_farmers / max(1, farmers) * 100), 1),
    }


@router.get("/season-trends")
async def season_trends():
    docs = await db.season_stats.find({}, {"_id": 0}).sort("season", 1).to_list(20)
    return docs


@router.get("/mills-by-district")
async def mills_by_district():
    pipeline = [
        {"$group": {"_id": {"district": "$district_name", "type": "$type"}, "count": {"$sum": 1}}},
        {"$group": {"_id": "$_id.district",
                    "types": {"$push": {"type": "$_id.type", "count": "$count"}},
                    "total": {"$sum": "$count"}}},
        {"$sort": {"total": -1}},
    ]
    rows = await db.mills.aggregate(pipeline).to_list(50)
    out = []
    for r in rows:
        tmap = {t["type"]: t["count"] for t in r["types"]}
        out.append({
            "district": r["_id"],
            "Private": tmap.get("Private", 0),
            "Cooperative": tmap.get("Cooperative", 0),
            "Government": tmap.get("Government", 0),
            "total": r["total"],
        })
    return out


@router.get("/mill-type-split")
async def mill_type_split():
    pipeline = [{"$group": {"_id": "$type", "count": {"$sum": 1}}}]
    rows = await db.mills.aggregate(pipeline).to_list(10)
    return [{"type": r["_id"], "count": r["count"]} for r in rows]


@router.get("/payment-status-split")
async def payment_status_split():
    pipeline = [{"$group": {"_id": "$payment_status", "count": {"$sum": 1}}}]
    rows = await db.farmers.aggregate(pipeline).to_list(10)
    return [{"status": r["_id"], "count": r["count"]} for r in rows]


@router.get("/ecosystem")
async def ecosystem():
    """Static real Western UP value-chain data (from public sources in HTML)."""
    return {
        "value_chain": [
            {"actor": "Farmer (SAP)", "value_per_qtl": 370, "share_pct": 11.2, "color": "#2d6a4f"},
            {"actor": "Transport / Kaanta", "value_per_qtl": 15, "share_pct": 0.5, "color": "#e9c46a"},
            {"actor": "Mill Net Margin", "value_per_qtl": 240, "share_pct": 7.3, "color": "#187a4c"},
            {"actor": "Govt Levy / Tax", "value_per_qtl": 48, "share_pct": 1.5, "color": "#f4a261"},
            {"actor": "Retailer / Distributor", "value_per_qtl": 65, "share_pct": 2.0, "color": "#a78bfa"},
            {"actor": "Sugar (Final Value)", "value_per_qtl": 3400, "share_pct": 77.5, "color": "#60a5fa"},
        ],
        "shg": {"seedlings_cr": 48, "other_nurseries_cr": 152, "shg_count": 3200},
        "khandsari": {"new_units_2024_25": 285, "capacity_tcd": 73700,
                      "total_new_capacity_tcd": 184300},
        "credit": {"crop_loan_rate_pct_min": 7, "crop_loan_rate_pct_max": 9,
                   "moneylender_rate_pct_min": 24, "moneylender_rate_pct_max": 36},
    }
