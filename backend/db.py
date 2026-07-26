"""MongoDB connection and index setup."""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = _client[os.environ["DB_NAME"]]


async def ensure_indexes() -> None:
    await db.districts.create_index("name", unique=True)
    await db.villages.create_index([("district_id", 1)])
    await db.villages.create_index("name")
    await db.mills.create_index([("district_id", 1)])
    await db.mills.create_index("name")
    await db.mills.create_index("code", unique=True)
    await db.mills.create_index("type")
    await db.farmers.create_index([("village_id", 1)])
    await db.farmers.create_index([("mill_id", 1)])
    await db.farmers.create_index([("district_id", 1)])
    await db.farmers.create_index("farmer_code", unique=True)
    await db.farmers.create_index([("name", "text"), ("village_name", "text"), ("mill_name", "text")])
    await db.farmers.create_index("payment_status")
    await db.farmers.create_index("risk_level")
    await db.payments.create_index([("farmer_id", 1)])
    await db.payments.create_index([("mill_id", 1), ("season", 1)])
    await db.complaints.create_index([("mill_id", 1)])
