import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Factory, Users, Search, AlertTriangle, MapPin, Link2,
  BarChart3, Settings as SettingsIcon, Sprout, Menu, X, ChevronRight,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Overview", exact: true, desc: "KPI snapshot" },
  { to: "/mill-analytics", icon: Factory, label: "Mill-wise Analytics", desc: "Per-mill deep dive" },
  { to: "/farmers", icon: Users, label: "Farmer Search", desc: "58k+ farmers" },
  { to: "/mill-search", icon: Search, label: "Mill Search", desc: "Filter 46 mills" },
  { to: "/arrears", icon: AlertTriangle, label: "Arrear Tracker", desc: "Pending payments" },
  { to: "/distress", icon: AlertTriangle, label: "Farmer Distress Index", desc: "Risk scoring" },
  { to: "/districts", icon: MapPin, label: "District Analytics", desc: "14 districts" },
  { to: "/ecosystem", icon: Link2, label: "Sugar Ecosystem", desc: "Value chain" },
  { to: "/analytics", icon: BarChart3, label: "Analytics Dashboard", desc: "Executive view" },
  { to: "/settings", icon: SettingsIcon, label: "Settings", desc: "Platform config" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = NAV.find((n) => n.to === location.pathname) || NAV[0];

  return (
    <div className="min-h-screen text-[#0b1712]">
      {/* Header */}
      <header
        data-testid="app-header"
        className="sticky top-0 z-40 backdrop-blur-md bg-[#f7f4ec]/85 border-b border-[#0b1712]/10"
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[13px] bg-[#0f5132] flex items-center justify-center shadow-sm shrink-0">
              <Sprout className="w-5 h-5 text-[#d8ff73]" strokeWidth={2.3} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[15px] font-bold tracking-tight truncate">
                Ganna Analytics
              </div>
              <div className="mono text-[9.5px] uppercase text-[#0b1712]/60 tracking-widest truncate">
                Western UP · Enterprise
              </div>
            </div>
          </div>

          {/* Menu box — collapsed navigation */}
          <button
            data-testid="nav-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className={`group flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl border transition-all ${
              open
                ? "bg-[#0b1712] text-[#f7f4ec] border-[#0b1712]"
                : "bg-white/70 border-[#0b1712]/10 hover:border-[#0b1712]/30"
            }`}
          >
            <current.icon className="w-4 h-4 shrink-0" strokeWidth={2.2} />
            <div className="text-left hidden sm:block">
              <div className="mono text-[9px] uppercase tracking-widest opacity-70 leading-none">
                Section
              </div>
              <div className="text-[12.5px] font-semibold leading-tight">
                {current.label}
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                open ? "bg-[#d8ff73] text-[#0b1712]" : "bg-[#0b1712] text-[#f7f4ec] group-hover:bg-[#0f5132]"
              }`}
            >
              {open ? <X className="w-4 h-4" strokeWidth={2.4} /> : <Menu className="w-4 h-4" strokeWidth={2.4} />}
            </div>
          </button>
        </div>

        {/* Expanding menu panel — inside header for sticky */}
        <div
          data-testid="nav-panel"
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            open ? "max-h-[720px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 pb-5 pt-1">
            <div className="mono text-[9.5px] uppercase tracking-[0.2em] text-[#0b1712]/55 mb-3">
              Navigate to
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.exact}
                  data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className={({ isActive }) =>
                    `group relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                      isActive
                        ? "bg-[#0b1712] text-[#f7f4ec] border-[#0b1712]"
                        : "bg-white/75 border-[#0b1712]/10 hover:border-[#0f5132] hover:-translate-y-0.5 hover:shadow-lg"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? "bg-[#d8ff73] text-[#0b1712]"
                              : "bg-[#dff7e9] text-[#0f5132] group-hover:bg-[#d8ff73]"
                          }`}
                        >
                          <n.icon className="w-4 h-4" strokeWidth={2.2} />
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? "text-[#d8ff73]" : "text-[#0b1712]/30"
                          }`}
                          strokeWidth={2.2}
                        />
                      </div>
                      <div className="mt-3">
                        <div className="text-[13px] font-semibold tracking-tight leading-tight">
                          {n.label}
                        </div>
                        <div
                          className={`mono text-[10px] uppercase tracking-widest mt-1 ${
                            isActive ? "text-[#d8ff73]/80" : "text-[#0b1712]/55"
                          }`}
                        >
                          {n.desc}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop when open */}
      {open && (
        <div
          data-testid="nav-backdrop"
          className="fixed inset-0 z-30 bg-[#0b1712]/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Source ribbon */}
      <div className="bg-[#0b1712] text-[#f7f4ec]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-1.5 text-[10.5px] mono tracking-wider uppercase overflow-hidden">
          UP Sugar Industry & Cane Development · Real Farmer / Mill / Payment Data · 2024–25 Season
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 pb-24">
        <Outlet />
      </main>

      <footer className="border-t border-[#0b1712]/10 py-6 text-center mono text-[10.5px] uppercase tracking-widest text-[#0b1712]/55">
        Ganna Analytics 2.0 · Built for the Western UP Cane Ecosystem
      </footer>
    </div>
  );
}
