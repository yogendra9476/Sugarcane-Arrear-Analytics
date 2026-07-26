import React from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints, fmt } from "../lib/api";
import KPI from "../components/KPI";
import ChartCard, { CHART_TOOLTIP_STYLE } from "../components/ChartCard";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, Cell,
} from "recharts";

export default function ArrearTracker() {
  const summary = useQuery({ queryKey: ["arr-sum"], queryFn: endpoints.arrearSummary });
  const worst = useQuery({ queryKey: ["arr-worst"], queryFn: () => endpoints.arrearWorst(15) });
  const trend = useQuery({ queryKey: ["arr-trend"], queryFn: endpoints.arrearTrend });
  const byDist = useQuery({ queryKey: ["arr-dist"], queryFn: endpoints.arrearByDistrict });

  const s = summary.data || {};

  return (
    <div data-testid="page-arrears" className="space-y-6">
      <div>
        <div className="mono text-[10.5px] uppercase tracking-[0.2em] text-[#e76f51] mb-3">Arrear Tracker</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Pending payments across mills
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI testId="arr-kpi-pending" label="Total Pending" value={fmt.crore(s.total_pending_cr)} sub="This season" tone="ink" />
        <KPI testId="arr-kpi-paid" label="Total Paid" value={fmt.crore(s.total_paid_cr)} tone="mint" />
        <KPI testId="arr-kpi-pct" label="Payment %" value={fmt.pct(s.payment_pct)} sub="Statutory: 14d" tone="lime" />
        <KPI testId="arr-kpi-delay" label="Avg Delay" value={`${s.avg_delay_days || 0} d`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard testId="arr-trend-chart" title="Statewide Arrear Trend" subtitle="₹ Cr, season-wise">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend.data || []} margin={{ top: 4, right: 6, left: -8, bottom: 4 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#0b1712" }} />
              <Line dataKey="arrear_cr" name="Arrear ₹Cr" stroke="#e76f51" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line dataKey="paid_cr" name="Paid ₹Cr" stroke="#187a4c" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard testId="arr-dist-chart" title="Arrears by District" subtitle="₹ Cr pending">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDist.data || []} margin={{ top: 4, right: 6, left: -8, bottom: 40 }}>
              <CartesianGrid stroke="rgba(11,23,18,.07)" vertical={false} />
              <XAxis dataKey="district" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="pending_cr" fill="#e76f51" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="gcard overflow-hidden">
        <div className="p-4 border-b border-[#0b1712]/08">
          <div className="mono text-[10px] uppercase tracking-widest text-[#0b1712]/65">Worst Arrear Mills</div>
          <div className="text-[14px] font-semibold">Top 15 mills by pending amount</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full gtable text-[12.5px]">
            <thead className="bg-[#0b1712] text-[#f7f4ec]">
              <tr>
                {["Mill", "District", "Type", "Pending ₹Cr", "Paid ₹Cr", "Delay", "Pay Eff %", "Health"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 mono text-[10px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(worst.data || []).map((m) => (
                <tr key={m.id} className="border-t border-[#0b1712]/06">
                  <td className="px-3 py-2.5 font-semibold">{m.name}</td>
                  <td className="px-3 py-2.5">{m.district_name}</td>
                  <td className="px-3 py-2.5">{m.type}</td>
                  <td className="px-3 py-2.5 mono text-right text-[#991b1b] font-semibold">₹{m.pending_amount_cr}</td>
                  <td className="px-3 py-2.5 mono text-right">₹{m.paid_amount_cr}</td>
                  <td className="px-3 py-2.5 mono text-right">{m.avg_payment_delay_days}d</td>
                  <td className="px-3 py-2.5 mono text-right">{m.payment_efficiency}%</td>
                  <td className="px-3 py-2.5 mono text-right">{m.health_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
