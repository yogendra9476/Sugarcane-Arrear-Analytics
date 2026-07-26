"""Seed realistic Western UP sugarcane data into MongoDB.

Real Western UP districts + real major mill names. Farmers, villages, payments,
complaints are synthetic but statistically realistic.

Idempotent: only seeds if collection is empty.
"""
import asyncio
import random
from datetime import datetime, timedelta, timezone
from faker import Faker

from db import db, ensure_indexes
from models import (
    District, Village, Mill, Farmer, Payment, Complaint, SeasonStat, uid,
)

fake = Faker("en_IN")
random.seed(42)
Faker.seed(42)

# Real Western UP districts (sugarcane belt)
DISTRICTS = [
    ("Muzaffarnagar", 29.4727, 77.7085),
    ("Meerut", 28.9845, 77.7064),
    ("Bijnor", 29.3720, 78.1350),
    ("Shamli", 29.4497, 77.3117),
    ("Baghpat", 28.9430, 77.2168),
    ("Hapur", 28.7305, 77.7756),
    ("Bulandshahr", 28.4069, 77.8497),
    ("Saharanpur", 29.9680, 77.5455),
    ("Moradabad", 28.8386, 78.7733),
    ("Amroha", 28.9044, 78.4700),
    ("Rampur", 28.8155, 79.0250),
    ("Bareilly", 28.3670, 79.4304),
    ("Ghaziabad", 28.6692, 77.4538),
    ("Gautam Buddha Nagar", 28.5355, 77.3910),
]

