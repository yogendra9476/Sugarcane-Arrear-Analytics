"""Ganna Analytics – Western UP  ·  FastAPI backend."""
import os
import logging
from pathlib import Path
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

from db import db, ensure_indexes  # noqa: E402
from routers import overview, mills, farmers, districts, arrears, distress  # noqa: E402
from seed import seed_all  # noqa: E402

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("ganna")

limiter = Limiter(key_func=get_remote_address, default_limits=["300/minute"])

app = FastAPI(title="Ganna Analytics API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"service": "Ganna Analytics – Western UP", "version": "2.0.0"}


@api.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"ok": True, "db": "connected"}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": str(e)}


@api.post("/admin/seed")
async def seed(force: bool = False):
    result = await seed_all(force=force)
    return result


api.include_router(overview.router)
api.include_router(mills.router)
api.include_router(farmers.router)
api.include_router(districts.router)
api.include_router(arrears.router)
api.include_router(distress.router)

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await ensure_indexes()
    if await db.mills.count_documents({}) == 0:
        log.info("Empty DB — seeding …")
        r = await seed_all(force=True)
        log.info("Seeded: %s", r)
    else:
        log.info("Data already present, skipping seed")


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
