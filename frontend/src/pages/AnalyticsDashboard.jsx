import React from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import KPI from "../components/KPI";
import ChartCard, { CHART_TOOLTIP_STYLE } from "../components/ChartCard";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell, LineChart, Line, Legend,
} from "recharts";

export default function AnalyticsDashboard() {
  const kpis = useQuery({ queryKey: ["kpis-ad"], queryFn: endpoints.overview });
  const seg = useQuery({ queryKey: ["segmentation"], queryFn: endpoints.segmentation });
  const trends = useQuery({ queryKey: ["seasons-ad"], queryFn: endpoints.seasonTrends });
  const cmp = useQuery({ queryKey: ["cmp-ad"], queryFn: () => endpoints.millComparison(20) });

  const k = kpis.data || {};

  return (
    <div data-testid="page-analytics" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">Analytics Dashboard</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Executive summary
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Mills" value={fmt.num(k.total_mills)} tone="ink" />
        <KPI label="Farmers" value={fmt.num(k.total_farmers)} />
        <KPI label="Cane Procured" value={`${k.total_cane_procured_lakh_qtl || 0} L qtl`} />
        <KPI label="Pending" value={fmt.crore(k.pending_arrears_cr)} />
        <KPI label="Recovery" value={fmt.pct(k.avg_recovery_pct)} tone="mint" />
        <KPI label="Health Score" value={(k.avg_health_score || 0).toFixed(1)} tone="lime" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="ad-segmentation" title="Farmer Segmentation" subtitle="By supply volume">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={seg.data || []} margin={{ top: 4, right: 20, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Bar yAxisId="l" dataKey="count" name="Farmers" fill="#0f5132" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="r" dataKey="avg_distress" name="Avg Distress" fill="#e9c46a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="ad-scatter" title="Mill Scatter" subtitle="Payment × Health × Capacity">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" />
              <XAxis dataKey="payment_efficiency" name="Pay Eff" tick={{ fontSize: 10 }} domain={[60, 100]} />
              <YAxis dataKey="recovery_pct" name="Recovery" tick={{ fontSize: 10 }} domain={[9, 13]} />
              <ZAxis dataKey="capacity_tcd" range={[80, 500]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={cmp.data || []} fill="#187a4c" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard testId="ad-trend" title="Multi-metric Trend" subtitle="UP season aggregates">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={trends.data || []} margin={{ top: 4, right: 20, left: -8, bottom: 4 }}>
            <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
            <XAxis dataKey="season" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
            <Line yAxisId="l" dataKey="cane_crushed_lakh_mt" name="Cane (L MT)" stroke="#0f5132" strokeWidth={2.5} />
            <Line yAxisId="l" dataKey="sugar_produced_lakh_mt" name="Sugar (L MT)" stroke="#e9c46a" strokeWidth={2.5} />
            <Line yAxisId="r" dataKey="ethanol_million_litres" name="Ethanol (Mn L)" stroke="#2563eb" strokeWidth={2.5} />
            <Line yAxisId="r" dataKey="payment_pct" name="Pay %" stroke="#e76f51" strokeWidth={2.5} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