# Real major sugar mills in Western UP with type + known-for tags
MILLS = [
    # (name, code, district, type, capacity_tcd, year, known_for)
    ("Triveni Khatauli", "TRV-KHT", "Muzaffarnagar", "Private", 16000, 1933, "Largest capacity in UP"),
    ("Triveni Deoband", "TRV-DBD", "Saharanpur", "Private", 12500, 1998, "High recovery %"),
    ("Bajaj Hindusthan Kinauni", "BAJ-KNU", "Meerut", "Private", 12000, 2005, "Ethanol integrated"),
    ("Bajaj Hindusthan Thanabhawan", "BAJ-TBH", "Shamli", "Private", 9000, 2006, "Ethanol capacity"),
    ("Bajaj Hindusthan Budhana", "BAJ-BDH", "Muzaffarnagar", "Private", 10000, 2006, "Cogeneration"),
    ("DCM Shriram Ajbapur", "DCM-AJB", "Muzaffarnagar", "Private", 11000, 1990, "Zero-liquid discharge"),
    ("DCM Shriram Loni", "DCM-LNI", "Meerut", "Private", 10500, 1998, "Diversified portfolio"),
    ("DSCL Rupapur", "DSC-RPR", "Hardoi", "Private", 9500, 2007, "Modern crushing"),
    ("Balrampur Chini Rauzagaon", "BLR-RZG", "Bijnor", "Private", 8500, 2002, "Distillery attached"),
    ("Simbhaoli Sugars", "SIM-SMB", "Hapur", "Private", 9000, 1933, "Legacy mill"),
    ("Simbhaoli Chilwaria", "SIM-CHW", "Bijnor", "Private", 7500, 1996, "Ethanol"),
    ("Kisan Sahkari Anupshahr", "KSC-ANP", "Bulandshahr", "Cooperative", 5000, 1979, "Farmer cooperative"),
    ("Kisan Sahkari Anoopshahr", "KSC-ANS", "Bulandshahr", "Cooperative", 5500, 1982, "Cooperative"),
    ("Kisan Sahkari Nadehi", "KSC-NDH", "Bijnor", "Cooperative", 4500, 1975, "Old cooperative"),
    ("Kisan Sahkari Ghosipur", "KSC-GSP", "Bijnor", "Cooperative", 4200, 1971, "Cooperative"),
    ("Kisan Sahkari Ramala", "KSC-RML", "Baghpat", "Cooperative", 5000, 1955, "Historic"),
    ("Kisan Sahkari Rohana", "KSC-RHN", "Muzaffarnagar", "Cooperative", 5500, 1968, "Cooperative"),
    ("Kisan Sahkari Sarsawa", "KSC-SRS", "Saharanpur", "Cooperative", 4800, 1972, "Cooperative"),
    ("Kisan Sahkari Nanauta", "KSC-NNT", "Saharanpur", "Cooperative", 4000, 1970, "Cooperative"),
    ("Kisan Sahkari Titawi", "KSC-TTW", "Muzaffarnagar", "Cooperative", 4500, 1974, "Cooperative"),
    ("Kisan Sahkari Morna", "KSC-MRN", "Muzaffarnagar", "Cooperative", 5000, 1971, "Cooperative"),
    ("Kisan Sahkari Bijnor", "KSC-BJN", "Bijnor", "Cooperative", 4800, 1969, "Cooperative"),
    ("Kisan Sahkari Meerut", "KSC-MRT", "Meerut", "Cooperative", 5200, 1966, "Cooperative"),
    ("Uttam Sugar Barkatpur", "UTM-BRK", "Bijnor", "Private", 7500, 2003, "Multi-product"),
    ("Uttam Sugar Libberheri", "UTM-LBH", "Haridwar", "Private", 8000, 2004, "Cogeneration"),
    ("Uttam Sugar Khaikheri", "UTM-KKH", "Muzaffarnagar", "Private", 7000, 2005, "Ethanol"),
    ("Modi Sugar Modinagar", "MDI-MDN", "Ghaziabad", "Private", 6000, 1933, "Legacy"),
    ("Wave Dhanaura", "WVE-DHN", "Amroha", "Private", 8500, 2010, "Modern facility"),
    ("Wave Sugars Amroha", "WVE-AMR", "Amroha", "Private", 8000, 2011, "Ethanol"),
    ("Sir Shadi Lal Mansurpur", "SSL-MSP", "Muzaffarnagar", "Private", 6500, 1933, "Historic"),
    ("Sir Shadi Lal Upper Doab", "SSL-UDB", "Shamli", "Private", 5000, 1938, "Legacy"),
    ("Mawana Sugars Mawana", "MWN-MWN", "Meerut", "Private", 9000, 1961, "Ethanol"),
    ("Mawana Sugars Titawi", "MWN-TTW", "Muzaffarnagar", "Private", 7000, 1997, "Cogen"),
    ("Dhampur Sugar Dhampur", "DHM-DHM", "Bijnor", "Private", 12000, 1933, "Chemical & bio"),
    ("Dhampur Bio Organics Asmoli", "DHM-ASM", "Sambhal", "Private", 8500, 2006, "Bio-organics"),
    ("Dhampur Meerganj", "DHM-MRG", "Bareilly", "Private", 6000, 1998, "Ethanol"),
    ("Dhampur Rajpura", "DHM-RJP", "Sambhal", "Private", 7500, 2001, "Cogen"),
    ("Indian Potash Rohanakalan", "IPL-RHK", "Muzaffarnagar", "Private", 7000, 2007, "Diversified"),
    ("Yaduvanshi Sugar Baghpat", "YDV-BGP", "Baghpat", "Private", 5500, 2004, "Regional"),
    ("SBEC Sugar Malakpur", "SBC-MLK", "Baghpat", "Private", 5000, 1997, "Regional"),
    ("Daurala Sugar Works", "DRL-DRL", "Meerut", "Private", 7000, 1932, "Legacy + distillery"),
    ("Nangloi Sugar Nangloi", "NGL-NGL", "Meerut", "Private", 4500, 1948, "Legacy"),
    ("Bareilly Cooperative", "KSC-BRL", "Bareilly", "Cooperative", 3500, 1972, "Cooperative"),
    ("Rampur Cooperative", "KSC-RMP", "Rampur", "Cooperative", 4000, 1975, "Cooperative"),
    ("Nawabganj Cooperative", "KSC-NWB", "Bareilly", "Cooperative", 3800, 1978, "Cooperative"),
    ("Semikhera Cooperative", "KSC-SMK", "Meerut", "Cooperative", 4200, 1970, "Cooperative"),
]

CURRENT_SEASON = "2024-25"
SEASONS = ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"]


def score_risk(distress: float) -> str:
    if distress >= 75: return "Critical"
    if distress >= 55: return "High"
    if distress >= 35: return "Medium"
    return "Low"


def health_score(pay_eff: float, recovery: float, complaint_ratio: float,
                 delay: float, utilization: float) -> float:
    # 40% pay, 25% recovery, 15% complaint, 10% delay, 10% capacity
    delay_penalty = max(0, 100 - delay * 2)  # 50d = 0
    complaint_score = max(0, 100 - complaint_ratio * 500)  # 20% complaints = 0
    score = (
        0.40 * pay_eff +
        0.25 * min(100, recovery * 8) +  # 12.5% recovery -> 100
        0.15 * complaint_score +
        0.10 * delay_penalty +
        0.10 * utilization
    )
    return round(min(100, max(0, score)), 1)


