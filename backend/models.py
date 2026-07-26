"""Pydantic domain models for Ganna Analytics."""
from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
import uuid


def uid() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


MillType = Literal["Private", "Cooperative", "Government"]
RiskLevel = Literal["Low", "Medium", "High", "Critical"]
PaymentStatus = Literal["Paid", "Partial", "Pending", "Delayed"]


class District(BaseModel):
    id: str = Field(default_factory=uid)
    name: str
    state: str = "Uttar Pradesh"
    region: str = "Western UP"
    latitude: float
    longitude: float
    total_villages: int = 0
    total_farmers: int = 0
    total_mills: int = 0


class Village(BaseModel):
    id: str = Field(default_factory=uid)
    name: str
    district_id: str
    district_name: str
    pincode: str
    farmer_count: int = 0


class Mill(BaseModel):
    id: str = Field(default_factory=uid)
    name: str
    code: str
    district_id: str
    district_name: str
    type: MillType
    capacity_tcd: int  # Tonnes Crushed per Day
    established_year: int
    recovery_pct: float
    crushing_days: int
    total_farmers: int = 0
    total_cane_procured_qtl: float = 0
    paid_amount_cr: float = 0
    pending_amount_cr: float = 0
    payment_efficiency: float = 0
    avg_payment_delay_days: float = 0
    complaint_ratio: float = 0
    capacity_utilization: float = 0
    health_score: float = 0
    status: str = "Active"
    known_for: str = ""


class Farmer(BaseModel):
    id: str = Field(default_factory=uid)
    farmer_code: str
    name: str
    phone: str
    village_id: str
    village_name: str
    district_id: str
    district_name: str
    mill_id: str
    mill_name: str
    land_acres: float
    supply_qtl: float
    supply_records_count: int
    payment_status: PaymentStatus
    paid_amount: float
    pending_amount: float
    avg_delay_days: float
    complaints_count: int
    transport_distance_km: float
    last_supply_date: str
    season: str
    distress_score: float = 0
    risk_level: RiskLevel = "Low"


class Payment(BaseModel):
    id: str = Field(default_factory=uid)
    farmer_id: str
    mill_id: str
    amount: float
    payment_date: str
    supply_date: str
    delay_days: int
    status: PaymentStatus
    season: str


class Complaint(BaseModel):
    id: str = Field(default_factory=uid)
    farmer_id: str
    mill_id: str
    category: str
    severity: Literal["Low", "Medium", "High"]
    status: Literal["Open", "Resolved", "Escalated"]
    filed_date: str


class SeasonStat(BaseModel):
    season: str
    cane_crushed_lakh_mt: float
    sugar_produced_lakh_mt: float
    ethanol_million_litres: float
    paid_cr: float
    arrear_cr: float
    payment_pct: float
