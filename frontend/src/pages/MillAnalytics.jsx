import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { endpoints, fmt } from "../lib/api";
import KPI from "../components/KPI";
import ChartCard, { CHART_TOOLTIP_STYLE, CHART_COLORS } from "../components/ChartCard";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export default function MillAnalytics() {
  const [params, setParams] = useSearchParams();
  const [millId, setMillId] = useState(params.get("mill") || "");

  const list = useQuery({ queryKey: ["mills-all"], queryFn: () => endpoints.mills({ limit: 100 }) });
  const comparison = useQuery({ queryKey: ["mill-cmp"], queryFn: () => endpoints.millComparison(15) });
  const healthDist = useQuery({ queryKey: ["health-dist"], queryFn: endpoints.healthDist });

  const detail = useQuery({
    queryKey: ["mill-detail", millId],
    queryFn: () => endpoints.millDetail(millId),
    enabled: !!millId,
  });

  useEffect(() => {
    if (millId) setParams({ mill: millId });
    else setParams({});
  }, [millId, setParams]);

  const m = detail.data?.mill;
  const stats = detail.data?.stats;

  return (
    <div data-testid="page-mill-analytics" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#0f5132] mb-3">Mill-wise Analytics</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Deep-dive into any mill
        </h2>
      </div>

      <div className="gcard p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={millId} onValueChange={setMillId}>
            <SelectTrigger data-testid="mill-selector" className="bg-white/70">
              <SelectValue placeholder="Choose a mill…" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {(list.data?.items || []).map((mm) => (
                <SelectItem key={mm.id} value={mm.id}>
                  {mm.name} · {mm.district_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {m && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPI testId="mill-kpi-capacity" label="Capacity" value={`${fmt.num(m.capacity_tcd)} TCD`} sub={m.type} tone="ink" />
            <KPI testId="mill-kpi-farmers" label="Farmers" value={fmt.num(stats?.farmer_count)} sub={m.district_name} />
            <KPI testId="mill-kpi-recovery" label="Recovery" value={fmt.pct(m.recovery_pct)} sub="Sugar / cane" tone="mint" />
            <KPI testId="mill-kpi-payeff" label="Payment Eff." value={fmt.pct(m.payment_efficiency)} sub={`Delay ${m.avg_payment_delay_days}d`} />
            <KPI testId="mill-kpi-pending" label="Pending" value={fmt.crore(m.pending_amount_cr)} sub={`Paid ₹${fmt.num(m.paid_amount_cr)} Cr`} />
            <KPI testId="mill-kpi-health" label="Health Score" value={(m.health_score || 0).toFixed(1)} sub="0–100"
                 tone="lime"
                 tooltip="40% Payment Efficiency + 25% Recovery + 15% Complaint Ratio + 10% Delay + 10% Capacity Utilization" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard testId="mill-payment-chart" title="Payment Status Split" subtitle="Farmers of this mill">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stats?.payment_split || []} dataKey="count" nameKey="status" innerRadius={55} outerRadius={95}>
                    {(stats?.payment_split || []).map((r, i) => (
                      <Cell key={i} fill={
                        r.status === "Paid" ? "#187a4c" :
                        r.status === "Partial" ? "#e9c46a" :
                        r.status === "Delayed" ? "#f4a261" : "#e76f51"} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard testId="mill-risk-chart" title="Farmer Risk Distribution" subtitle="From distress index">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats?.risk_split || []} margin={{ top: 4, right: 6, left: -14, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
                  <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#0f5132" radius={[6, 6, 0, 0]}>
                    {(stats?.risk_split || []).map((r, i) => (
                      <Cell key={i} fill={{
                        Low: "#187a4c", Medium: "#e9c46a", High: "#f4a261", Critical: "#e76f51"
                      }[r.level] || "#0f5132"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="chart-mill-comparison" title="Top 15 Mills Comparison" subtitle="Health vs Payment Efficiency">
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" />
              <XAxis dataKey="payment_efficiency" name="Pay Eff %" tick={{ fontSize: 10 }} domain={[60, 100]} />
              <YAxis dataKey="health_score" name="Health" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <ZAxis dataKey="capacity_tcd" range={[60, 400]} />
              <Tooltip {...CHART_TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }}
                       formatter={(v, n) => [v, n]}
                       labelFormatter={() => ""} />
              <Scatter data={comparison.data || []} fill="#0f5132" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="chart-health-dist" title="Health Score Distribution" subtitle="Buckets of {40,60,75,90,100}">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={healthDist.data || []} margin={{ top: 4, right: 6, left: -14, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(healthDist.data || []).map((r, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