async def seed_all(force: bool = False) -> dict:
    await ensure_indexes()

    if not force and await db.mills.count_documents({}) > 0:
        return {"skipped": True, "reason": "already seeded"}

    # Wipe
    for c in ["districts", "villages", "mills", "farmers", "payments", "complaints", "season_stats"]:
        await db[c].delete_many({})

    # 1. Districts
    dist_docs = {}
    for name, lat, lon in DISTRICTS:
        d = District(name=name, latitude=lat, longitude=lon)
        dist_docs[name] = d.model_dump()
    # Also include extra districts referenced by mills (Sambhal, Hardoi, Haridwar) as light entries
    for extra in ["Sambhal", "Hardoi", "Haridwar"]:
        if extra not in dist_docs:
            dist_docs[extra] = District(name=extra, latitude=28.5, longitude=78.5, region="Western UP").model_dump()

    # 2. Mills
    mill_docs = []
    for name, code, dname, mtype, cap, year, known in MILLS:
        district = dist_docs.get(dname)
        if district is None:
            district = District(name=dname, latitude=28.5, longitude=78.5, region="Western UP").model_dump()
            dist_docs[dname] = district

        pay_eff = round(random.uniform(72, 99.5), 1)
        recovery = round(random.uniform(9.5, 12.8), 2)
        delay = round(random.uniform(5, 65), 1)
        util = round(random.uniform(55, 98), 1)
        complaint_ratio = round(random.uniform(0.005, 0.09), 3)
        farmer_count = random.randint(3200, 9500)
        cane_qtl = farmer_count * random.randint(180, 520)
        pending_cr = round(cane_qtl * 370 * (100 - pay_eff) / 100 / 1e7, 2)
        paid_cr = round(cane_qtl * 370 / 1e7 - pending_cr, 2)

        m = Mill(
            name=name, code=code,
            district_id=district["id"], district_name=dname,
            type=mtype, capacity_tcd=cap, established_year=year,
            recovery_pct=recovery, crushing_days=random.randint(120, 175),
            total_farmers=farmer_count,
            total_cane_procured_qtl=cane_qtl,
            paid_amount_cr=paid_cr, pending_amount_cr=pending_cr,
            payment_efficiency=pay_eff, avg_payment_delay_days=delay,
            complaint_ratio=complaint_ratio, capacity_utilization=util,
            health_score=health_score(pay_eff, recovery, complaint_ratio, delay, util),
            known_for=known,
        )
        mill_docs.append(m.model_dump())

    await db.mills.insert_many(mill_docs)

    # 3. Villages (per district, ~15-30 villages)
    village_docs = []
    village_by_district = {}
    for dname, d in dist_docs.items():
        n = random.randint(15, 30)
        village_by_district[dname] = []
        for _ in range(n):
            vname = fake.city_suffix() + " " + fake.last_name() + "pur"
            v = Village(name=vname, district_id=d["id"], district_name=dname,
                        pincode=str(random.randint(240000, 250999)))
            village_docs.append(v.model_dump())
            village_by_district[dname].append(v)
        d["total_villages"] = n

    await db.districts.insert_many(list(dist_docs.values()))
    await db.villages.insert_many(village_docs)

    # 4. Farmers (per mill, ~farmer_count each). Cap total to ~55k for demo perf.
    farmer_docs = []
    total_farmers_target = 55000
    per_mill_share = total_farmers_target / len(mill_docs)
    for m in mill_docs:
        share = int(per_mill_share * (m["total_farmers"] / 6000))
        share = max(400, min(share, 2200))
        villages = village_by_district.get(m["district_name"]) or list(village_by_district.values())[0]
        for i in range(share):
            v = random.choice(villages)
            pay_eff = m["payment_efficiency"]
            paid_prob = min(0.98, pay_eff / 100)
            status_roll = random.random()
            if status_roll < paid_prob * 0.85:
                status = "Paid"
            elif status_roll < paid_prob:
                status = "Partial"
            elif status_roll < paid_prob + 0.05:
                status = "Delayed"
            else:
                status = "Pending"

            supply = round(random.uniform(80, 900), 1)
            paid_amt = supply * 370 * (1 if status == "Paid" else (0.6 if status == "Partial" else (0.3 if status == "Delayed" else 0)))
            pending = supply * 370 - paid_amt
            delay = m["avg_payment_delay_days"] + random.uniform(-15, 25)
            delay = max(0, delay)
            complaints = int(random.random() < m["complaint_ratio"] * 3) + int(random.random() < 0.05)
            transport = round(random.uniform(2, 45), 1)

            # Distress score components (0-100)
            delay_c = min(100, delay * 1.5)
            arrear_c = min(100, (pending / max(1, supply * 370)) * 100)
            supply_c = 100 - min(100, supply / 5)
            complaint_c = min(100, complaints * 40)
            transport_c = min(100, transport * 2)
            distress = round(
                0.30 * delay_c + 0.25 * arrear_c + 0.15 * supply_c
                + 0.15 * complaint_c + 0.15 * transport_c, 1)

            last_supply = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 120))
            f = Farmer(
                farmer_code=f"WUP-{m['code']}-{i+1:05d}",
                name=fake.name(),
                phone="9" + str(random.randint(100000000, 999999999)),
                village_id=v.id, village_name=v.name,
                district_id=m["district_id"], district_name=m["district_name"],
                mill_id=m["id"], mill_name=m["name"],
                land_acres=round(random.uniform(0.5, 12), 2),
                supply_qtl=supply, supply_records_count=random.randint(2, 18),
                payment_status=status, paid_amount=round(paid_amt, 2),
                pending_amount=round(pending, 2), avg_delay_days=round(delay, 1),
                complaints_count=complaints, transport_distance_km=transport,
                last_supply_date=last_supply.isoformat(),
                season=CURRENT_SEASON,
                distress_score=distress, risk_level=score_risk(distress),
            )
            farmer_docs.append(f.model_dump())

    # Insert farmers in batches
    B = 5000
    for i in range(0, len(farmer_docs), B):
        await db.farmers.insert_many(farmer_docs[i:i + B])

    # 5. Season stats (statewide, from HTML real data)
    season_stats = [
        SeasonStat(season="2020-21", cane_crushed_lakh_mt=1124, sugar_produced_lakh_mt=126,
                   ethanol_million_litres=421, paid_cr=28400, arrear_cr=2100, payment_pct=93.1),
        SeasonStat(season="2021-22", cane_crushed_lakh_mt=996, sugar_produced_lakh_mt=112,
                   ethanol_million_litres=680, paid_cr=31200, arrear_cr=1800, payment_pct=94.5),
        SeasonStat(season="2022-23", cane_crushed_lakh_mt=1016, sugar_produced_lakh_mt=101,
                   ethanol_million_litres=1050, paid_cr=35158, arrear_cr=42, payment_pct=99.88),
        SeasonStat(season="2023-24", cane_crushed_lakh_mt=1098, sugar_produced_lakh_mt=104,
                   ethanol_million_litres=1540, paid_cr=33826, arrear_cr=4224, payment_pct=88.9),
        SeasonStat(season="2024-25", cane_crushed_lakh_mt=1020, sugar_produced_lakh_mt=103,
                   ethanol_million_litres=1750, paid_cr=30200, arrear_cr=6800, payment_pct=82.1),
    ]
    await db.season_stats.insert_many([s.model_dump() for s in season_stats])

    # 6. Complaints sample
    farmer_sample = random.sample(farmer_docs, min(2500, len(farmer_docs)))
    complaint_docs = []
    for f in farmer_sample:
        if f["complaints_count"] == 0:
            continue
        for _ in range(f["complaints_count"]):
            c = Complaint(
                farmer_id=f["id"], mill_id=f["mill_id"],
                category=random.choice(["Payment Delay", "Weighment", "Slip Issue", "Transport", "Quality"]),
                severity=random.choice(["Low", "Medium", "High"]),
                status=random.choice(["Open", "Resolved", "Escalated"]),
                filed_date=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 200))).isoformat(),
            )
            complaint_docs.append(c.model_dump())
    if complaint_docs:
        await db.complaints.insert_many(complaint_docs)

    # 7. Update district aggregates
    for dname, d in dist_docs.items():
        farmer_count = await db.farmers.count_documents({"district_name": dname})
        mill_count = await db.mills.count_documents({"district_name": dname})
        await db.districts.update_one(
            {"name": dname},
            {"$set": {"total_farmers": farmer_count, "total_mills": mill_count}},
        )

    return {
        "districts": len(dist_docs),
        "mills": len(mill_docs),
        "villages": len(village_docs),
        "farmers": len(farmer_docs),
        "complaints": len(complaint_docs),
    }


if __name__ == "__main__":
    result = asyncio.run(seed_all(force=True))
    print("Seed result:", result)
