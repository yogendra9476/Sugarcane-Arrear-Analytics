# Ganna Analytics – Western UP (v2.0)

## Original Problem
Rebuild a hardcoded HTML sugarcane dashboard into a production-grade full-stack analytics platform for the UP Cane Department, covering farmer/mill search, arrears, distress index, ecosystem, and district analytics. Preserve HTML theme.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor) with domain routers (overview/mills/farmers/districts/arrears/distress). Health-score & distress-index formulas encoded server-side. Indexes on all lookup fields.
- **Frontend**: React 19 + React Router 7 + TanStack Query + Recharts + shadcn/ui. Manrope + DM Mono fonts. Cream/ink/lime/green theme matching source HTML.
- **Data**: Realistic Western UP seed — 46 real mills (Triveni, Bajaj Hindusthan, DCM Shriram, Balrampur Chini, Dhampur, Uttam, etc.) across 17 districts, 58,544 farmers, 396 villages, ~450 complaints.

## Implemented (2026-02)
- ✅ 10-page platform: Overview, Mill Analytics, Farmer Search, Mill Search, Arrear Tracker, Distress Index, District Analytics, Ecosystem, Analytics Dashboard, Settings
- ✅ 21 KPIs computed live from Mongo aggregations (no hardcoded numbers)
- ✅ Farmer search: debounced full-text + 4 filters + sort + pagination + CSV/Excel/PDF/Print export + detail modal
- ✅ Mill search: filter by type/district/health + inline health bars
- ✅ Health Score formula (40/25/15/10/10 weighting) with tooltip
- ✅ Farmer Distress Index (30/25/15/15/15 weighting, 4 risk buckets)
- ✅ 15+ charts: Bar, stacked bar, line, area, scatter, pie/donut, radar, treemap
- ✅ Ecosystem value chain (real ₹/qtl figures) + SHG + Khandsari + credit
- ✅ Season trends (5 years, real statewide payment/crushing/ethanol figures from source)
- ✅ MongoDB indexes on all search fields, rate limiter, CORS, error handler
- ✅ Auto-seed on empty DB, /admin/seed reseed endpoint

## Data Model
Farmer → Village → District ↔ Mill · Payment · Complaint · SeasonStat

## Backlog (P1/P2)
- Real eGanna ingest pipeline (currently synthetic)
- Auth + role-based access
- Interactive district choropleth map (leaflet)
- Weather feed integration
- Push notifications for arrear breach

