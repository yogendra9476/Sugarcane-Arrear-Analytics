import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Factory, Users, Search, AlertTriangle, MapPin, Link2,
  BarChart3, Settings as SettingsIcon, Sprout,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Overview", exact: true },
  { to: "/mill-analytics", icon: Factory, label: "Mill-wise Analytics" },
  { to: "/farmers", icon: Users, label: "Farmer Search" },
  { to: "/mill-search", icon: Search, label: "Mill Search" },
  { to: "/arrears", icon: AlertTriangle, label: "Arrear Tracker" },
  { to: "/distress", icon: AlertTriangle, label: "Farmer Distress Index" },
  { to: "/districts", icon: MapPin, label: "District Analytics" },
  { to: "/ecosystem", icon: Link2, label: "Sugar Ecosystem" },
  { to: "/analytics", icon: BarChart3, label: "Analytics Dashboard" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function Layout() {
  return (
    <div className="min-h-screen text-[#0b1712]">
      {/* Header */}
      <header
        data-testid="app-header"
        className="sticky top-0 z-30 backdrop-blur-md bg-[#f7f4ec]/80 border-b border-[#0b1712]/10"
      >
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-[#0f5132] flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-[#d8ff73]" strokeWidth={2.3} />
            </div>
            <div>
              <div className="font-display text-[15px] font-bold tracking-tight">
                Ganna Analytics
              </div>
              <div className="mono text-[9.5px] uppercase text-[#66736d] tracking-widest">
                Western UP · Enterprise
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="chip">Season 2024–25</span>
            <span className="chip chip-lime">Live Data</span>
          </div>
        </div>
      </header>

      {/* Source ribbon */}
      <div className="bg-[#0b1712] text-[#f7f4ec]">
        <div className="max-w-[1440px] mx-auto px-6 py-1.5 text-[10.5px] mono tracking-wider uppercase overflow-hidden">
          UP Sugar Industry & Cane Development · Real Farmer / Mill / Payment Data · 2024–25 Season
        </div>
      </div>

      {/* Nav */}
      <nav
        data-testid="primary-nav"
        className="sticky top-[65px] z-20 bg-[#f7f4ec]/95 backdrop-blur border-b border-[#0b1712]/10"
      >
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="nav-scroll flex gap-1.5 overflow-x-auto py-2.5">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.exact}
                data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#0b1712] text-[#f7f4ec]"
                      : "text-[#0b1712]/75 hover:bg-[#0b1712]/[.06]"
                  }`
                }
              >
                <n.icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 pb-24">
        <Outlet />
      </main>

      <footer className="border-t border-[#0b1712]/10 py-6 text-center mono text-[10.5px] uppercase tracking-widest text-[#66736d]">
        Ganna Analytics 2.0 · Built for the Western UP Cane Ecosystem
      </footer>
    </div>
  );
}
