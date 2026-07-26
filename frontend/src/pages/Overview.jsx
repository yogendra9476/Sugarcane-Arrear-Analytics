import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
  CartesianGrid, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";
import { endpoints, fmt } from "../lib/api";
import KPI from "../components/KPI";
import ChartCard, { CHART_COLORS, CHART_TOOLTIP_STYLE } from "../components/ChartCard";

export default function Overview() {
  const kpis = useQuery({ queryKey: ["kpis"], queryFn: endpoints.overview });
  const seasons = useQuery({ queryKey: ["seasons"], queryFn: endpoints.seasonTrends });
  const millsByDist = useQuery({ queryKey: ["millsByDist"], queryFn: endpoints.millsByDistrict });
  const typeSplit = useQuery({ queryKey: ["typeSplit"], queryFn: endpoints.millTypeSplit });
  const paySplit = useQuery({ queryKey: ["paySplit"], queryFn: endpoints.paymentStatusSplit });

  const k = kpis.data || {};

  return (
    <div data-testid="page-overview" className="space-y-8">
      {/* Hero */}
      <section className="relative pt-6">
        <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-[#0f5132] mb-4">
          Western Uttar Pradesh · Season 2024–25
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.02] max-w-4xl">
          The state of the <span className="text-[#0f5132]">sugarcane belt</span>,<br />
          measured end-to-end.
        </h1>
        <p className="text-[15px] text-[#0b1712]/65 mt-5 max-w-2xl">
          Enterprise analytics for the Uttar Pradesh Cane Department covering{" "}
          <b>{fmt.num(k.total_mills)} mills</b>, <b>{fmt.num(k.total_farmers)} farmers</b>,{" "}
          <b>{fmt.num(k.registered_villages)} villages</b> across{" "}
          <b>{fmt.num(k.districts_covered)} districts</b>.
        </p>
      </section>

      {/* Hero KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI testId="kpi-mills" label="Total Mills" value={fmt.num(k.total_mills)} sub="Active in Western UP" tone="ink" />
        <KPI testId="kpi-farmers" label="Total Farmers" value={fmt.num(k.total_farmers)} sub={`${fmt.num(k.active_farmers)} active`} />
        <KPI testId="kpi-cane" label="Cane Procured" value={`${k.total_cane_procured_lakh_qtl || 0} L qtl`} sub="Season aggregate" />
        <KPI testId="kpi-payeff" label="Payment Efficiency" value={fmt.pct(k.payment_efficiency)} sub="Weighted, all mills" tone="lime" />
        <KPI testId="kpi-pending" label="Pending Arrears" value={fmt.crore(k.pending_arrears_cr)} sub={`Delay avg ${k.avg_payment_delay_days} d`} />
        <KPI testId="kpi-recovery" label="Avg Recovery" value={fmt.pct(k.avg_recovery_pct)} sub="Sugar / cane" />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI testId="kpi-satisfaction" label="Farmer Satisfaction" value={fmt.pct(k.farmer_satisfaction_pct)} sub="Non-critical share" tone="mint" />
        <KPI testId="kpi-complaints" label="Complaints" value={fmt.num(k.complaints)} sub="Filed this season" />
        <KPI testId="kpi-util" label="Capacity Utilization" value={fmt.pct(k.capacity_utilization_pct)} sub="Avg across mills" />
        <KPI testId="kpi-health" label="Avg Health Score" value={(k.avg_health_score || 0).toFixed(1)} sub="0–100 composite"
             tooltip="40% Payment Efficiency + 25% Recovery + 15% Complaint Ratio + 10% Delay + 10% Capacity Utilization" />
        <KPI testId="kpi-highrisk" label="High-Risk Mills" value={fmt.num(k.high_risk_mills)} sub="Health score < 60" />
        <KPI testId="kpi-critical" label="Critical Farmers" value={fmt.num(k.critical_farmers)} sub="High + Critical risk" />
      </section>

      {/* Charts row 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="chart-mills-district" title="Mills per District"
          subtitle="Distribution across Western UP">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={millsByDist.data || []} margin={{ top: 6, right: 6, left: -18, bottom: 12 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Bar dataKey="Private" stackId="a" fill="#0f5132" />
              <Bar dataKey="Cooperative" stackId="a" fill="#d8ff73" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="chart-season-payment" title="Statewide Payment Progress"
          subtitle="Paid vs Arrear (₹ Cr) by season">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={seasons.data || []} margin={{ top: 6, right: 6, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Bar dataKey="paid_cr" name="Paid" stackId="a" fill="#187a4c" />
              <Bar dataKey="arrear_cr" name="Arrear" stackId="a" fill="#e76f51" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Charts row 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard testId="chart-crushing" title="Crushing & Sugar Trend"
          subtitle="UP totals in Lakh MT">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={seasons.data || []} margin={{ top: 4, right: 6, left: -12, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Line type="monotone" dataKey="cane_crushed_lakh_mt" name="Cane" stroke="#0f5132" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sugar_produced_lakh_mt" name="Sugar" stroke="#e9c46a" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="chart-ethanol" title="Ethanol Production Growth" subtitle="Million Litres">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={seasons.data || []} margin={{ top: 4, right: 6, left: -12, bottom: 4 }}>
              <defs>
                <linearGradient id="et" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#187a4c" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#187a4c" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="ethanol_million_litres" stroke="#187a4c" fill="url(#et)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="chart-mill-type" title="Mill Type Split" subtitle="Private vs Cooperative">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeSplit.data || []} dataKey="count" nameKey="type"
                   innerRadius={55} outerRadius={90} paddingAngle={3}>
                {(typeSplit.data || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Payment split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="chart-payment-split" title="Farmer Payment Status"
          subtitle={`Distribution across ${fmt.num(k.total_farmers)} farmers`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={paySplit.data || []} layout="vertical"
              margin={{ top: 4, right: 30, left: 20, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#0f5132" radius={[0, 6, 6, 0]}>
                {(paySplit.data || []).map((row, i) => (
                  <Cell key={i} fill={
                    row.status === "Paid" ? "#187a4c" :
                    row.status === "Partial" ? "#e9c46a" :
                    row.status === "Delayed" ? "#f4a261" : "#e76f51"
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="chart-payment-pct" title="Payment %" subtitle="Season-wise">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={seasons.data || []} margin={{ top: 4, right: 6, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="payment_pct" fill="#d8ff73" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}
